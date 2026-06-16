import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyTasks } from "../../client/task";
import { MyTasksState, MyTasksFilters, TaskTableRow } from "../types";
import { useFilterData } from "../../components/processtaksfilter/hooks/use-filter-data";

// Export unclaim modal state interface
export interface UnclaimModalState {
  isOpen: boolean;
  selectedTask: TaskTableRow | null;
}

export function useMyTasksData() {
  // Add unclaim modal state
  const [unclaimModalState, setUnclaimModalState] = useState<UnclaimModalState>(
    {
      isOpen: false,
      selectedTask: null,
    },
  );

  const { filters, updateFilters, resetFilters } = useFilterData();

  const queryClient = useQueryClient();

  // State for pagination
  const [customFilters, setCustomFilters] = useState<
    Partial<MyTasksFilters> | undefined
  >();

  // Use query at the top level - hooks must be called at the top level
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-tasks", filters, customFilters],
    queryFn: () => {
      // Use custom filters if provided, otherwise use current filters state
      const filtersToUse = customFilters
        ? { ...filters, ...customFilters }
        : filters;

      // Map filter fields to match the service interface
      const mappedFilters = {
        processNumber: filtersToUse.processNumber || "",
        processReleaseKey: filtersToUse.processType || "",
        status: filtersToUse.status || "",
        dateFrom: filtersToUse.dateFrom || "",
        dateTo: filtersToUse.dateTo || "",
      };

      return getMyTasks(mappedFilters);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retryDelay: 1000,
  });

  const { content, ...rest } = data ?? {};

  // Transform query result to state format
  const myTasksState: MyTasksState = {
    ...rest,
    tasks: content || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? error : undefined,
  };

  // Fetch my tasks function - now just updates state to trigger refetch
  const fetchMyTasks = (newCustomFilters?: Partial<MyTasksFilters>) => {
    setCustomFilters(newCustomFilters);
  };

  // Apply current filters
  const applyFilters = () => {
    fetchMyTasks();
  };

  // Reset filters and fetch data
  const handleResetFilters = () => {
    resetFilters();
    fetchMyTasks({
      processNumber: "",
      processKey: "",
      user: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Add unclaim modal handlers

  const handleOpenUnclaimModal = useCallback((task: TaskTableRow) => {
    setUnclaimModalState({
      isOpen: true,
      selectedTask: task,
    });
  }, []);

  const handleCloseUnclaimModal = () => {
    setUnclaimModalState({
      isOpen: false,
      selectedTask: null,
    });
  };

  const refetchMyTasks = () => {
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    // Releasing a task moves it back to the available pool, so refresh that list too
    queryClient.invalidateQueries({ queryKey: ["available-tasks"] });
  };

  return {
    myTasksState,
    unclaimModalState,
    filters,
    updateFilters,
    fetchMyTasks,
    applyFilters,
    resetFilters: handleResetFilters,
    handleOpenUnclaimModal,
    handleCloseUnclaimModal,
    refetchMyTasks,
  };
}
