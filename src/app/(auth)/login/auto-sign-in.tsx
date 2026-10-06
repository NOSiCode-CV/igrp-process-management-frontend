"use client";

import { signIn } from "@igrp/framework-next-auth/client";
import { IGRPTemplateLoading } from "@igrp/framework-next-ui";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { reportError } from "@/lib/report-error";

/**
 * Auto sign-in on /login.
 *
 * Every co-hosted app writes its own basePath-scoped session cookie
 * (`@igrp/framework-next-auth` >= 0.2.0-beta.1, `cookieIsolation: 'basePath'`),
 * so the first visit to each app has no local session even though the IdP
 * (Keycloak) still holds the SSO session. Instead of making the user click
 * "Entrar" only to be bounced straight back, start the OIDC round-trip
 * immediately — with a live SSO session it is invisible.
 *
 * Loop guard: if the round-trip "succeeds" but the app still lands back on
 * /login (e.g. a session cookie the middleware cannot read — secret/basePath
 * mismatch between containers), auto sign-in would ping-pong with the IdP
 * forever. Each attempt is timestamped in sessionStorage; a second arrival
 * within the window renders the manual form (`fallback`) instead. The window
 * must stay longer than one full round-trip (app → IdP → app → /login), or a
 * slow loop would never be caught. Do not clear the timestamp when the
 * protected shell mounts: the shell hydrates before a streamed Access
 * Management 401/403 redirect arrives, so clearing there disables the guard
 * in exactly the loop it exists for.
 *
 * The key is scoped per app: co-hosted apps share one origin (they differ only
 * by basePath), and therefore one sessionStorage. With a shared key, signing in
 * to one app and switching to another within the window tripped the guard in
 * the second app.
 */
const ATTEMPT_KEY = `igrp:auto-signin-at:${
  process.env.NEXT_PUBLIC_BASE_PATH ||
  process.env.NEXT_PUBLIC_IGRP_APP_CODE ||
  "/"
}`;
const LOOP_WINDOW_MS = 10_000;

function readLastAttempt(): number {
  try {
    return Number(sessionStorage.getItem(ATTEMPT_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeAttempt(): void {
  try {
    sessionStorage.setItem(ATTEMPT_KEY, String(Date.now()));
  } catch {
    // Storage blocked (private mode) — no loop guard, still sign in.
  }
}

export function AutoSignIn({
  providerId,
  callbackUrl,
  fallback,
}: {
  providerId: string;
  callbackUrl: string;
  fallback: ReactNode;
}) {
  const startedRef = useRef(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Strict Mode re-fires effects in dev; the redirect must start once.
    if (startedRef.current) return;
    startedRef.current = true;

    if (Date.now() - readLastAttempt() < LOOP_WINDOW_MS) {
      console.warn(
        "[login][auto-signin] returned to /login right after an auto sign-in — showing the manual form to avoid a redirect loop",
      );
      setShowFallback(true);
      return;
    }

    writeAttempt();
    signIn(providerId, { callbackUrl }).catch((error: unknown) => {
      console.error("[login][auto-signin] signIn failed", error);
      reportError(error, { segment: "(auth)/login:auto-sign-in" });
      setShowFallback(true);
    });
  }, [providerId, callbackUrl]);

  if (showFallback) return <>{fallback}</>;

  return (
    <IGRPTemplateLoading
      text="A iniciar sessão..."
      appCode={process.env.NEXT_PUBLIC_IGRP_APP_CODE}
    />
  );
}
