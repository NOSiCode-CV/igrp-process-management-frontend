"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const {
    assignGroups,
    numberingConfig,
    priorityConfig,
    userTasks: userTasksConfig,
  } = processConfig;

  const { data, isLoading: loading } = useQuery({
    queryKey: ["all-processes", filterProcess],
    queryFn: async () => {
      const response = await getProcesses({ processName: filterProcess });
      return (response.content || []).map((process) => ({
        ...process,
        version: `v${process.version}`,
      })) as Process[];
    },
  });

  const loadAllProcesses = () => {
    queryClient.invalidateQueries({
      queryKey: ["all-processes", filterProcess],
    });
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
    loading,
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
