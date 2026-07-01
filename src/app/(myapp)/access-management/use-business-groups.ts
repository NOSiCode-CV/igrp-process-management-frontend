import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDepartmentRoles, BusinessGroupOption } from "./roles";

export interface BusinessGroupsResult {
  groupOptions: BusinessGroupOption[];
  isLoading: boolean;
  error: unknown;
}

// Stable empty reference so consumers depending on `groupOptions` in a
// useEffect don't loop while data is undefined (a fresh `[]` each render would
// re-trigger the effect → "Maximum update depth exceeded").
const EMPTY_GROUPS: BusinessGroupOption[] = [];

/**
 * Loads the `DEPARTMENT.ROLE` candidate groups from access-management.
 * Returns an empty list when access-management is not configured (the server
 * action short-circuits on a missing API URL), so callers keep the custom-group
 * fallback. Roles change rarely, so the result is cached.
 */
export function useBusinessGroups(): BusinessGroupsResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ["business-groups"],
    queryFn: () => getDepartmentRoles(),
    // Roles change rarely, but if the first read fails (slow access API) we must
    // recover instead of staying empty — retry and refetch on mount, and keep
    // the previous options while refetching.
    staleTime: 1000 * 60 * 30,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    placeholderData: keepPreviousData,
  });

  return { groupOptions: data ?? EMPTY_GROUPS, isLoading, error };
}
