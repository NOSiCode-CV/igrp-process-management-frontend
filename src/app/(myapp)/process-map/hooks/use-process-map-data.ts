import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { keepLatestByKey } from "../utils/versioning";
import { getAreas, getSubareas } from "@/app/(myapp)/client/area";
import { ExtendedArea } from "../types";
import {
  getAllAreasFlat,
  organizeAreasHierarchy,
} from "../utils/area-hierarchy";
import { getProcessDefinitionPriorities } from "../../client/process";

const PROCESS_MAP_AREAS_QUERY_KEY = ["process-map-areas"] as const;

const sortByName = (a: { name?: string }, b: { name?: string }) =>
  (a.name ?? "").localeCompare(b.name ?? "", undefined, {
    sensitivity: "base",
  });

async function fetchAreaWithSubareas(
  area: ExtendedArea,
): Promise<ExtendedArea> {
  const normalized: ExtendedArea = {
    ...area,
    process: area.process
      ? keepLatestByKey(
          area.process?.filter((process) => process.status === "ACTIVE"),
        )
      : undefined,
    subareas: [],
  };

  const subareasResponse = await getSubareas(area.id);
  if (subareasResponse.length > 0) {
    normalized.subareas = await Promise.all(
      subareasResponse.map((sa) => fetchAreaWithSubareas(sa)),
    );
    normalized.subareas.sort(sortByName);
  }

  return normalized;
}

async function fetchProcessMapAreas(): Promise<ExtendedArea[]> {
  const areasResponse = await getAreas({});
  const topLevelAreas =
    areasResponse.content?.filter((area) => !area.areaId) || [];

  const fullHierarchy = await Promise.all(
    topLevelAreas.map((area) => fetchAreaWithSubareas(area)),
  );
  return fullHierarchy.sort(sortByName);
}

export function useProcessMapData() {
  const queryClient = useQueryClient();

  const {
    data: queryData,
    isPending,
    isFetching,
    error: queryError,
  } = useQuery({
    queryKey: PROCESS_MAP_AREAS_QUERY_KEY,
    queryFn: fetchProcessMapAreas,
    staleTime: 60_000,
    retryDelay: 1000,
  });

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? "Failed to load process map data"
        : undefined;

  const loadedNodes = useMemo(() => {
    const flatAreas = getAllAreasFlat(queryData ?? []);
    return new Set(flatAreas.map((a) => a.id));
  }, [queryData]);

  const areas = useMemo(() => {
    const base = queryData ?? [];
    const flatAreas = getAllAreasFlat(base);
    const hierarchy = organizeAreasHierarchy(flatAreas);
    return [...hierarchy].sort(sortByName);
  }, [queryData]);

  const refreshData = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: PROCESS_MAP_AREAS_QUERY_KEY,
    });
  }, [queryClient]);

  const loadSubareas = useCallback(async (_parentAreaId: string) => {
    // No-op: all data is loaded upfront in fetchProcessMapAreas
  }, []);

  return {
    areas,
    loadedNodes,
    loading: isPending || isFetching,
    error,
    loadSubareas,
    refreshData,
  };
}
