import { useMemo } from "react";
import { useMyTasksData } from "./use-my-tasks-data";
import { TaskTableRow } from "../types";
import { unclaimTask } from "../../client/task";
import {
  getProcessInfo,
  getPriorityTemplate,
} from "../../utils/columns-template";
import { useProcessPriorities } from "../../hooks/use-process-priorities";
import { format } from "date-fns";
import { formatDuration } from "../../utils/shared";
import { routeSearchTerm } from "../../utils/search-routing";

export function useMyTasks() {
  const {
    myTasksState,
    unclaimModalState,
    filters,
    updateFilters,
    fetchMyTasks,
    applyFilters,
    resetFilters,
    handleOpenUnclaimModal,
    handleCloseUnclaimModal,
    refetchMyTasks,
  } = useMyTasksData();

  const processKeys = useMemo(() => {
    const keys = new Set<string>();
    myTasksState.tasks.forEach((t) => {
      if (t.processKey) keys.add(t.processKey);
    });
    return Array.from(keys);
  }, [myTasksState.tasks]);

  const { getPriorityBadge } = useProcessPriorities(processKeys);

  // Transform tasks data for the table
  const tableData = useMemo((): TaskTableRow[] => {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-expect-error Allow JSX in table row fields without refactor
    return myTasksState.tasks.map((task) => {
      const createdDate = new Date(task.startedAt);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
      const priorityValue = task.priority + "";

      return {
        currentStep: task.name,
        process: getProcessInfo(task.processName, task.processNumber),
        startedAt: format(task.startedAt, "dd MMM, HH:mm"),
        duration: formatDuration(diffTime),
        priority: getPriorityTemplate(
          getPriorityBadge(task.processKey, priorityValue),
          priorityValue,
        ),
        processKey: task.processKey,
        processInstanceId: task.processInstanceId,
        taskKey: task.taskKey,
        taskId: task.id,
        processName: task.processName,
        applicationBase: task.applicationBase,
      };
    });
  }, [myTasksState.tasks, getPriorityBadge]);

  // Handle search functionality
  const handleSearch = (searchTerm: string) => {
    // Route the free-text box to task name OR process number.
    updateFilters(routeSearchTerm(searchTerm));
    applyFilters();
  };

  const handlePageChange = () => {
    fetchMyTasks();
  };

  // Add unclaim task handler
  const handleUnclaimTask = async (note?: string) => {
    if (
      !unclaimModalState.selectedTask ||
      !unclaimModalState.selectedTask.taskId
    ) {
      return { success: false, message: "Nenhuma tarefa selecionada" };
    }

    try {
      await unclaimTask(unclaimModalState.selectedTask.taskId, note);

      // Close modal and refresh data
      handleCloseUnclaimModal();
      refetchMyTasks();

      return { success: true, message: "Tarefa libertada com sucesso!" };
    } catch (error) {
      console.error("Error unclaiming task:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Erro ao libertar tarefa",
      };
    }
  };

  return {
    // Data
    tableData,
    myTasksState,
    unclaimModalState,
    filters,

    // Actions
    fetchMyTasks,
    applyFilters,
    resetFilters,
    handleSearch,
    handlePageChange,
    updateFilters,
    handleUnclaimTask,
    handleOpenUnclaimModal,
    handleCloseUnclaimModal,

    // State
    loading: myTasksState.loading,
    error: myTasksState.error,
  };
}
