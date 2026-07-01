"use server";

import {
  PaginatedResponse,
  Task,
  TaskStats,
} from "@igrp/platform-process-management-types";
import { PostResponse } from "@igrp/platform-process-management-types/dist/response";
import { getIGRPProcessClient } from "@/lib/api-client";
import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import { TaskManagementFilters } from "@/app/(myapp)/task-management/types";
import { DEFAULT_PAGE_SIZE } from "@/app/(myapp)/utils/shared";

/**
 * Fetches a paginated list of tasks with optional filters.
 * @param page The page number to fetch.
 * @param size The number of items per page.
 * @param filters Optional filter parameters.
 * @returns A promise that resolves to a paginated response of tasks.
 */
export const getTasks = async (
  filters?: Omit<TaskManagementFilters, "page" | "size">,
): Promise<PaginatedResponse<Task>> => {
  const { variables, processType, processNumber, user, status, dateFrom, dateTo } =
    filters || {};

  const processManagementClient = await getIGRPProcessClient();
  // Only forward fields the API supports; unknown params (areaId/subareaId/
  // organic) can interfere with backend filtering.
  const params = {
    processNumber: processNumber || undefined,
    processReleaseKey: processType || undefined,
    user: user || undefined,
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    filterByCurrentUser: true,
  };
  const response = await processManagementClient.tasks.getTasks(params, {
    variables,
  });
  return response.data;
};

/**
 * Fetches a single task by its ID.
 * @param id The ID of the task to fetch.
 * @returns A promise that resolves to the task, or undefined if not found.
 */
export const getTaskById = async (id: string): Promise<Task | undefined> => {
  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.tasks.getTaskById(id);
  return response.data;
};

/**
 * Fetches all tasks assigned to the current user with pagination.
 * @param params The filter parameters for fetching tasks.
 * @returns A promise that resolves to a paginated response of tasks.
 */
export const getMyTasks = async (
  params?: TaskManagementFilters,
): Promise<PaginatedResponse<Task>> => {
  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.tasks.getMyTasks({
    ...params,
    status: "ASSIGNED",
    page: 0,
    size: DEFAULT_PAGE_SIZE,
  });
  return response.data;
};

/**
 * Fetches all tasks assigned to a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to a list of tasks.
 */
export const getTasksByUser = async (
  userId: string,
): Promise<PaginatedResponse<Task>> => {
  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.tasks.getTasksByUser(userId);
  return response.data;
};

/**
 * Fetches all available tasks for a user with pagination.
 * @param params The filter parameters for fetching tasks.
 * @returns A promise that resolves to a paginated response of tasks.
 */
export const getAvailableTasks = async (
  params: TaskManagementFilters,
): Promise<PaginatedResponse<Task>> => {
  const { processNumber, processType, user, dateFrom, dateTo } = params;
  const processManagementClient = await getIGRPProcessClient();
  // Only forward fields the API actually supports; sending unknown params
  // (areaId/subareaId/organic/variables) can interfere with backend filtering.
  // NOTE: the API filters by `processReleaseKey` (see docs/api-collections.json);
  // the SDK's TaskQueryParams type omits it, so we build an untyped object to
  // avoid the excess-property check on the SDK call.
  const searchParams = {
    processNumber: processNumber || undefined,
    processReleaseKey: processType || undefined,
    user: user || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: "CREATED",
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    filterByCurrentUser: true,
  };
  const response =
    await processManagementClient.tasks.getAvailableTasks(searchParams);
  return response.data;
};

/**
 * Fetches all tasks for a specific process instance.
 * @param processInstanceId The ID of the process instance.
 * @returns A promise that resolves to a list of tasks.
 */
export const getTasksByProcessInstance = async (
  processInstanceId: string,
): Promise<PaginatedResponse<Task>> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.tasks.getTasksByProcessInstance(
      processInstanceId,
    );
  return response.data;
};

/**
 * Claims a task for a user.
 * @param taskId The ID of the task to claim.
 * @param user The user claiming the task.
 * @param note Optional note for the claim action.
 * @returns A promise that resolves to a PostResponse.
 */
export const claimTask = async (taskId: string): Promise<PostResponse> => {
  const processManagementClient = await getIGRPProcessClient();
  return (await processManagementClient.tasks.claimTask(taskId, {})).data;
};

/**
 * Unassigns a task from a user.
 * @param taskId The ID of the task to unassign.
 * @param user The user to unassign the task from.
 * @param note Optional note for the unassign action.
 * @returns A promise that resolves to a PostResponse.
 */
export const unassignTask = async (
  taskId: string,
  user: string,
  note?: string,
): Promise<PostResponse> => {
  const processManagementClient = await getIGRPProcessClient();
  return (
    await processManagementClient.tasks.assignTask(taskId, { user, note })
  ).data;
};

/**
 * Assigns a task to a user.
 * @param taskId The ID of the task to assign.
 * @param user The user to assign the task to.
 * @param note Optional note for the assign action.
 * @returns A promise that resolves to a PostResponse.
 */
export const assignTask = async (
  taskId: string,
  user: string,
  priority: string,
  note?: string,
  candidateGroups?: string,
): Promise<PostResponse> => {
  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.tasks.assignTask(taskId, {
    user,
    priority: parseInt(priority, 10), // ← Convert string to number
    note,
    candidateGroups,
  });
  return response.data;
};

/**
 * Releases a claimed task.
 * @param taskId The ID of the task to release.
 * @param user The user releasing the task.
 * @param note Optional note for the release action.
 * @returns A promise that resolves to a PostResponse.
 */
export const unclaimTask = async (
  taskId: string,
  note?: string,
): Promise<PostResponse> => {
  const processManagementClient = await getIGRPProcessClient();
  return (await processManagementClient.tasks.unclaimTask(taskId, { note }))
    .data;
};

/**
 * Completes a task.
 * @param taskId The ID of the task to complete.
 * @param variables Optional variables to pass to the task.
 * @returns A promise that resolves to a PostResponse.
 */
export const completeTask = async (
  taskId: string,
  variables?: Array<{
    name: string;
    value: string;
  }>,
): Promise<PostResponse> => {
  const processManagementClient = await getIGRPProcessClient();
  return (
    await processManagementClient.tasks.completeTask(taskId, { variables })
  ).data;
};

/*
 * Fetches statistics for all tasks.
 * @returns A promise that resolves to task statistics.
 */
export const getTaskStats = async (): Promise<TaskStats> => {
  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.tasks.getTaskStats();
  return response.data;
};

/**
 * Fetches statistics for tasks assigned to the current user.
 * @returns A promise that resolves to task statistics.
 */
export const getMyTaskStats = async (): Promise<TaskStats> => {
  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.tasks.getMyTaskStats();
  return response.data;
};

export const getTaskStatus = async (): Promise<IGRPOptionsProps[]> => {
  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.tasks.getTaskInstancesStatus();
  return response.data;
};
