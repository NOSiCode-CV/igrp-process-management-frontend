import { useState, useCallback, useMemo } from "react";
import { getTasks, assignTask } from "../../client/task";
import {
  getDateTemplate,
  getProcessInfo,
  getPriorityTemplate,
  formatDuration,
} from "../../utils/columns-template";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useProcessPriorities } from "../../hooks/use-process-priorities";
import { routeSearchTerm } from "../../utils/search-routing";
import {
  AssignTaskModalState,
  TaskManagementFilters,
  TaskManagementState,
  TaskManagementTableRow,
} from "../types";

export function useTaskManagement() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<TaskManagementFilters>({});

  // Add modal state for assign task
  const [assignModalState, setAssignModalState] =
    useState<AssignTaskModalState>({
      isOpen: false,
      selectedTask: null,
    });

  // Use query to fetch tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => {
      // Remove undefined values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined),
      );

      return getTasks(cleanFilters);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retryDelay: 1000,
  });

  const { content, ...rest } = data ?? {};
  // Transform state from query result
  const state: TaskManagementState = {
    ...rest,
    tasks: content || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? error : null,
  };

  const processKeys = useMemo(() => {
    const keys = new Set<string>();
    state.tasks.forEach((t) => {
      if (t.processKey) keys.add(t.processKey);
    });
    return Array.from(keys);
  }, [state.tasks]);

  const { getPriorityBadge } = useProcessPriorities(processKeys);

  // Transform tasks data for table display
  const tableData = useMemo((): TaskManagementTableRow[] => {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-expect-error Allow JSX in table row fields without refactor
    return state.tasks.map((task) => {
      const createdDate = new Date(task.startedAt);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
      const priorityValue = task.priority;

      const assignedBy =
        task.userProfileAssignedBy?.fullName || task.assignedBy;

      return {
        currentStep: task.name,
        process: getProcessInfo(task.processName, task.processNumber),
        assignedBy: assignedBy || "",
        startedAt: getDateTemplate(task.startedAt),
        endedAt: getDateTemplate(task.endedAt),
        duration: formatDuration(diffTime),
        status: task.status,
        taskId: task.id,
        taskKey: task.taskKey,
        processKey: task.processKey,
        processInstanceId: task.processInstanceId,
        processName: task.processName,
        priority: getPriorityTemplate(
          getPriorityBadge(
            task.processKey,
            priorityValue != null ? String(priorityValue) : "",
          ),
          priorityValue,
        ),
        statusDesc: task.statusDesc,
        applicationBase: task.applicationBase,
      };
    });
  }, [state.tasks, getPriorityBadge]);

  // Fetch tasks function - now just updates pagination/filter states
  const fetchTasks = useCallback((appliedFilters?: TaskManagementFilters) => {
    if (appliedFilters) {
      setFilters(appliedFilters);
    }
  }, []);

  // Handle search functionality
  const handleSearch = useCallback(
    (searchTerm: string) => {
      // Route the free-text box to task name OR process number.
      const newFilters = { ...filters, ...routeSearchTerm(searchTerm) };
      setFilters(newFilters);
    },
    [filters],
  );

  // Handle filter application
  const applyFilters = useCallback(
    (newFilters?: TaskManagementFilters) => {
      const updatedFilters = newFilters
        ? { ...filters, ...newFilters }
        : filters;
      setFilters(updatedFilters);
    },
    [filters],
  );

  // Handle filter reset
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Update filters function
  const updateFilters = useCallback(
    (newFilters: Partial<TaskManagementFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [],
  );

  // Handle opening assign task modal
  const handleOpenAssignModal = useCallback((task: TaskManagementTableRow) => {
    setAssignModalState({
      isOpen: true,
      selectedTask: task,
    });
  }, []);

  // Handle closing assign task modal
  const handleCloseAssignModal = useCallback(() => {
    setAssignModalState({
      isOpen: false,
      selectedTask: null,
    });
  }, []);

  // Handle task assignment
  const handleAssignTask = useCallback(
    async (
      user: string,
      priority: string,
      note?: string,
      candidateGroups?: string,
    ) => {
      if (!assignModalState.selectedTask) return;

      try {
        await assignTask(
          assignModalState.selectedTask.taskId,
          user,
          priority,
          note,
          candidateGroups,
        );

        // Refresh tasks after successful assignment
        await queryClient.refetchQueries({ queryKey: ["tasks"] });
        // Assigning moves the task between user lists, so refresh those too
        queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
        queryClient.invalidateQueries({ queryKey: ["available-tasks"] });

        // Close modal
        handleCloseAssignModal();

        return { success: true, message: "Tarefa atribuída com sucesso!" };
      } catch (error) {
        console.error("Error assigning task:", error);
        return {
          success: false,
          message: "Erro ao atribuir tarefa. Tente novamente.",
        };
      }
    },
    [assignModalState.selectedTask, queryClient, handleCloseAssignModal],
  );

  return {
    // Data
    tableData,
    // State
    loading: state.loading,
    error: state.error,
    // Filters
    filters,
    // Priority badge (uses API per process definition)
    getPriorityBadge,
    // Assign Task Modal
    assignModalState,
    // Actions
    handleSearch,
    applyFilters,
    resetFilters,
    updateFilters,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleAssignTask,
    fetchTasks,
  };
}
