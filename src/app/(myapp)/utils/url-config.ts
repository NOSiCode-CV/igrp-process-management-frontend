/**
 * Centralized URL configuration for process management
 */

import { getApplication } from "../access-management/applications";
import { getProcessExecutionBaseUrl } from "./runtime-config";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Temporary cluster diagnostics: the target app prefix is resolved from
// IGRP_PROCESS_EXECUTION_URL (when set) or the Access Management slug. A wrong
// override only shows up as a 404 on the redirect — grep for this tag.
const LOG_TAG = "[url-config:discover]";

function logDiscovery(step: string, data: Record<string, unknown>): void {
  console.log(LOG_TAG, step, {
    ...data,
    // Which screen triggered the build (my-tasks, task-management, …).
    calledFrom:
      typeof window === "undefined" ? "server" : window.location.pathname,
  });
}

function assertProcessInstanceUuid(value: string): string {
  const trimmed = value.trim();
  if (!UUID_RE.test(trimmed)) {
    throw new Error(
      `Invalid processInstanceId for consultation route: "${value}". Expected UUID.`,
    );
  }
  return trimmed;
}

/**
 * Resolve the target app prefix for a process route.
 *
 * The runtime override wins; otherwise the app is looked up in Access
 * Management by `applicationBase` (the app that owns the process). Without it
 * the route would be built against this app's own origin and 404.
 */
async function resolveAppHref(applicationBase: string): Promise<string> {
  const runtimeBaseUrl = await getProcessExecutionBaseUrl();

  logDiscovery("resolveAppHref:input", {
    applicationBase,
    runtimeBaseUrl,
    source: runtimeBaseUrl ? "runtime-env" : "access-management",
  });

  if (runtimeBaseUrl) return runtimeBaseUrl;

  const appCode = (applicationBase ?? "").trim();
  if (!appCode) {
    logDiscovery("resolveAppHref:missing-application-base", {
      applicationBase,
    });
    throw new Error(
      "applicationBase em falta: não é possível resolver a aplicação do processo.",
    );
  }
  const application = await getApplication(appCode);
  const { slug, url } = application;
  const href = slug ? formatSlug(slug) : (url ?? "");

  logDiscovery("resolveAppHref:resolved", {
    appCode,
    slug,
    url,
    href,
    usedFallbackUrl: !slug,
  });

  return href;
}

export function formatSlug(slug: string): string {
  let baseUrl = "";
  if (slug.startsWith("/apps")) {
    baseUrl = slug;
  } else {
    baseUrl = `/apps/${slug}`;
  }

  // Check if baseUrl is already a full URL
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return baseUrl;
  }

  // If it's a relative path, construct a full URL using the current origin
  // In browser context, use window.location.origin; otherwise return as relative path
  if (typeof window !== "undefined" && window.location) {
    return `${window.location.origin}${baseUrl}`;
  }

  // Server-side or fallback: return relative path (will work with Next.js router)
  return baseUrl;
}

/**
 * URL builders for process management
 */
export const urlConfig = {
  /**
   * Build URL for process instance consultation (read-only).
   * Route: /process/view/{processInstanceId}
   * Requires process instance UUID.
   */
  buildProcessInstanceUrl: async (
    processInstanceId: string,
    applicationBase: string,
  ): Promise<string> => {
    const safeProcessInstanceId = assertProcessInstanceUuid(processInstanceId);
    const href = await resolveAppHref(applicationBase);
    const target = `${href}/process/view/${safeProcessInstanceId}`;

    logDiscovery("buildProcessInstanceUrl", {
      processInstanceId: safeProcessInstanceId,
      applicationBase,
      href,
      target,
    });

    return target;
  },

  /**
   * Build URL for task execution
   * @param procReleaseKey - Process release key
   * @param processInstanceId - Process instance ID
   * @param taskKey - Task key
   * @param taskId - Task ID
   * @returns Complete URL for task execution
   */
  buildTaskExecutionUrl: async (
    procReleaseKey: string,
    processInstanceId: string,
    taskKey: string,
    taskId: string,
    applicationBase: string,
  ): Promise<string> => {
    logDiscovery("buildTaskExecutionUrl:input", {
      procReleaseKey,
      processInstanceId,
      taskKey,
      taskId,
      applicationBase,
    });

    const href = await resolveAppHref(applicationBase);
    const target = `${href}/process/${procReleaseKey}/${processInstanceId}/${taskKey}/${taskId}`;

    logDiscovery("buildTaskExecutionUrl:target", { href, target });

    return target;
  },

  /**
   * Build URL for process runtime (generic)
   * @param segments - Array of URL segments
   * @returns Complete URL with provided segments
   */
  buildProcessUrl: async (...segments: string[]): Promise<string> => {
    const runtimeBaseUrl = await getProcessExecutionBaseUrl();

    return `${runtimeBaseUrl}/process/${segments.join("/")}`;
  },
} as const;

/**
 * URL patterns for reference
 */
export const urlPatterns = {
  PROCESS_CONSULTATION: "/process/view/{processInstanceId}",
  PROCESS_INSTANCE: "/process/{procReleaseKey}/{processInstanceId}",
  TASK_EXECUTION:
    "/process/{procReleaseKey}/{processInstanceId}/{taskKey}/{taskId}",
} as const;

export default urlConfig;
