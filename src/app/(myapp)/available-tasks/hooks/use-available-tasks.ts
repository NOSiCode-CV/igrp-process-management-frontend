import { useMemo, useCallback, useRef } from "react";
import { useAvailableTasksData } from "./use-available-tasks-data";
import { claimTask } from "../../client/task";
import { TaskTableRow } from "../types";
import {
  getProcessInfo,
  getPriorityTemplate,
  getUserInfo,
} from "../../utils/columns-template";
import { useProcessPriorities } from "../../hooks/use-process-priorities";
import { format, formatDistanceToNow } from "date-fns";
import { formatDuration } from "../../utils/shared";

export function useAvailableTasks() {
  const {
    tasksState,
    filters,
    updateFilters,
    applyFilters,
    resetFilters,
    fetchTasks,
    refetchTasks,
  } = useAvailableTasksData();

  const processKeys = useMemo(() => {
    const keys = new Set<string>();
    tasksState.tasks.forEach((t) => {
      if (t.processKey) keys.add(t.processKey);
    });
    return Array.from(keys);
  }, [tasksState.tasks]);

  const { getPriorityBadge } = useProcessPriorities(processKeys);

  // Transform tasks to table format
  const tableData = useMemo((): TaskTableRow[] => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error Allow JSX in table row fields without refactor
    return tasksState.tasks.map((task) => {
      const createdDate = new Date(task.startedAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const priorityValue = task.priority + "";

      return {
        processInfo: getProcessInfo(task.processName, task.processNumber),
        processNumber: task.processNumber,
        startedAt: format(task.startedAt, "dd MMM, HH:mm"),
        endAt: null,
        createBy: getUserInfo(task.assignedBy),
        taskName: task.name,
        status: task.status,
        duration:
          diffTime > 0
            ? formatDuration(diffTime)
            : formatDistanceToNow(task.startedAt, { addSuffix: false }),
        taskId: task.id,
        processInstanceId: task.processInstanceId,
        createdDate: task.startedAt,
        assignedBy: task.assignedBy,
        priority: getPriorityTemplate(
          getPriorityBadge(task.processKey, priorityValue),
          priorityValue,
        ),
      };
    });
  }, [tasksState.tasks, getPriorityBadge]);

  // Tracks the task currently being claimed. The "Assumir" button
  // (IGRPDataTableButtonLink) has no loading/disabled prop, so we guard here to
  // stop rapid multi-clicks from firing duplicate claim requests.
  const claimingTaskIdRef = useRef<string | null>(null);

  // Claim task function
  const handleClaimTask = useCallback(
    async (taskId: string) => {
      // A claim is already in flight — ignore repeated clicks
      if (claimingTaskIdRef.current) {
        return {
          success: false,
          error: "Aguarde, a tarefa anterior ainda está a ser assumida.",
        };
      }
      claimingTaskIdRef.current = taskId;
      try {
        await claimTask(taskId);
        // Refresh tasks after claiming
        refetchTasks();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Erro ao assumir tarefa",
        };
      } finally {
        claimingTaskIdRef.current = null;
      }
    },
    [refetchTasks],
  );

  const handleSearch = (searchTerm: string) => {
    updateFilters({ processType: searchTerm });
    applyFilters();
  };

  const handlePageChange = () => {
    fetchTasks();
  };

  return {
    // Data
    tableData,
    loading: tasksState.loading,
    error: tasksState.error,
    totalElements: tasksState.totalElements,
    totalPages: tasksState.totalPages,
    currentPage: tasksState.currentPage,

    // Filter values
    filters,
    updateFilters,
    // Actions
    handleSearch,
    handlePageChange,
    applyFilters,
    resetFilters,
    fetchTasks,
    handleClaimTask,
  };
}
