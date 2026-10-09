"use server";

import { VariableFilter } from "@/app/(myapp)/components/filter-data";
import { DEFAULT_PAGE_SIZE } from "@/app/(myapp)/utils/shared";
import { getIGRPProcessClient } from "@/lib/api-client";
import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import {
  PaginatedResponse,
  ProcessInstance,
} from "@igrp/platform-process-management-types";

/**
 * Fetches a paginated list of process instances with optional filters.
 * @param page The page number to fetch.
 * @param size The number of items per page.
 * @param filters Optional filters to apply to the search.
 * @returns A promise that resolves to a paginated response of process instances.
 */
export const getProcessInstances = async (filters?: {
  processType?: string;
  processNumber?: string;
  name?: string;
  status?: "CREATED" | "RUNNING" | "SUSPENDED" | "CANCELED" | "COMPLETED";
  businessKey?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  variables?: VariableFilter[];
}): Promise<PaginatedResponse<ProcessInstance>> => {
  const { variables, ...rest } = filters ?? {};

  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.processes.getProcessInstances(
    {
      ...rest,
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      dateFrom: rest?.dateFrom || undefined,
      dateTo: rest?.dateTo || undefined,
      number: rest?.processNumber,
      // `name` is a first-class instance filter as of client 0.1.0-beta.19
      name: rest?.name || undefined,
      procReleaseKey: rest?.processType || undefined,
    },
    { variables },
  );
  return response.data;
};

/**
 * Fetches a single process instance by its ID.
 * @param id The ID of the process instance to fetch.
 * @returns A promise that resolves to the process instance, or null if not found.
 */
export const getProcessInstanceById = async (
  id: string,
): Promise<ProcessInstance | null> => {
  const processManagementClient = await getIGRPProcessClient();
  return (await processManagementClient.processes.getProcessInstanceById(id))
    .data;
};

/**
 * Cancels a running process instance.
 * @param id The ID of the process instance to cancel.
 * @param obsCancel Optional note explaining the cancellation.
 * @returns A promise that resolves to the updated (canceled) process instance.
 */
export const cancelProcessInstance = async (
  id: string,
  obsCancel?: string,
): Promise<ProcessInstance> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.cancelProcessInstance(id, {
      obsCancel: obsCancel || undefined,
    });
  return response.data;
};

/**
 * Gets running process instances for a specific application base.
 * @param applicationBase The application base.
 * @returns A promise that resolves to an array of running process instances.
 */
export const getRunningProcessInstances = async (
  applicationBase: string,
): Promise<ProcessInstance[]> => {
  const processManagementClient = await getIGRPProcessClient();
  // No direct API in client; use getProcessInstances with filters
  const response = await processManagementClient.processes.getProcessInstances({
    applicationBase,
    status: "RUNNING",
    page: 0,
    size: 1000,
  });
  return response.data?.content ?? [];
};

/**
 * Fetches available status options for process instances.
 * @returns A promise that resolves to an array of status options.
 */
export const getProcessInstancesStatus = async (): Promise<
  IGRPOptionsProps[]
> => {
  const processManagementClient = await getIGRPProcessClient();
  return (await processManagementClient.processes.getProcessInstancesStatus())
    .data;
};
