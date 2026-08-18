import type { Process } from "@igrp/platform-process-management-types";

export function processKeyOf(
  process?: { processKey?: string | null; key?: string | null } | null,
): string {
  return (process?.processKey ?? process?.key ?? "").trim();
}

export function removeIdsOf(process: {
  id?: string | null;
  releaseId?: string | null;
}): string[] {
  const ids: string[] = [];
  for (const value of [process.id, process.releaseId]) {
    if (value && !ids.includes(value)) ids.push(value);
  }
  return ids;
}

/** Catalog `id` is the live deployment after a publish. */
export function currentReleaseId(process: {
  id?: string | null;
  releaseId?: string | null;
}): string {
  return (process.id || process.releaseId || "").trim();
}

/** Stored association points at `releaseId`, not the association uuid. */
export function storedReleaseId(process: {
  id?: string | null;
  releaseId?: string | null;
}): string {
  return (process.releaseId || process.id || "").trim();
}

export function findCatalogProcess(
  catalog: Process[],
  processKey: string,
): Process | undefined {
  const key = processKey.trim();
  if (!key) return undefined;
  return catalog.find((process) => processKeyOf(process) === key);
}

export function resolveAssociatedProcess(
  associated: Process,
  catalog: Process[],
): Process {
  const latest = findCatalogProcess(catalog, processKeyOf(associated));
  if (!latest) return associated;
  return {
    ...associated,
    name: latest.name ?? associated.name,
    version: latest.version ?? associated.version,
    description: latest.description ?? associated.description,
    applicationBase: latest.applicationBase ?? associated.applicationBase,
    status: latest.status ?? associated.status,
    releaseId: currentReleaseId(latest),
  };
}

export function isCatalogAccessible(
  associated: Process,
  catalog: Process[],
): boolean {
  const key = processKeyOf(associated);
  if (key) {
    return catalog.some((process) => processKeyOf(process) === key);
  }
  return catalog.some(
    (process) =>
      process.id === associated.releaseId || process.id === associated.id,
  );
}

export function toAssociatePayload(
  process: Process,
  catalog: Process[] = [],
): {
  processKey: string;
  releaseId: string;
  version: string;
  name: string;
} {
  const key = processKeyOf(process);
  const latest = findCatalogProcess(catalog, key) ?? process;
  return {
    processKey: key,
    releaseId: currentReleaseId(latest),
    version: latest.version ?? process.version ?? "",
    name: latest.name ?? process.name ?? key,
  };
}
