"use server";

import {
  AccessManagementClient,
  type IGRPUserDTO,
} from "@igrp/platform-access-management-client-ts";

export interface BusinessUserOption {
  value: string; // user id (assignee identity used by the API)
  label: string; // `${name} (${email})` — email is display-only
}

type BusinessUser = IGRPUserDTO & { externalId?: string };

/**
 * Verbose server-side logging. Toggle with `IGRP_DEBUG_CLIENT=true`
 * (.env.local). Logs print to the Next server terminal.
 */
const DEBUG = process.env.IGRP_DEBUG_CLIENT === "true";

function isAccessManagementEnabled(): boolean {
  return !!process.env.IGRP_ACCESS_MANAGEMENT_API;
}

function getM2MClient(): AccessManagementClient {
  return AccessManagementClient.create(
    { baseUrl: process.env.IGRP_ACCESS_MANAGEMENT_API || "" },
    {
      clientId: process.env.IGRP_M2M_CLIENT_ID || "",
      clientSecret: process.env.IGRP_M2M_CLIENT_SECRET || "",
      serviceId: process.env.IGRP_SERVICE_ID || "",
    },
  );
}

function toUserOptions(users: BusinessUser[]): BusinessUserOption[] {
  return users
    .filter((user) => user.id != null)
    .map<BusinessUserOption>((user) => {
      // `name` can be null; fall back to username, then email, to avoid "null (…)".
      const displayName = user.name || user.username || user.email;
      return {
        value: String(user.id),
        label:
          displayName === user.email
            ? user.email
            : `${displayName} (${user.email})`,
      };
    });
}

/**
 * Assignable users for the "Atribuir Tarefa" picker.
 *
 * When `candidateGroups` is given (comma-separated group codes, as stored on a
 * task), the list is scoped to users who belong to those candidate groups —
 * i.e. users who can actually perform the task — instead of every user of the
 * application. A user with, say, only an `admin` profile that is not a
 * candidate for the process no longer shows up.
 *
 * A candidate group is stored as `DEPARTMENT.ROLE` (e.g. `DSIP.ATENDEDOR`);
 * the users endpoint filters by a `departmentCode` + `roleCode` pair, so we
 * split on the first dot, fan out one request per group, and union the results
 * by user id. A group without a dot is treated as a bare `roleCode`. A group
 * that resolves to no users (or fails) simply contributes nothing — it never
 * drops the whole list.
 *
 * Without `candidateGroups` the list falls back to all of the application's
 * users (scoped by `applicationCode`) — the previous behaviour, still used by
 * the process-tasks filter. Returns an empty list when access-management is not
 * configured.
 */
export async function getBusinessUsers(
  candidateGroups?: string,
): Promise<BusinessUserOption[]> {
  if (!isAccessManagementEnabled()) return [];

  const client = getM2MClient();
  const applicationCode = process.env.IGRP_APP_CODE || "";

  const groups = (candidateGroups || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  // No candidate groups → list all application users (the users endpoint
  // requires at least one filter; applicationCode is always available).
  if (groups.length === 0) {
    const query = { activeOnly: true, applicationCode };
    if (DEBUG) {
      console.log(
        "[access-management/users][getBusinessUsers] → request (all)",
        query,
      );
    }
    const result = await client.m2m.getUsersForBusiness([], query);
    const users = (result.data as BusinessUser[]) ?? [];
    if (DEBUG) {
      console.log(
        "[access-management/users][getBusinessUsers] ← response (all)",
        {
          status: result.status,
          count: users.length,
        },
      );
    }
    return toUserOptions(users);
  }

  // Candidate groups → one request per group (departmentCode + roleCode),
  // unioned by user id.
  if (DEBUG) {
    console.log(
      "[access-management/users][getBusinessUsers] → request (scoped)",
      {
        applicationCode,
        groups,
      },
    );
  }
  const perGroup = await Promise.all(
    groups.map((group) => {
      // "DEPARTMENT.ROLE" → { departmentCode, roleCode }; a dot-less group is a
      // bare role. The role may itself contain dots, so split only on the first.
      const dot = group.indexOf(".");
      const query =
        dot > 0
          ? {
              activeOnly: true,
              departmentCode: group.slice(0, dot),
              roleCode: group.slice(dot + 1),
            }
          : { activeOnly: true, roleCode: group };
      return client.m2m
        .getUsersForBusiness([], query)
        .then((r) => {
          if (DEBUG) {
            console.log(
              "[access-management/users][getBusinessUsers] group result",
              {
                group,
                status: r.status,
                count: (r.data as BusinessUser[])?.length ?? 0,
              },
            );
          }
          return (r.data as BusinessUser[]) ?? [];
        })
        .catch((error) => {
          // A single bad/unknown group must not blank out the whole picker.
          if (DEBUG) {
            console.warn(
              "[access-management/users][getBusinessUsers] group query failed",
              { group, error: error?.message ?? String(error) },
            );
          }
          return [] as BusinessUser[];
        });
    }),
  );

  const byId = new Map<string, BusinessUser>();
  perGroup.flat().forEach((user) => {
    if (user.id != null) byId.set(String(user.id), user);
  });
  const options = toUserOptions([...byId.values()]);
  if (DEBUG) {
    console.log(
      "[access-management/users][getBusinessUsers] ← options (scoped)",
      {
        count: options.length,
      },
    );
  }
  return options;
}
