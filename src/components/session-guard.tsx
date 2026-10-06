"use client";

import { useEffect, useRef } from "react";

import { isSessionAlive } from "@/actions/igrp/session-check";

const CHECK_INTERVAL_MS = 60_000;

/**
 * Client-side safety net for mid-session expiry.
 *
 * The server gate in `getSession()` only redirects on a fresh render or
 * navigation. When the OIDC refresh dies while the user is sitting on a page,
 * the shell breaks (header/nav 401s, stats fall to 0) but nothing navigates, so
 * the user is stuck until they manually visit /login. This guard polls a cheap
 * liveness probe and, once the session is confirmed dead, sends the browser to
 * /logout to complete teardown and re-authenticate. It only ever redirects on a
 * confirmed-dead session, so a healthy session is never disturbed.
 */
export function SessionGuard({ basePath = "" }: { basePath?: string }) {
  const redirecting = useRef(false);

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (redirecting.current || document.hidden) return;
      let alive = true;
      try {
        alive = await isSessionAlive();
      } catch {
        return; // transient — decide on the next tick
      }
      if (!alive && active && !redirecting.current) {
        redirecting.current = true;
        window.location.assign(`${basePath}/logout`);
      }
    };

    const id = setInterval(check, CHECK_INTERVAL_MS);
    const onFocus = () => {
      void check();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      active = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [basePath]);

  return null;
}
