import { ProcessManagementClient } from "@igrp/platform-process-management-client-ts";
import { getIGRPProcessClientConfig } from "./api-config";
import { getAccessToken, refreshAccessToken } from "./auth-helpers";

export async function getIGRPProcessClient(): Promise<ProcessManagementClient> {
  const { baseUrl, timeout } = getIGRPProcessClientConfig();

  let token = await getAccessToken();

  // Check if token is missing or expired
  if (!token) {
    console.error("[API Client] No token available");
    throw new Error("Authentication token not available");
  }

  // Check if token is expired and refresh if needed
  if (token.expiresAt && token.expiresAt < Date.now()) {
    console.log("[API Client] Token expired, refreshing...");
    token = await refreshAccessToken(token);

    if (token.error) {
      console.error("[API Client] Failed to refresh token:", token.error);
      throw new Error("Failed to refresh authentication token");
    }
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

  // Build a fresh client per call. Never cache at module scope: in Next.js the
  // module is shared across all requests/users, so a cached client would leak
  // one user's bearer token to another.
  return ProcessManagementClient.create({ baseUrl, timeout, headers });
}
