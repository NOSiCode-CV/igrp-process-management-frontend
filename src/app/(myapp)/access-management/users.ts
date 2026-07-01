"use server";

import {
  AccessManagementClient,
  IGRPUserDTO,
} from "@igrp/platform-access-management-client-ts";

export interface BusinessUserOption {
  value: string; // user email (the identifier used by the assign API)
  label: string; // `${name} (${email})`
}

function isAccessManagementEnabled(): boolean {
  return !!process.env.IGRP_ACCESS_MANAGEMENT_API;
}

function getM2MClient(): AccessManagementClient {
  return AccessManagementClient.create(
    { baseUrl: process.env.IGRP_ACCESS_MANAGEMENT_API || "" },
    {
      serviceId: process.env.IGRP_M2M_SERVICE_ID || "",
      token: process.env.IGRP_M2M_TOKEN || "",
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
  const result = await client.m2m.getUsersForBusiness([], {
    activeOnly: true,
    applicationCode: process.env.IGRP_APP_CODE || "",
  });
  const users = (result.data as IGRPUserDTO[]) ?? [];

  return users.map<BusinessUserOption>((user) => {
    // `name` can be null; fall back to username, then email, to avoid "null (…)".
    const displayName = user.name || user.username || user.email;
    return {
      value: user.email,
      label:
        displayName === user.email
          ? user.email
          : `${displayName} (${user.email})`,
    };
  });
}
