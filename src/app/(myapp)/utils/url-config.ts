/**
 * Centralized URL configuration for process management
 */

import { getApplication } from "../access-management/applications";
import { getProcessExecutionBaseUrl } from "./runtime-config";

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
   * Build URL for process instance execution
   * @param procReleaseKey - Process release key
   * @param processInstanceId - Process instance ID
   * @returns Complete URL for process instance
   */
  buildProcessInstanceUrl: async (
    processInstanceId: string,
    applicationBase: string,
    processKey: string,
  ): Promise<string> => {
    const runtimeBaseUrl = await getProcessExecutionBaseUrl();
    if (runtimeBaseUrl) {
      return `${runtimeBaseUrl}/process/view/${processKey}/${processInstanceId}`;
    }
    const application = await getApplication(applicationBase);
    const { slug, url } = application;

    const href = slug ? formatSlug(slug) : (url ?? "");

    return `${href}/process/view/${processKey}/${processInstanceId}`;
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
    const runtimeBaseUrl = await getProcessExecutionBaseUrl();
    if (runtimeBaseUrl) {
      return `${runtimeBaseUrl}/process/${procReleaseKey}/${processInstanceId}/${taskKey}/${taskId}`;
    }
    const application = await getApplication(applicationBase);
    const { slug, url } = application;

    const href = slug ? formatSlug(slug) : (url ?? "");

    return `${href}/process/${procReleaseKey}/${processInstanceId}/${taskKey}/${taskId}`;
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
  PROCESS_INSTANCE: "/process/{procReleaseKey}/{processInstanceId}",
  TASK_EXECUTION:
    "/process/{procReleaseKey}/{processInstanceId}/{taskKey}/{taskId}",
} as const;

export default urlConfig;
