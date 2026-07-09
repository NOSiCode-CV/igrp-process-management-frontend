import { ProcessManagementClient } from "@igrp/platform-process-management-client-ts";

import { auth } from "@/lib/auth";

import { getIGRPProcessClientConfig } from "./api-config";

export async function getIGRPProcessClient(): Promise<ProcessManagementClient> {
  const { baseUrl, timeout } = getIGRPProcessClientConfig();

  // The framework refreshes the OIDC access token inside the NextAuth `jwt`
  // callback, so the JWT returned here is already current. A failed refresh is
  // surfaced via `token.error` rather than requiring a manual refresh call.
  const token = await auth.getAccessToken();

  // --- DEBUG: is the token being obtained/sent? (mask the value) ---
  const at = token?.accessToken;
  console.log("[API Client][debug] token", {
    baseUrl,
    hasToken: !!token,
    tokenError: token?.error ?? null,
    hasAccessToken: !!at,
    accessTokenPreview: at
      ? `${at.slice(0, 12)}…${at.slice(-6)} (len ${at.length})`
      : null,
    expiresAt: token?.expiresAt ?? null,
  });
  // -----------------------------------------------------------------

  // Check if token is missing
  if (!token) {
    console.error("[API Client] No token available");
    throw new Error("Authentication token not available");
  }

  // Refresh failed upstream (in the jwt callback) — treat as unauthenticated.
  if (token.error) {
    console.error("[API Client] Failed to refresh token:", token.error);
    throw new Error("Failed to refresh authentication token");
  }

  // Ensure we have an access token
  if (!token.accessToken) {
    console.error("[API Client] No access token in token object");
    throw new Error("Access token not available");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token.accessToken}`,
  };

  // --- DEBUG: confirm the Authorization header is attached to the client ---
  console.log("[API Client][debug] headers", {
    baseUrl,
    hasAuthorization: !!headers.Authorization,
    authorizationPreview: `Bearer ${token.accessToken.slice(0, 12)}…`,
  });
  // ------------------------------------------------------------------------

  // Build a fresh client per call. Never cache at module scope: in Next.js the
  // module is shared across all requests/users, so a cached client would leak
  // one user's bearer token to another.
  return ProcessManagementClient.create({ baseUrl, timeout, headers });
}
