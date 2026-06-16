import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAvailableTasks } from "../../client/task";
import { useFilterData } from "../../components/processtaksfilter/hooks/use-filter-data";
import { AvailableTasksFilters, AvailableTasksState } from "../types";

export function useAvailableTasksData() {
  // Use the shared filter data hook
  const { filters, updateFilters, resetFilters } = useFilterData();

  const queryClient = useQueryClient();

  // State for pagination
  const [customFilters, setCustomFilters] = useState<
    Partial<AvailableTasksFilters> | undefined
  >();

  // Use query at the top level - hooks must be called at the top level
  const { data, isLoading, error } = useQuery({
    queryKey: ["available-tasks", filters, customFilters],
    queryFn: () => {
      // Use custom filters if provided, otherwise use current filters state
      const filtersToUse = customFilters
        ? { ...filters, ...customFilters }
        : filters;

      return getAvailableTasks({
        ...filtersToUse,
        dateFrom: filtersToUse.dateFrom || undefined,
        dateTo: filtersToUse.dateTo || undefined,
      });
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retryDelay: 1000,
  });

  // Transform query result to state format
  const tasksState: AvailableTasksState = {
    tasks: data?.content || [],
    loading: isLoading,
    error:
      error instanceof Error
        ? error.message
        : error
          ? "Failed to fetch tasks"
          : null,
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.pageNumber || 0,
    pageSize: data?.pageSize || 10,
  };

  // Fetch tasks function - now just updates state to trigger refetch
  const fetchTasks = (newCustomFilters?: Partial<AvailableTasksFilters>) => {
    setCustomFilters(newCustomFilters);
  };

  // Apply filters and fetch tasks
  const applyFilters = (newCustomFilters?: Partial<AvailableTasksFilters>) => {
    // Update filters if custom filters provided
    if (newCustomFilters) {
      updateFilters(newCustomFilters);
    }

    // Fetch tasks with the filter values
    fetchTasks(newCustomFilters);
  };

  const refetchTasks = () => {
    queryClient.invalidateQueries({ queryKey: ["available-tasks"] });
    // Claiming/releasing a task moves it between lists, so refresh My Tasks too
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
  };

  return {
    tasksState,
    filters,
    updateFilters,
    applyFilters,
    resetFilters,
    fetchTasks,
    refetchTasks,
  };
}
