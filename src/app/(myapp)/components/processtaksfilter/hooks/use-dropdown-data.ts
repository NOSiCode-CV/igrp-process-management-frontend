import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAreas } from "../../../client/area";
import { getAreaProcesses } from "../../../client/area-process";
import { getProcessInstancesStatus } from "../../../client/process-instances";
import { VariableFilter } from "../../filter-data";
import { getTaskStatus } from "@/app/(myapp)/client/task";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownOptions {
  areas: DropdownOption[];
  subareas: DropdownOption[];
  processTypes: DropdownOption[];
  statuses: DropdownOption[];
  organics: DropdownOption[];
  users: DropdownOption[];
}

export interface FilterState {
  areaId: string;
  subareaId: string;
  processType: string;
  processNumber: string;
  status: string;
  dateFrom: string | null;
  dateTo: string | null;
  organic: string;
  user: string;
  variables: VariableFilter[];
  isProcess?: boolean;
}

export function useDropdownData(filters: FilterState, isProcess?: boolean) {
  // Load areas and statuses
  const { data: areasData } = useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const areasResponse = await getAreas({});
      return areasResponse.content.map((area) => ({
        label: area.name,
        value: area.id,
      }));
    },
  });

  const { data: statusesData } = useQuery({
    queryKey: isProcess ? ["process-instances-status"] : ["task-status"],
    queryFn: () => (isProcess ? getProcessInstancesStatus() : getTaskStatus()),
  });

  // Load subareas when area is selected
  const { data: subareasData } = useQuery({
    queryKey: ["subareas", filters.areaId],
    queryFn: async () => {
      if (!filters.areaId) return [];
      const subareasResponse = await getAreas({ parentId: filters.areaId });
      return subareasResponse.content.map((subarea) => ({
        label: subarea.name,
        value: subarea.id,
      }));
    },
    enabled: !!filters.areaId,
  });

  // Load process types when area or subarea is selected
  const { data: processTypesData } = useQuery({
    queryKey: ["process-types", filters.areaId, filters.subareaId],
    queryFn: async () => {
      if (!filters.areaId) return [];

      // Use the most specific scope: the subarea when selected, otherwise the
      // area. Merging both would surface the parent area's processes while a
      // subarea is selected, which looks like processes from other areas.
      const scopeId = filters.subareaId || filters.areaId;
      const response = await getAreaProcesses(scopeId);
      const processes = response.content || [];

      // Remove duplicates based on processKey
      const uniqueProcesses = processes.filter(
        (process, index, self) =>
          index === self.findIndex((p) => p.processKey === process.processKey),
      );

      return uniqueProcesses.map((process) => ({
        label: process.name || process.processKey || "Processo sem nome",
        value: process.processKey,
      }));
    },
    enabled: !!filters.areaId,
  });

  // Combine all dropdown options
  const dropdownOptions = useMemo<DropdownOptions>(
    () => ({
      areas: areasData || [],
      subareas: subareasData || [],
      processTypes: processTypesData || [],
      statuses: statusesData || [],
      organics: [],
      users: [],
    }),
    [areasData, subareasData, processTypesData, statusesData],
  );

  return {
    dropdownOptions,
  };
}
