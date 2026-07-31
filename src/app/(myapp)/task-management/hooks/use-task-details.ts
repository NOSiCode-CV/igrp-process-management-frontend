import { useQuery, useQueryClient } from "@tanstack/react-query";
import { assignTask, getTaskById, unclaimTask } from "../../client/task";
import {
  getPriorityLabel,
  getPriorityVariant,
  getTaskStatusVariant,
} from "../../utils/status-helpers";
import {
  IGRPBadgeProps,
  useIGRPToast,
} from "@igrp/igrp-framework-react-design-system";
import { useCallback, useMemo } from "react";

export const useTaskDetails = (taskId: string) => {
  const { igrpToast } = useIGRPToast();

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["task-details", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    retry: true,
    retryDelay: 1000,
  });
  ("");

  const transformTask = useMemo(() => {
    if (!data) return null;
    const priorityLabel = getPriorityLabel(data.priority);
    return {
      ...data,
      color: getTaskStatusVariant((data.status as any) || "primary"),
      priorityLabel: priorityLabel || undefined,
      priorityVariant: priorityLabel
        ? (getPriorityVariant(data.priority!) as IGRPBadgeProps["color"])
        : undefined,
      variables: [
        ...(data?.processVariables || []),
        /*  ...(data?.variables || []), */
        ...(data?.forms && data?.forms.length > 0
          ? [{ name: "Form", value: data?.forms }]
          : []),
      ],
    };
  }, [data]);

  const refetchTask = useCallback(() => {
    queryClient.refetchQueries({ queryKey: ["task-details", taskId] });
    // Claiming/releasing/delegating a task changes both task lists
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["available-tasks"] });
  }, [queryClient, taskId]);

  // Add unclaim task handler
  const onUnclaimTask = async (
    note?: string,
    onSuccess?: () => void,
  ): Promise<void> => {
    if (taskId === "") {
      igrpToast({
        type: "error",
        title: "Erro",
        description: "Nenhuma tarefa selecionada",
      });
      return;
    }

    try {
      await unclaimTask(taskId, note);

      igrpToast({
        type: "success",
        title: "Sucesso",
        description: "Tarefa libertada com sucesso!",
      });

      onSuccess?.();

      // Invalidate the task details query
      refetchTask();
    } catch (error) {
      console.error("Error unclaiming task:", error);
      igrpToast({
        type: "error",
        title: "Erro",
        description: "Erro ao libertar tarefa",
      });
    }
  };

  // Handle assign task save
  const onDelegateTask = async (
    formData: {
      user: string;
      note?: string;
      priority?: string;
      candidateGroups?: string;
      assigneTo?: string;
    },
    onSuccess?: () => void,
  ) => {
    if (formData.assigneTo === "user" && formData.user === "") {
      igrpToast({
        type: "error",
        title: "Erro",
        description: "O utilizador é obrigatório",
      });
      return;
    }
    if (formData.assigneTo === "group" && formData.candidateGroups === "") {
      igrpToast({
        type: "error",
        title: "Erro",
        description: "O grupo é obrigatório",
      });
      return;
    }

    try {
      await assignTask(
        taskId,
        formData.user,
        formData.priority ?? "",
        formData.note ?? "",
        formData.candidateGroups ?? "",
      );

      igrpToast({
        type: "success",
        title: "Sucesso",
        description: "Tarefa atribuída com sucesso!",
      });

      onSuccess?.();

      // Refetch the task details query
      refetchTask();
    } catch (error) {
      console.error("Error assigning task:", error);
      igrpToast({
        type: "error",
        title: "Erro",
        description: "Erro ao atribuir tarefa",
      });
    }
  };

  return {
    task: transformTask,
    onUnclaimTask,
    onDelegateTask,
    isLoading,
    error,
  };
};
