import { auth } from "@/lib/auth";
import { decodeIgrpClaims } from "@igrp/framework-next-auth/claims";
import type { IGRPAccessClaims } from "@igrp/framework-next-auth/claims";

/**
 * Decode the current session's IGRP access-token claims (roles / permissions /
 * org / isSuperAdmin) server-side. Returns null when there is no session token
 * or the token can't be decoded — callers should treat that as "no elevated
 * access" rather than failing.
 */
export async function getIgrpClaims(): Promise<IGRPAccessClaims | null> {
  const token = await auth.getAccessToken();
  const accessToken = token?.accessToken;
  if (!accessToken) return null;
  try {
    return decodeIgrpClaims(accessToken);
  } catch {
    return null;
  }
}

/**
 * True when the current user is an IGRP super admin. Super admins bypass
 * access-scoped filtering (e.g. `filterByCurrentUser`) and see all data.
 */
export async function isCurrentUserSuperAdmin(): Promise<boolean> {
  const claims = await getIgrpClaims();
  return claims?.isSuperAdmin === true;
}
