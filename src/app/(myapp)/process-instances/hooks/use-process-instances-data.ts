import { getProcessInstances } from "../../client/process-instances";
import { useFilterData } from "../../components/processtaksfilter/hooks/use-filter-data";
import { ProcessInstancesFilters, ProcessInstancesState } from "../types";
import { useQuery } from "@tanstack/react-query";

export function useProcessInstancesData() {
  // Use the shared filter data hook
  const { filters, updateFilters, resetFilters } = useFilterData();

  // Use query at the top level - hooks must be called at the top level
  // Use individual filter values in queryKey to ensure automatic reactivity
  const { data, isLoading, error } = useQuery({
    queryKey: ["process-instances", filters],
    queryFn: () => {
      return getProcessInstances(filters as Partial<ProcessInstancesFilters>);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retryDelay: 1000,
  });

  const { content, ...rest } = data ?? {};

  // Transform query result to state format
  const processInstancesState: ProcessInstancesState = {
    ...rest,
    processInstances: content || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : error ? error : undefined,
  };

  // Apply filters - now just updates filters, query will auto-refetch
  const applyFilters = (
    newCustomFilters?: Partial<ProcessInstancesFilters>,
  ) => {
    // Update filters if custom filters provided
    // The query will automatically refetch when filters change
    if (newCustomFilters) {
      updateFilters(newCustomFilters);
    }
  };

  return {
    processInstancesState,
    filters,
    updateFilters,
    applyFilters,
    resetFilters,
  };
}
