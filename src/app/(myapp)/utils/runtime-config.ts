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
 * When unset, callers resolve the target app from Access Management
 * (`applicationBase` → slug/url). Do not set this to a bare gateway host
 * (e.g. `https://apps-test.inss.gw`) — it must include the owning app prefix
 * (e.g. `https://apps-test.inss.gw/apps/core`) or be left empty.
 */
export async function getProcessExecutionBaseUrl(): Promise<string> {
  const resolved = (process.env.IGRP_PROCESS_EXECUTION_URL || "").trim();

  // Temporary cluster diagnostics: empty → Access Management slug path.
  console.log("[runtime-config:discover] process-execution-base-url", {
    IGRP_PROCESS_EXECUTION_URL: resolved,
    source: resolved ? "IGRP_PROCESS_EXECUTION_URL" : "none",
  });

  return resolved;
}
