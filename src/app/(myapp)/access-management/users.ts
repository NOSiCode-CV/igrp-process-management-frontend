"use server";

import {
  AccessManagementClient,
  IGRPUserDTO,
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

/**
 * All users the M2M service is scoped to see, in a SINGLE request
 * (`POST /api/m2m/users`). Empty `identifiers` means "no filter". Returns an
 * empty list when access-management is not configured.
 */
export async function getBusinessUsers(): Promise<BusinessUserOption[]> {
  if (!isAccessManagementEnabled()) return [];

  const client = getM2MClient();
  // The users endpoint requires at least one filter (applicationCode,
  // departmentCode, roleCode or permissionName). Scope to this application's
  // users via applicationCode (always available from env).
  const query = {
    activeOnly: true,
    applicationCode: process.env.IGRP_APP_CODE || "",
  };
  if (DEBUG) {
    console.log("[access-management/users][getBusinessUsers] → request", query);
  }
  const result = await client.m2m.getUsersForBusiness([], query);
  const users = (result.data as BusinessUser[]) ?? [];
  if (DEBUG) {
    console.log("[access-management/users][getBusinessUsers] ← response", {
      status: result.status,
      count: users.length,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        externalId: u.externalId,
        status: u.status,
      })),
    });
  }

  const options = users
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
  if (DEBUG) {
    console.log("[access-management/users][getBusinessUsers] ← options", {
      count: options.length,
      options,
    });
  }
  return options;
}
