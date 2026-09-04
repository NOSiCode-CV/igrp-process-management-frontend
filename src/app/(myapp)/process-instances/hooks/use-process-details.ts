"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProcessInstanceById } from "../../client/process-instances";
import { getActivityProgress } from "../../client/activity";
import { ActivityProgress } from "@igrp/platform-process-management-types";
import { formatDuration } from "../../utils/columns-template";
import {
  getProcessInstanceStatusLabel,
  getProcessInstanceStatusVariant,
  type ProcessInstanceStatus,
} from "../../utils/status-helpers";
import { IGRPColorVariants } from "@igrp/igrp-framework-react-design-system";

export const useProcessDetails = (processInstanceId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["process-details", processInstanceId],
    queryFn: async () => {
      const [processInstance, activityProgress] = await Promise.all([
        getProcessInstanceById(processInstanceId),
        getActivityProgress(processInstanceId, ""),
      ]);

      return {
        processInstance,
        activityProgress,
      };
    },
    enabled: !!processInstanceId,
  });

  // Helper function to compare tree numbers hierarchically (e.g., "1", "1.1", "1.1.1", "1.1.1.1.2")
  const compareTreeNumbers = (a: string, b: string): number => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    const partsA = a.split(".").map((part) => parseInt(part, 10) || 0);
    const partsB = b.split(".").map((part) => parseInt(part, 10) || 0);

    const maxLength = Math.max(partsA.length, partsB.length);

    for (let i = 0; i < maxLength; i++) {
      const partA = partsA[i] || 0;
      const partB = partsB[i] || 0;

      if (partA < partB) return -1;
      if (partA > partB) return 1;
    }

    return 0;
  };

  //reorder activityProgress by treeNumber (e.g., "1", "1.1", "1.1.1", "1.1.1.1.2")
  const taskProgressTransformed = useMemo(() => {
    if (!data?.activityProgress) return undefined;

    // Map and add duration
    const mapped = data.activityProgress.map((task: ActivityProgress) => {
      const assignee = task.userProfileAssignee?.fullName || task.assignee;
      // Duration will be calculated from activityDetails if available
      const created = new Date(data?.processInstance?.startedAt || Date.now());
      const now = data?.processInstance?.endedAt
        ? new Date(data?.processInstance?.endedAt)
        : new Date();
      const diff = Math.abs(now.getTime() - created.getTime());
      return {
        ...task,
        duration: diff,
        assignee,
      };
    });

    // Sort by treeNumber hierarchically
    return mapped.sort((a, b) => {
      const treeNumberA = a.treeNumber || "";
      const treeNumberB = b.treeNumber || "";
      return compareTreeNumbers(treeNumberA, treeNumberB);
    });
  }, [
    data?.activityProgress,
    data?.processInstance?.startedAt,
    data?.processInstance?.endedAt,
  ]);

  const transformedProcess = useMemo(() => {
    const startedBy =
      data?.processInstance?.userProfileStartedBy?.fullName ||
      data?.processInstance?.startedBy;
    const created = new Date(data?.processInstance?.startedAt || Date.now());
    const now = data?.processInstance?.endedAt
      ? new Date(data?.processInstance?.endedAt)
      : new Date();
    const diff = Math.abs(now.getTime() - created.getTime());
    const status = data?.processInstance?.status as
      | ProcessInstanceStatus
      | undefined;
    return {
      ...data?.processInstance,
      // Localized label + DS color from the shared status helpers (aligned with
      // the list/dashboard). Overrides the raw backend statusDesc (e.g.
      // "CANCELED" -> "Cancelado", destructive color).
      color: status
        ? getProcessInstanceStatusVariant(status)
        : ("secondary" as IGRPColorVariants),
      statusDesc: status
        ? getProcessInstanceStatusLabel(status)
        : data?.processInstance?.statusDesc,
      duration: formatDuration(diff) as string,
      startedBy,
    };
  }, [data?.processInstance]);

  const taskHistoryTransformed = useMemo(() => {
    return taskProgressTransformed
      ?.filter((activity: ActivityProgress) => activity.type === "USER_TASK")
      .map((activity: ActivityProgress) => {
        return {
          ...activity,
          variables: [
            ...(activity.variables || []),
            ...(activity?.forms && activity?.forms.length > 0
              ? [{ name: "Form", value: activity?.forms }]
              : []),
          ],
        };
      });
  }, [taskProgressTransformed]);

  return {
    process: transformedProcess,
    activityProgress: taskProgressTransformed || [],
    taskHistory: taskHistoryTransformed || [],
    variables: transformedProcess?.variables || [],
    isLoading: isLoading,
    error: error,
  };
};
