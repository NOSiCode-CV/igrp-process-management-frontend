import { useState, useCallback } from "react";
import {
  claimTaskIfUnassigned,
  getTasksByProcessInstance,
} from "@/app/(myapp)/client/task";
import {
  Process,
  ProcessData,
  ProcessInstance,
} from "@igrp/platform-process-management-types";
import { urlConfig } from "../../utils/url-config";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useIGRPToast } from "@igrp/igrp-framework-react-design-system";
import {
  createAndStartProcess,
  getProcesses,
} from "@/app/(myapp)/client/process";
import {
  associateProcessToArea,
  removeProcessFromArea,
} from "../../client/area-process";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useProcessOperations(
  refreshData: () => void | Promise<unknown>,
  router?: AppRouterInstance,
) {
  const [selectedProcess, setSelectedProcess] = useState<Process | undefined>();
  const [pendingProcessStart, setPendingProcessStart] = useState<{
    processDefinitionId: string;
    processKey: string;
    applicationBase: string;
    businessKey?: string;
    variables?: Array<{ name: string; value: string }>;
  } | null>(null);

  const { igrpToast } = useIGRPToast();
  const queryClient = useQueryClient();

  const selectProcess = useCallback((process: Process) => {
    setSelectedProcess(process);
  }, []);

  const {
    data,
    isPending: mapPending,
    isFetching: mapFetching,
  } = useQuery({
    queryKey: ["all-processes-map"],
    queryFn: async () => {
      const response = await getProcesses({ filterByCurrentUser: true });
      const sortedContent = [...(response.content ?? [])].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", undefined, {
          sensitivity: "base",
        }),
      );
      return { ...response, content: sortedContent };
    },
  });

  // Management dataset for "Gerir Área": associating processes to an area is an
  // admin action that must see ALL processes, not just the current user's — so
  // this query drops `filterByCurrentUser`. "Ver Mapa" keeps the filtered
  // `data` above for its access-scoped tree.
  const {
    data: manageData,
    isPending: managePending,
    isFetching: manageFetching,
  } = useQuery({
    queryKey: ["all-processes-map-manage"],
    queryFn: async () => {
      const response = await getProcesses({});
      const sortedContent = [...(response.content ?? [])].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", undefined, {
          sensitivity: "base",
        }),
      );
      return { ...response, content: sortedContent };
    },
  });

  // Store process start parameters for later execution with priority
  const prepareProcessStart = useCallback(
    (
      processDefinitionId: string,
      processKey: string,
      applicationBase: string,
      businessKey?: string,
      variables?: Array<{ name: string; value: string }>,
    ) => {
      setPendingProcessStart({
        processDefinitionId,
        processKey,
        applicationBase,
        businessKey,
        variables,
      });
    },
    [],
  );

  const startProcessWithPriority = useCallback(
    async (priority: number): Promise<ProcessInstance | null> => {
      if (!pendingProcessStart) {
        console.error("No pending process start found");
        return null;
      }

      try {
        const instance = await createAndStartProcess(
          pendingProcessStart.processDefinitionId,
          pendingProcessStart.processKey,
          pendingProcessStart.applicationBase,
          priority, // Add priority parameter
          pendingProcessStart.businessKey,
          pendingProcessStart.variables,
        );

        // Clear pending process start
        setPendingProcessStart(null);

        // Starting a process (and claiming its first task) changes these lists
        queryClient.invalidateQueries({ queryKey: ["process-instances"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
        queryClient.invalidateQueries({ queryKey: ["available-tasks"] });

        igrpToast({
          type: "success",
          title: "Processo Iniciado",
          description: pendingProcessStart.processKey
            ? `O processo ${pendingProcessStart.processKey} foi iniciado com sucesso.`
            : "O processo foi iniciado com sucesso.",
        });

        // Redirect to process instance URL if router is available
        if (router && instance) {
          try {
            // Fetch tasks for the process instance to get task execution info
            const tasksResponse = await getTasksByProcessInstance(instance.id);
            // Check if there are active tasks available
            if (tasksResponse.content && tasksResponse.content.length > 0) {
              const firstTask = tasksResponse.content[0];

              // Claim the task before redirecting. An already ASSIGNED task is
              // the normal outcome here (the engine assigns the first task to
              // the starter) and must not abort the redirect.
              await claimTaskIfUnassigned(firstTask.id);

              // Build task execution URL using the first available task
              const taskUrl = await urlConfig.buildTaskExecutionUrl(
                instance.procReleaseKey,
                firstTask.processInstanceId,
                firstTask.taskKey,
                firstTask.id,
                firstTask.applicationBase ?? "",
              );
              // Jump to the (separate) process-execution app — hard navigation,
              // not router.push, which is for in-app routes and would apply this
              // app's basePath to a foreign URL.
              window.location.assign(taskUrl);
            }
          } catch (taskError) {
            console.warn(
              "Error fetching tasks for process instance:",
              taskError,
            );
            // The process did start, so don't leave the user on the map with
            // only a success toast and no navigation to explain.
            igrpToast({
              type: "info",
              title: "Tarefa não aberta",
              description:
                "O processo foi iniciado, mas não foi possível abrir a primeira tarefa. Consulte-a em Minhas Tarefas.",
            });
          }
        }

        return instance;
      } catch (err) {
        console.error("Error starting process:", err);

        // Clear pending process start on error
        setPendingProcessStart(null);

        igrpToast({
          type: "error",
          title: "Erro ao Iniciar Processo",
          description: "Ocorreu um erro ao tentar iniciar o processo.",
        });

        return null;
      }
    },
    [pendingProcessStart, queryClient],
  );

  const handleRemoveProcess = async (
    areaId: string,
    processDefinitionId: string,
  ) => {
    try {
      await removeProcessFromArea(areaId, processDefinitionId);

      await refreshData();
      igrpToast({
        type: "success",
        title: "Sucesso",
        description: "Processo removido com sucesso!",
      });
    } catch (error) {
      console.error("Error removing process:", error);
      igrpToast({
        type: "error",
        title: "Erro",
        description: "Erro ao remover processo. Tente novamente.",
      });
      throw error;
    }
  };

  const handleAssociateProcess = async (
    areaId: string,
    processData: Process,
  ) => {
    try {
      await associateProcessToArea(areaId, processData as ProcessData);

      await refreshData();
    } catch (error) {
      console.error("Error associating process:", error);
      throw error;
    }
  };

  return {
    selectedProcess,
    selectProcess,
    prepareProcessStart,
    startProcessWithPriority,
    pendingProcessStart,
    handleRemoveProcess,
    handleAssociateProcess,
    allProcesses: data,
    allProcessesManage: manageData,
    loading: mapPending || mapFetching || managePending || manageFetching,
  };
}
