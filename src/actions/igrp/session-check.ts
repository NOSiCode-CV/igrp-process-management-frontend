"use server";

import { serverSession } from "@/lib/auth";
import { isAuthBypass } from "@/lib/utilities";

/**
 * Lightweight liveness probe for the client-side {@link SessionGuard}.
 *
 * Returns `false` when the session is gone OR carries an `error` flag (the OIDC
 * refresh failed). Uses the redirect-free {@link serverSession} so the probe
 * never throws a redirect back into the client fetch — the client decides what
 * to do (navigate to /logout). This complements the server gate in
 * `getSession()`, which only fires on a fresh render/navigation: the guard
 * recovers a page the user is already sitting on when the session dies
 * mid-session (header/nav 401s, stats fall to 0, only /login used to help).
 */
export async function isSessionAlive(): Promise<boolean> {
  if (isAuthBypass()) return true;
  try {
    const session = await serverSession();
    if (!session) return false;
    const hasError =
      typeof session === "object" && "error" in session
        ? Boolean((session as { error?: unknown }).error)
        : false;
    return !hasError;
  } catch {
    // A transient error here must not log the user out — treat as "still alive"
    // and let the next tick (or the server gate on navigation) decide.
    return true;
  }
}
