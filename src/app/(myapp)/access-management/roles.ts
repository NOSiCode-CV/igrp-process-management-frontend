"use server";

// Build stub — the real `@igrp/platform-access-management-client-ts` was dropped
// in the 0.2 migration. See access-management-client.stub.ts.
import {
  AccessManagementClient,
  RoleDTO,
} from "./access-management-client.stub";

/**
 * A selectable candidate group derived from access-management.
 * `value` is the canonical group string stored in the candidate-groups CSV.
 */
export interface BusinessGroupOption {
  value: string; // `${departmentCode}.${roleCode}`
  name: string; // human-readable role name (falls back to the role code)
  departmentCode: string;
  departmentName: string;
}

/**
 * Whether access-management is wired in this installation. Controlled by the
 * API URL: if it is not set, we don't call the API and the UI falls back to the
 * free-text custom group input.
 */
function isAccessManagementEnabled(): boolean {
  return !!process.env.IGRP_ACCESS_MANAGEMENT_API;
}

/**
 * Access-management client configured for the machine-to-machine endpoints
 * (`/api/m2m/**`). Authenticates via OAuth2 `client_credentials` — the client
 * fetches/caches a bearer token from `{baseUrl}/oauth2/token` using the M2M
 * client id + secret (access-management-client 0.2). `serviceId` is sent as
 * the `X-Machine-Service-ID` header.
 */
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
 * All `DEPARTMENT.ROLE` candidate groups for this business, fetched in a SINGLE
 * M2M request (`POST /api/m2m/roles`) instead of fanning out one call per
 * department. Returns an empty list when access-management is not configured.
 */
export async function getDepartmentRoles(): Promise<BusinessGroupOption[]> {
  if (!isAccessManagementEnabled()) return [];

  const client = getM2MClient();

  // `identifiers` filters roles by code (IN clause); an empty list means "no
  // code filter" → all roles the M2M service is scoped to see. The business
  // scoping is enforced server-side from the service's permissions, not here.
  const result = await client.m2m.getRolesForBusiness([], {
    activeOnly: true,
    includeChildrenRoles: true,
  });
  const roles = (result.data as RoleDTO[]) ?? [];

  return roles.map<BusinessGroupOption>((role) => ({
    value: `${role.departmentCode}.${role.code}`,
    name: role.name ?? role.code,
    departmentCode: role.departmentCode,
    departmentName: role.departmentCode,
  }));
}
