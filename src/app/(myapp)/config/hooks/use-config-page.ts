"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getProcesses,
  updateProcessArtifact,
} from "@/app/(myapp)/client/process";
import type {
  CreateProcessArtifactRequest,
  Process,
  ProcessDefinition,
} from "@igrp/platform-process-management-types";
import { useIGRPToast } from "@igrp/igrp-framework-react-design-system";
import { useProcessConfig } from "./use-process-config";
import { useBusinessGroups } from "../../access-management/use-business-groups";

const SAVE_SUCCESS = {
  type: "success" as const,
  title: "Sucesso",
  description: "Configuração salva com sucesso!",
};
const SAVE_ERROR = {
  type: "error" as const,
  title: "Erro",
  description: "Erro ao salvar configuração. Tente novamente.",
};

/**
 * Hook for the config page. Self-contained: allProcesses + assignGroups + numberingConfig + userTasks.
 */
export function useConfigPage({
  processSelected,
  filterProcess,
}: {
  processSelected?: ProcessDefinition;
  filterProcess?: string;
} = {}) {
  const processConfig = useProcessConfig({ processSelected });
  const { igrpToast } = useIGRPToast();
  const queryClient = useQueryClient();

  // Candidate groups sourced from access-management (DEPARTMENT.ROLE). Mapped to
  // the AddChecklistItem shape ({ key, name, processKey }); empty when
  // access-management is not configured, so the custom-group input stays.
  const { groupOptions } = useBusinessGroups();
  const availableGroups = groupOptions.map((g) => ({
    key: g.value,
    name: g.name,
    processKey: g.value,
  }));
  const {
    assignGroups,
    numberingConfig,
    priorityConfig,
    userTasks: userTasksConfig,
  } = processConfig;

  const {
    data,
    isLoading: loading,
    isFetching,
  } = useQuery({
    queryKey: ["all-processes", filterProcess],
    queryFn: async () => {
      const response = await getProcesses({ processName: filterProcess });
      return (response.content || []).map((process) => ({
        ...process,
        version: `v${process.version}`,
      })) as Process[];
    },
    // Reload on mount and retry on the transient backend timeouts we've seen,
    // but keep showing the previous list while a refetch/search is in flight so
    // it never blanks out (the query key includes filterProcess, so searching
    // would otherwise drop the list to empty until the new fetch resolves).
    staleTime: 0,
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
    placeholderData: keepPreviousData,
  });

  const loadAllProcesses = async () => {
    await queryClient.invalidateQueries({ queryKey: ["all-processes"] });
    await queryClient.refetchQueries({ queryKey: ["all-processes"] });
  };

  const saveConfigurationMutation = useMutation({
    mutationFn: async () => {
      const groups = assignGroups.form.getValues("groups") ?? "";
      await assignGroups.handleAssignGroupsToProcess(groups, { silent: true });
      await numberingConfig.handleSave(undefined, { silent: true });
      await priorityConfig.handleSave({ silent: true });

      const dataList = userTasksConfig.getSaveAllUserTasksData();
      for (const { processDefinitionId, request } of dataList) {
        await updateProcessArtifact(processDefinitionId, request);
      }
      userTasksConfig.loadConfig();
    },
    onSuccess: () => {
      igrpToast(SAVE_SUCCESS);
      void loadAllProcesses();
    },
    onError: (error) => {
      console.error(error);
      igrpToast(SAVE_ERROR);
    },
  });

  const handleSaveUserTask = async (request: CreateProcessArtifactRequest) => {
    const processDefinitionId = processSelected?.id;
    if (!processDefinitionId) return;
    userTasksConfig.patchEditedTask(request.key, request);
  };

  return {
    allProcesses: data ?? [],
    availableGroups,
    loading: loading || isFetching,
    loadAllProcesses,
    assignGroups: processConfig.assignGroups,
    numberingConfig: processConfig.numberingConfig,
    priorityConfig: processConfig.priorityConfig,
    saveConfigurationMutation,
    userTasks: {
      ...userTasksConfig,
      handleSave: handleSaveUserTask,
    },
  };
}
