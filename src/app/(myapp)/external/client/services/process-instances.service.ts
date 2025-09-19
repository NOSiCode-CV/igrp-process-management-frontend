'use server';

import { getHttpClient } from '../config/client.config';
import { PaginatedResponse, ProcessInstance } from '@igrp/platform-process-management-types';

const httpClient = getHttpClient();

// Define the StatusOption interface locally since it's not exported from the types package
interface StatusOption {
  value: string;
  label: string;
}

/**
 * Fetches a paginated list of process instances with optional filters.
 * @param page The page number to fetch.
 * @param size The number of items per page.
 * @param filters Optional filters to apply to the search.
 * @returns A promise that resolves to a paginated response of process instances.
 */
export const getProcessInstances = async (
  page = 0,
  size = 20,
  filters?: {
    processKey?: string;
    number?: string;
    status?: string;
    businessKey?: string;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
  },
): Promise<PaginatedResponse<ProcessInstance>> => {
  const allowedStatuses = [
    'CREATED',
    'RUNNING',
    'SUSPENDED',
    'COMPLETED',
    'TERMINATED',
    'CANCELED',
  ] as const;
  type ClientStatus = typeof allowedStatuses[number];

  const mappedStatus = ((): ClientStatus | undefined => {
    const raw = filters?.status?.toUpperCase();
    return allowedStatuses.includes(raw as ClientStatus) ? (raw as ClientStatus) : undefined;
  })();

  console.log(page, size)

  const response = await httpClient.processes.getProcessInstances({
    //page,
    //size,
    number: filters?.number,
    procReleaseKey: filters?.processKey,
    status: mappedStatus,
    // searchTerms, applicationBase, procReleaseId not mapped here
  });
  return response.data as PaginatedResponse<ProcessInstance>;
};

/**
 * Fetches a single process instance by its ID.
 * @param id The ID of the process instance to fetch.
 * @returns A promise that resolves to the process instance, or null if not found.
 */
export const getProcessInstanceById = async (id: string): Promise<ProcessInstance | null> => {
  return (await httpClient.processes.getProcessInstanceById(id)).data as ProcessInstance;
};

/**
 * Gets running process instances for a specific application base.
 * @param applicationBase The application base.
 * @returns A promise that resolves to an array of running process instances.
 */
export const getRunningProcessInstances = async (applicationBase: string): Promise<ProcessInstance[]> => {
  // No direct API in client; use getProcessInstances with filters
  const response = await httpClient.processes.getProcessInstances({
    applicationBase,
    status: 'RUNNING',
    page: 0,
    size: 1000,
  });
  return (response.data?.content ?? []) as ProcessInstance[];
};

/**
 * Fetches available status options for process instances.
 * @returns A promise that resolves to an array of status options.
 */
export const getProcessInstancesStatus = async (): Promise<StatusOption[]> => {
  return (await httpClient.processes.getProcessInstancesStatus()).data as StatusOption[];
};
