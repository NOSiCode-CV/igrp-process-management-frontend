import { AccessManagementClient } from "./access-management-client.stub";

import { auth } from "@/lib/auth";

/**
 * Builds a fresh AccessManagementClient per call with the current user's token.
 *
 * We intentionally do NOT use the framework's `igrpSetAccessClientConfig` /
 * `igrpGetAccessClient` here: that config is module-global and shared across
 * concurrent server requests, so a bearer token could leak between users. The
 * framework's own internal clients (menus, etc.) are configured separately in
 * `src/actions/igrp/auth.ts` and are unaffected by this.
 */
export async function getClientAccess(): Promise<AccessManagementClient> {
  const baseUrl = process.env.IGRP_ACCESS_MANAGEMENT_API || "";
  const token = await auth.getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token?.accessToken) {
    headers.Authorization = `Bearer ${token.accessToken}`;
  }

  return AccessManagementClient.create({ baseUrl, headers });
}
