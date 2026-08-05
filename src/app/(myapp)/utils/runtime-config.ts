"use server";

/**
 * Base URL of the process runtime/execution app — where BPMN processes and
 * task forms actually run, and where this app redirects on "view process" /
 * task completion.
 *
 * Read SERVER-SIDE at request time (no `NEXT_PUBLIC_` prefix), so a single
 * Docker image works across environments: the value comes from the container
 * env at runtime instead of being inlined into the client bundle at build time.
 *
 * Falls back to the legacy `NEXT_PUBLIC_APP_BASE_RUNTIME_URL` for backward
 * compatibility. Returns "" when unset (callers then resolve the target app
 * from Access Management).
 */
export async function getProcessExecutionBaseUrl(): Promise<string> {
  const runtimeUrl = process.env.IGRP_PROCESS_EXECUTION_URL || "";
  const legacyUrl = process.env.NEXT_PUBLIC_APP_BASE_RUNTIME_URL || "";
  const resolved = runtimeUrl || legacyUrl;

  // Temporary cluster diagnostics: an empty value here makes callers fall back
  // to the Access Management slug, which is where wrong app routes come from.
  console.log("[runtime-config:discover] process-execution-base-url", {
    IGRP_PROCESS_EXECUTION_URL: runtimeUrl,
    NEXT_PUBLIC_APP_BASE_RUNTIME_URL: legacyUrl,
    resolved,
    source: runtimeUrl
      ? "IGRP_PROCESS_EXECUTION_URL"
      : legacyUrl
        ? "NEXT_PUBLIC_APP_BASE_RUNTIME_URL"
        : "none",
  });

  return resolved;
}
