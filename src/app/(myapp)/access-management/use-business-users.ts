import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAssignCandidateGroups } from "./assign-user-scope";
import { type BusinessUserOption, getBusinessUsers } from "./users";

export interface BusinessUsersResult {
  userOptions: BusinessUserOption[];
  isLoading: boolean;
  error: unknown;
}

// Stable empty reference (see use-business-groups) to avoid effect loops while
// data is undefined.
const EMPTY_USERS: BusinessUserOption[] = [];

function useBusinessUsersQuery(candidateGroups?: string): BusinessUsersResult {
  const { data, isLoading, error } = useQuery({
    // Scope is part of the key so each candidate-group set is cached separately
    // and the "all users" list (no scope) never gets overwritten by a scoped one.
    queryKey: ["business-users", candidateGroups ?? "__all__"],
    queryFn: () => getBusinessUsers(candidateGroups),
    staleTime: 1000 * 60 * 30,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    placeholderData: keepPreviousData,
  });

  return { userOptions: data ?? EMPTY_USERS, isLoading, error };
}

/**
 * Assignable users for the "Atribuir Tarefa" picker. Scoped to the candidate
 * groups of the task being assigned (see `assign-user-scope`): the flow that
 * opens the modal sets the scope, so only users who belong to those groups are
 * listed. With no scope set it lists all application users.
 *
 * Returns an empty list when access-management is not configured. Cached;
 * recovers on transient failures and keeps previous data while refetching.
 */
export function useBusinessUsers(): BusinessUsersResult {
  const candidateGroups = useAssignCandidateGroups();
  return useBusinessUsersQuery(candidateGroups);
}

/**
 * All application users, ignoring the assign scope. Used by the process-tasks
 * filter, whose "Utilizador" dropdown must always offer every user regardless
 * of any assign modal that happens to be open.
 */
export function useAllBusinessUsers(): BusinessUsersResult {
  return useBusinessUsersQuery(undefined);
}
