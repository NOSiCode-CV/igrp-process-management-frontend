import { useMemo } from "react";
import { useProcessInstancesData } from "./use-process-instances-data";
import {
  getProcessInstanceStatusVariant,
  ProcessInstanceStatus,
} from "../../utils/status-helpers";
import { ProcessInstanceTableRow } from "../types";
import {
  formatDuration,
  getBusinessKeyTemplate,
  getDateTemplate,
  getProcessInfo,
  getPriorityTemplate,
  getProcessStatusTemplate,
  getProgressTemplate,
} from "../../utils/columns-template";
import { useProcessPriorities } from "../../hooks/use-process-priorities";
import { routeSearchTerm } from "../../utils/search-routing";
import { format, formatDistanceToNow } from "date-fns";

export function useProcessInstances() {
  const {
    processInstancesState,
    filters,
    updateFilters,
    applyFilters,
    resetFilters,
  } = useProcessInstancesData();

  const processKeys = useMemo(() => {
    const keys = new Set<string>();
    processInstancesState.processInstances.forEach((i) => {
      if (i.procReleaseKey) keys.add(i.procReleaseKey);
    });
    return Array.from(keys);
  }, [processInstancesState.processInstances]);

  const { getPriorityBadge } = useProcessPriorities(processKeys);

  // Transform process instances to table format
  const tableData = useMemo((): ProcessInstanceTableRow[] => {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-expect-error Allow JSX in table row fields without refactor
    return processInstancesState.processInstances.map((instance) => {
      // Calculate days since creation
      const createdDate = new Date(instance.startedAt);
      const now = instance.endedAt ? new Date(instance.endedAt) : new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const priorityValue = instance.priority;

      const startedBy =
        instance.userProfileStartedBy?.fullName || instance.startedBy;

      return {
        processInfo: getProcessInfo(instance.name, instance.number),
        createBy: undefined,
        daysWaiting:
          diffTime > 0
            ? formatDuration(diffTime)
            : formatDistanceToNow(instance.startedAt, { addSuffix: false }),
        version: `v${instance.version}`,
        startedAt: format(instance.startedAt, "dd MMM, HH:mm"),
        endedAt: getDateTemplate(instance.endedAt),
        progress: getProgressTemplate(
          instance.progress,
          instance.status as ProcessInstanceStatus,
        ),
        priority: getPriorityTemplate(
          getPriorityBadge(
            instance.procReleaseKey,
            priorityValue != null ? String(priorityValue) : "",
          ),
          priorityValue,
        ),
        status: getProcessStatusTemplate(
          instance.status as ProcessInstanceStatus,
        ),
        processInstanceId: instance.id,
        procReleaseKey: instance.procReleaseKey,
        startedBy: startedBy,
        statusDesc: instance.statusDesc,
        businessKey: getBusinessKeyTemplate(instance.businessKey ?? ""),
      };
    });
  }, [processInstancesState.processInstances, getPriorityBadge]);

  const handleSearch = (searchTerm: string) => {
    // Route the free-text box to instance name OR process number.
    // (previously wrote into `processType` → procReleaseKey, which broke the
    // search and corrupted the "Tipo Processo" combo.)
    updateFilters(routeSearchTerm(searchTerm));
  };

  return {
    // Data
    tableData,
    loading: processInstancesState.loading,
    error: processInstancesState.error,

    // Filter values
    filters,

    // Actions
    handleSearch,
    applyFilters,
    resetFilters,
    updateFilters,
    getStatusVariant: getProcessInstanceStatusVariant,
  };
}
