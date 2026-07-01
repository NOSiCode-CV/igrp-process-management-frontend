import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getBusinessUsers, BusinessUserOption } from "./users";

export interface BusinessUsersResult {
  userOptions: BusinessUserOption[];
  isLoading: boolean;
  error: unknown;
}

// Stable empty reference (see use-business-groups) to avoid effect loops while
// data is undefined.
const EMPTY_USERS: BusinessUserOption[] = [];

/**
 * Loads the assignable users from access-management (M2M). Returns an empty
 * list when access-management is not configured. Cached; recovers on transient
 * failures and keeps previous data while refetching.
 */
export function useBusinessUsers(): BusinessUsersResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ["business-users"],
    queryFn: () => getBusinessUsers(),
    staleTime: 1000 * 60 * 30,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    placeholderData: keepPreviousData,
  });

  return { userOptions: data ?? EMPTY_USERS, isLoading, error };
}
