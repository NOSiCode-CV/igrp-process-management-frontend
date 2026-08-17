"use server";
import { DEFAULT_PAGE_SIZE } from "@/app/(myapp)/utils/shared";
import { getIGRPProcessClient } from "@/lib/api-client";
import { isCurrentUserSuperAdmin } from "@/lib/igrp-claims";
import {
  CreateProcessArtifactRequest,
  CreateProcessInstanceRequest,
  CreateAndStartProcessRequest,
  CreateProcessSequenceRequest,
  StartProcessInstanceRequest,
  PaginatedResponse,
  Process,
  ProcessArtifact,
  ProcessInstance,
  ProcessSequence,
  ProcessStats,
  ProcessDefinitionSchema,
  Priority,
  ProcessFilter,
} from "@igrp/platform-process-management-types";

/**
 * Verbose server-side logging for this client layer. Toggle WITHOUT touching
 * code by setting `IGRP_DEBUG_CLIENT=true` in the environment (.env.local for
 * local dev, or the deployment env). Logs print to the Next server terminal.
 */
const DEBUG = process.env.IGRP_DEBUG_CLIENT === "true";

/**
 * Fetches a paginated list of processes.
 * @param page The page number to fetch.
 * @param size The number of items per page.
 * @returns A promise that resolves to a paginated response of processes.
 */
export const getProcesses = async (
  filter?: ProcessFilter,
): Promise<PaginatedResponse<Process>> => {
  const processManagementClient = await getIGRPProcessClient();
  // Super admins bypass access-scoped filtering and see every process — force
  // `filterByCurrentUser: false` regardless of what the caller requested.
  const superAdmin = await isCurrentUserSuperAdmin();
  const params = {
    ...filter,
    filterByCurrentUser:false,//superAdmin ? false : filter?.filterByCurrentUser,
    page: 0,
    size: DEFAULT_PAGE_SIZE,
  };
  if (DEBUG) {
    console.log("[client/process][getProcesses] → request", {
      superAdmin,
      params,
    });
  }
  const response = await processManagementClient.processes.getProcesses(params);
  if (DEBUG) {
    console.log("[client/process][getProcesses] ← response", {
      totalElements: response.data?.totalElements,
      count: response.data?.content?.length,
      sample: response.data?.content?.slice(0, 3).map((p) => ({
        id: p.id,
        processKey: p.processKey,
        name: p.name,
        deploymentId: p.deploymentId,
        applicationBase: p.applicationBase,
      })),
    });
  }
  // OpenAPI returns ProcessDeploymentListDTO; UI still models list rows as Process.
  return response.data as unknown as PaginatedResponse<Process>;
};

/**
 * Fetches process instance statistics.
 * @returns A promise that resolves to process statistics.
 */
export const getProcessStats = async (): Promise<ProcessStats> => {
  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.processes.getProcessStats();
  return response.data;
};

/**
 * Fetches a paginated list of processes.
 * @param processDefinitionId The ID of the process definition to fetch.
 * @returns A promise that resolves to a paginated response of processes.
 */
export const getProcessArtifacts = async (
  processDefinitionId: string,
): Promise<ProcessArtifact[]> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.getProcessArtifacts(
      processDefinitionId,
    );
  return response.data;
};

/**
 * Creates a new process artifact.
 * @param processDefinitionId The ID of the process definition to create the artifact for.
 * @param artifact The artifact to create.
 * @returns A promise that resolves to the created process artifact.
 */
export const createProcessArtifact = async (
  processDefinitionId: string,
  artifact: CreateProcessArtifactRequest,
): Promise<ProcessArtifact> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.createProcessArtifact(
      processDefinitionId,
      artifact,
    );
  return response.data;
};

/**
 * Creates a new process artifact.
 * @param processDefinitionId The ID of the process definition to create the artifact for.
 * @param artifact The artifact to create.
 * @returns A promise that resolves to the created process artifact.
 */
export const updateProcessArtifact = async (
  processDefinitionId: string,
  artifact: CreateProcessArtifactRequest,
): Promise<ProcessArtifact> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.updateProcessArtifact(
      processDefinitionId,
      artifact,
    );
  return response.data;
};

/**
 * Fetches a paginated list of processes.
 * @param processDefinitionId The ID of the process definition to fetch.
 * @returns A promise that resolves to a paginated response of processes.
 */
export const getProcessDeployedArtifacts = async (
  processDefinitionId: string,
): Promise<ProcessArtifact[]> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.getProcessDeployedArtifacts(
      processDefinitionId,
    );
  return response.data;
};

/**
 * Fetches a single process by its ID.
 * @param id The ID of the process to fetch.
 * @returns A promise that resolves to the process, or null if not found.
 */
export const getProcessById = async (id: string): Promise<Process | null> => {
  const processManagementClient = await getIGRPProcessClient();
  return (await processManagementClient.processes.getProcessById(id)).data;
};

/**
 * Create a new process instance.
 * @param processDefinitionId The ID of the process definition to start.
 * @param processKey The process key.
 * @param businessKey Optional business key for the process instance.
 * @param priority Priority level for the process instance.
 * @param variables Optional variables to pass to the process instance.
 * @returns A promise that resolves to the newly created process instance.
 */
export const createProcessInstance = async (
  processDefinitionId: string,
  processKey: string,
  applicationBase: string,
  priority: number,
  businessKey?: string,
  _variables?: Array<{ name: string; value: string }>,
): Promise<ProcessInstance> => {
  const body: CreateProcessInstanceRequest = {
    processDefinitionId,
    processKey,
    applicationBase: applicationBase,
    businessKey,
    priority: priority,
  };

  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.createProcessInstance(body);
  return response.data;
};

/**
 * Starts a new process instance.
 * @param processDefinitionId The ID of the process definition to start.
 * @param processKey The process key.
 * @param businessKey Optional business key for the process instance.
 * @param priority Priority level for the process instance.
 * @param variables Optional variables to pass to the process instance.
 * @returns A promise that resolves to the newly created process instance.
 */
export const startProcessInstance = async (
  processInstanceId: string,
  variables?: Array<{ name: string; value: string }>,
): Promise<ProcessInstance> => {
  const body: StartProcessInstanceRequest = {
    variables,
  };

  const processManagementClient = await getIGRPProcessClient();
  const response = await processManagementClient.processes.startProcessInstance(
    processInstanceId,
    body,
  );
  return response.data;
};

/**
 * Create and Starts a new process instance.
 * @param processDefinitionId The ID of the process definition to start.
 * @param processKey The process key.
 * @param businessKey Optional business key for the process instance.
 * @param priority Priority level for the process instance.
 * @param variables Optional variables to pass to the process instance.
 * @returns A promise that resolves to the newly created process instance.
 */
export const createAndStartProcess = async (
  processDefinitionId: string,
  processKey: string,
  applicationBase: string,
  priority: number,
  businessKey?: string,
  variables?: Array<{ name: string; value: string }>,
): Promise<ProcessInstance> => {
  const body: CreateAndStartProcessRequest = {
    processDefinitionId,
    processKey,
    applicationBase: applicationBase,
    businessKey,
    variables,
    priority: priority,
  };

  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.createAndStartProcess(body);
  return response.data;
};

/**
 * Process Number Configuration interface
 */
export interface ProcessNumberConfig {
  id?: string;
  name: string;
  prefix: string;
  dateFormat: string;
  checkDigit: number;
}

/**
 * Fetches process number configurations
 * @param processDefinitionId The process definition ID
 * @returns A promise that resolves to process number configurations
 */
export const getProcessNumberConfigs = async (
  processDefinitionKey: string,
): Promise<ProcessSequence> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.getProcessSequence(
      processDefinitionKey,
    );
  return response.data;
};

/**
 * Saves process number configuration
 * @param processDefinitionKey The process definition key
 * @param config The process number configuration to save
 * @returns A promise that resolves to the saved configuration
 */
export const saveProcessNumberConfig = async (
  processDefinitionKey: string,
  config: CreateProcessSequenceRequest,
): Promise<ProcessSequence> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.createProcessSequence(
      processDefinitionKey,
      config,
    );
  return response.data;
};

/**
 * Assigns groups to a process definition
 * @param processDefinitionId The process definition ID
 * @param groups The groups to assign
 * @returns A promise that resolves to the assigned groups
 */
export const assignGroupsToProcessDefinition = async (
  processDefinitionId: string,
  groups: string,
): Promise<void> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.assignGroupsToProcessDefinition(
      processDefinitionId,
      groups,
    );
  return response.data;
};

/**
 * Unassigns groups from a process definition
 * @param processDefinitionId The process definition ID
 * @param groups The groups to unassign
 * @returns A promise that resolves to the unassigned groups
 */
export const unassignGroupsToProcessDefinition = async (
  processDefinitionId: string,
  groups: string,
): Promise<void> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.unassignGroupsToProcessDefinition(
      processDefinitionId,
      groups,
    );
  return response.data;
};

/**
 * Exports a process definition (fetches data; download must be triggered client-side)
 * @param processDefinitionId The process definition ID
 * @returns A promise that resolves to the exported process definition data
 */
export const exportProcessDefinition = async (
  processDefinitionId: string,
): Promise<ProcessDefinitionSchema> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.exportProcessDefinition(
      processDefinitionId,
    );
  return response.data;
};

/**
 * Imports a process definition
 * @param processDefinition The process definition to import
 * @returns A promise that resolves to the imported process definition
 */
export const importProcessDefinition = async (
  processDefinition: ProcessDefinitionSchema,
): Promise<void> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.importProcessDefinition(
      processDefinition,
    );
  return response.data;
};

/**
 * Archives a process definition
 * @param processDefinitionId The process definition ID
 * @returns A promise that resolves to the archived process definition
 */
export const archiveProcessDefinition = async (
  processDefinitionId: string,
): Promise<void> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.archiveProcessDefinition(
      processDefinitionId,
    );
  return response.data;
};

/**
 * Unarchives a process definition
 * @param processDefinitionId The process definition ID
 * @returns A promise that resolves to the unarchived process definition
 */
export const unarchiveProcessDefinition = async (
  processDefinitionId: string,
): Promise<void> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.unarchiveProcessDefinition(
      processDefinitionId,
    );
  return response.data;
};

/**
 * Deletes a priority for a process definition
 * @param processDefinitionId The process definition ID
 * @returns A promise that resolves to the deleted priority
 */
export const deleteProcessDefinitionPriority = async (
  processDefinitionId: string,
): Promise<void> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.deleteProcessDefinitionPriority(
      processDefinitionId,
    );
  return response.data;
};

/**
 * Gets all priorities for a process definition
 * @param processDefinitionKey The process definition ID
 * @returns A promise that resolves to the priorities
 */
export const getProcessDefinitionPriorities = async (
  processDefinitionKey: string,
): Promise<Priority[]> => {
  if (!processDefinitionKey) {
    return [];
  }
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.getProcessDefinitionPriorities(
      processDefinitionKey,
    );
  return response.data;
};

/**
 * Creates a new priority for a process definition
 * @param processDefinitionKey The process definition ID
 * @param priority The priority to create
 * @returns A promise that resolves to the created priority
 */
export const createProcessDefinitionPriority = async (
  processDefinitionKey: string,
  priorities: Priority[],
): Promise<Priority[]> => {
  const processManagementClient = await getIGRPProcessClient();
  const response =
    await processManagementClient.processes.createProcessDefinitionPriority(
      processDefinitionKey,
      priorities,
    );
  return response.data;
};
