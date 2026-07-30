"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assignGroupsToProcessDefinition,
  unassignGroupsToProcessDefinition,
  createProcessDefinitionPriority,
  deleteProcessDefinitionPriority,
  getProcessArtifacts,
  getProcessDefinitionPriorities,
  getProcessNumberConfigs,
  saveProcessNumberConfig,
} from "@/app/(myapp)/client/process";
import { useIGRPToast } from "@igrp/igrp-framework-react-design-system";
import {
  assignGroupsSchema,
  processNumberingSchema,
  type AssignGroupsValues,
  type ProcessNumberingValues,
} from "../schemas";
import {
  CreateProcessArtifactRequest,
  Priority,
  ProcessArtifact,
  ProcessDefinition,
} from "@igrp/platform-process-management-types";
import { getCandidateGroupsTemplate } from "../../utils/columns-template";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PRIORITY_OPTIONS } from "../constants";

const numberingDefaultValues: ProcessNumberingValues = {
  prefix: "",
  dateFormat: "yyyy",
  separator: "-",
  sequenceLength: 3,
};

/**
 * Single hook for all process configuration: assign groups, numbering, task config, etc.
 * Each config section is one object with schema, form and handler.
 */
export function useProcessConfig({
  processSelected,
}: {
  processSelected?: ProcessDefinition;
} = {}) {
  const { igrpToast } = useIGRPToast();
  const queryClient = useQueryClient();

  const { processKey, candidateGroups, id } = processSelected || {};

  // --- assignGroups (candidate groups) ---
  const savedCandidateGroupsRef = useRef<string>("");

  const assignGroupsForm = useForm<AssignGroupsValues>({
    resolver: zodResolver(assignGroupsSchema),
    defaultValues: { groups: "" },
  });

  // --- processNumbering ---
  const numberingForm = useForm<ProcessNumberingValues>({
    resolver: zodResolver(processNumberingSchema),
    defaultValues: numberingDefaultValues,
  });

  const addFieldValueToForm = (
    field: "prefix" | "dateFormat" | "separator" | "sequenceLength",
    value: string,
  ) => {
    numberingForm.setValue(field, value);
  };

  const loadAssignGroupsConfig = () => {
    const current = candidateGroups?.trim() ?? "";
    savedCandidateGroupsRef.current = current;
    assignGroupsForm.reset({ groups: current });
  };

  const { data: numberingConfigData, isError: numberingConfigError } = useQuery(
    {
      queryKey: ["process-number-config", processKey],
      queryFn: () => getProcessNumberConfigs(processKey ?? ""),
      enabled: !!processKey,
    },
  );

  useEffect(() => {
    if (numberingConfigData) {
      numberingForm.reset({
        prefix: numberingConfigData.prefix ?? "",
        dateFormat: numberingConfigData.dateFormat ?? "yyyy",
        separator: "-",
        sequenceLength:
          numberingConfigData.checkDigitSize !== 0
            ? numberingConfigData.checkDigitSize
            : 3,
      });
    } else if (!processKey || numberingConfigError) {
      numberingForm.reset(numberingDefaultValues);
    }
  }, [numberingConfigData, processKey, numberingConfigError]);

  const loadNumberingConfig = () => {
    queryClient.invalidateQueries({
      queryKey: ["process-number-config", processKey],
    });
  };

  type SaveOptions = { silent?: boolean };

  const handleSaveNumberingConfig = async (
    values?: ProcessNumberingValues,
    opts?: SaveOptions,
  ) => {
    const data = values ?? numberingForm.getValues();
    const parsed = processNumberingSchema.safeParse({
      ...data,
      sequenceLength: Number(data.sequenceLength ?? 3),
    });

    if (!parsed.success) {
      if (!opts?.silent) {
        igrpToast({
          type: "error",
          title: "Erro de validação",
          description: parsed.error.issues[0]?.message ?? "Dados inválidos.",
        });
      }
      throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    try {
      const data = {
        name: `${processKey}_sequence`,
        prefix: parsed.data.prefix,
        dateFormat: parsed.data.dateFormat,
        checkDigitSize: parsed.data.sequenceLength,
        padding: 0,
        numberIncrement: 1,
        separator: parsed.data.separator,
      };
      await saveProcessNumberConfig(processKey ?? "", data);
      if (!opts?.silent) {
        igrpToast({
          type: "success",
          title: "Sucesso",
          description: "Configuração de número de processo salva com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error saving process number configuration:", error);
      if (!opts?.silent) {
        igrpToast({
          type: "error",
          title: "Erro",
          description: "Erro ao salvar configuração. Tente novamente.",
        });
      }
      throw error;
    }
  };

  const handleAssignGroupsToProcess = async (
    groups: string,
    opts?: SaveOptions,
  ) => {
    const parsed = assignGroupsSchema.safeParse({ groups });
    if (!parsed.success) {
      if (!opts?.silent) {
        igrpToast({
          type: "error",
          title: "Erro de validação",
          description: parsed.error.issues[0]?.message ?? "Dados inválidos.",
        });
      }
      throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    }

    try {
      const newGroups = parsed.data.groups.trim();
      const savedGroups = savedCandidateGroupsRef.current;

      const toArray = (s: string) =>
        s
          ? s
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean)
          : [];
      const savedList = toArray(savedGroups);
      const newList = toArray(newGroups);
      const toUnassign = savedList.filter((g) => !newList.includes(g));

      if (toUnassign.length > 0) {
        await unassignGroupsToProcessDefinition(id!, toUnassign.join(", "));
      }
      if (newList.length > 0) {
        await assignGroupsToProcessDefinition(id!, newGroups);
      }

      savedCandidateGroupsRef.current = newGroups;

      if (!opts?.silent) {
        igrpToast({
          type: "success",
          title: "Sucesso",
          description: "Grupos atribuídos com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error assigning groups to process:", error);
      if (!opts?.silent) {
        igrpToast({
          type: "error",
          title: "Erro",
          description: "Erro ao atribuir grupos ao processo. Tente novamente.",
        });
      }
      throw error;
    }
  };

  // --- priorityOptions ---
  const fallbackPrioritys: Priority[] = PRIORITY_OPTIONS.map((o) => ({
    label: o.label,
    value: String(o.value),
    code: String(o.value),
    weight: Number(o.value) ?? 1,
    processDefinitionKey: processKey!,
    color: o.color,
    id: undefined,
  }));

  const { data: prioritiesData } = useQuery({
    queryKey: ["process-priorities", processKey],
    queryFn: () => getProcessDefinitionPriorities(processKey ?? ""),
    enabled: !!processKey,
  });

  const defaultPrioritys: Priority[] = useMemo(() => {
    if (prioritiesData && prioritiesData.length > 0) {
      return prioritiesData;
    }
    return fallbackPrioritys;
  }, [prioritiesData]);

  const [priorityOptions, setPrioritys] =
    useState<Priority[]>(fallbackPrioritys);

  const [deletedPriorities, setDeletedPriorities] = useState<Priority[]>([]);

  const [newPriorityLabel, setNewPriorityLabel] = useState("");
  const [newPriorityValue, setNewPriorityValue] = useState("");
  const [newPriorityColor, setNewPriorityColor] = useState("");

  useEffect(() => {
    setPrioritys(defaultPrioritys);
  }, [defaultPrioritys]);

  const loadPriorityConfig = () => {
    queryClient.invalidateQueries({
      queryKey: ["process-priorities", processKey],
    });
    setNewPriorityLabel("");
    setNewPriorityValue("");
    setNewPriorityColor("");
  };

  const updatePriority = (index: number, field: string, value: string) => {
    setPrioritys((prev) =>
      prev.map((opt, i) =>
        i === index
          ? { ...opt, [field as "label" | "value" | "color"]: value }
          : opt,
      ),
    );
  };

  const removePriority = (index: number) => {
    //save deleted priorities to local variable if id is not undefined
    const deletedPriority = priorityOptions.find((_, i) => i === index);
    if (deletedPriority?.id) {
      setDeletedPriorities((prev) => [...prev, deletedPriority]);
    }
    setPrioritys((prev) => prev.filter((_, i) => i !== index));
  };

  const addPriority = () => {
    const label = newPriorityLabel.trim();
    const value = newPriorityValue.trim();
    const color = newPriorityColor.trim();
    if (!label || !value) return;
    setPrioritys((prev) => [
      ...prev,
      {
        ...prev,
        label,
        value,
        code: value,
        weight: Number(value) ?? 1,
        processDefinitionKey: processKey!,
        color,
      },
    ]);
    setNewPriorityLabel("");
    setNewPriorityValue("");
    setNewPriorityColor("");
  };

  const handleSavePriorityConfig = async (_opts?: SaveOptions) => {
    await createProcessDefinitionPriority(processKey!, priorityOptions);
    //call deleted priorities
    deletedPriorities.forEach((priority) => {
      deleteProcessDefinitionPriority(priority.id!);
    });
    setDeletedPriorities([]);
    queryClient.invalidateQueries({
      queryKey: ["process-priorities", processKey],
    });
  };

  // --- userTasks ---
  const [editedTasksPatch, setEditedTasksPatch] = useState<
    Record<string, CreateProcessArtifactRequest>
  >({});

  const { data: artifactsData, isLoading: loadingUserTasks } = useQuery({
    queryKey: ["process-artifacts", id],
    queryFn: () => getProcessArtifacts(id!),
    enabled: !!id,
  });

  const toCandidateGroupsString = (val: unknown): string =>
    Array.isArray(val)
      ? val
          .map((s) => String(s).trim())
          .filter(Boolean)
          .join(",")
      : String(val ?? "");

  const userTasksList: any = (artifactsData ?? []).map(
    (artifact: ProcessArtifact, index: number) => {
      const patched = editedTasksPatch[artifact.key];
      const source = patched
        ? {
            ...artifact,
            name: patched.name ?? artifact.name,
            dueDate: patched.dueDate ?? artifact.dueDate,
            priority: patched.priority ?? artifact.priority,
            candidateGroups:
              patched.candidateGroups ?? artifact.candidateGroups,
          }
        : artifact;

      const raw = toCandidateGroupsString(source.candidateGroups);
      const groupsArray = raw
        ? raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const priority = source.priority;
      const defaultPriorityDesc = priority
        ? PRIORITY_OPTIONS.find(
            (o) => o.value.toString() === priority.toString(),
          )?.label
        : "";

      return {
        ...source,
        index,
        defaultPriority: defaultPriorityDesc,
        defaultDueDate: source.dueDate ?? "-",
        candidateGroups: getCandidateGroupsTemplate(groupsArray),
        candidateGroupsRaw: raw,
      };
    },
  );

  const loadUserTasksConfig = () => {
    setEditedTasksPatch({});
    queryClient.invalidateQueries({ queryKey: ["process-artifacts", id] });
  };

  const patchEditedTask = (
    taskKey: string,
    request: CreateProcessArtifactRequest,
  ) => {
    setEditedTasksPatch((prev) => ({ ...prev, [taskKey]: request }));
  };

  const getSaveUserTaskData = (
    processDefinitionId: string,
    request: CreateProcessArtifactRequest,
  ) => ({ processDefinitionId, request });

  const getSaveAllUserTasksData = () =>
    userTasksList.map((task: any) => {
      const patched = editedTasksPatch[task.key];
      const req: CreateProcessArtifactRequest = patched
        ? {
            ...patched,
            candidateGroups: toCandidateGroupsString(patched.candidateGroups),
          }
        : {
            key: task.key,
            formKey: task.formKey ?? "",
            name: task.name ?? "",
            dueDate: task.dueDate ?? "",
            priority: task.priority ?? "",
            candidateGroups: task.candidateGroupsRaw ?? "",
          };
      return { processDefinitionId: id!, request: req };
    });

  return {
    assignGroups: {
      schema: assignGroupsSchema,
      form: assignGroupsForm,
      loadConfig: loadAssignGroupsConfig,
      handleAssignGroupsToProcess,
    },
    numberingConfig: {
      schema: processNumberingSchema,
      form: numberingForm,
      loadConfig: loadNumberingConfig,
      handleSave: handleSaveNumberingConfig,
      addFieldValue: addFieldValueToForm,
    },
    priorityConfig: {
      priorityOptions,
      newPriorityLabel,
      newPriorityColor,
      setNewPriorityLabel,
      newPriorityValue,
      setNewPriorityValue,
      setNewPriorityColor,
      updatePriority,
      removePriority,
      addPriority,
      loadConfig: loadPriorityConfig,
      handleSave: handleSavePriorityConfig,
    },
    userTasks: {
      list: userTasksList,
      loading: loadingUserTasks,
      loadConfig: loadUserTasksConfig,
      patchEditedTask,
      getSaveUserTaskData,
      getSaveAllUserTasksData,
    },
  };
}
