import type { IGRPColorVariants } from "@igrp/igrp-framework-react-design-system";
import {
  getTaskStatusLabel,
  getTaskStatusVariant,
  getProcessInstanceStatusLabel,
  getProcessInstanceStatusVariant,
  getPriorityLabel,
  getPriorityVariant,
  TaskStatus,
  ProcessInstanceStatus,
} from "./status-helpers";

// Shared utility function to map badge variants to CSS classes.
// NOTE: retained ONLY for `getTaskStatusColor`, whose consumers are the
// engine-generated available-tasks / task-management pages. Their tableBadgeCell
// template hardcodes `badgeClassName={`${bgClass} ${textClass} ${className}`}`
// and cannot bind a DS `color` (see report), so those pages still need bgClass.
const getBgClass = (
  variant: string,
  useBlueForInfo: boolean = false,
): string => {
  switch (variant) {
    case "success":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-orange-100 text-orange-800";
    case "info":
      return useBlueForInfo
        ? "bg-blue-100 text-blue-800"
        : "bg-yellow-100 text-yellow-800";
    case "destructive":
      return "bg-red-100 text-red-800";
    case "secondary":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getTaskStatusColor = (task: { status: string }) => {
  const status = task.status?.toUpperCase() as TaskStatus;
  const label = getTaskStatusLabel(status);
  const color = getTaskStatusVariant(status);

  return {
    label,
    color,
    // Legacy class fields kept for the engine-generated tableBadgeCell template.
    bgClass: getBgClass(color),
    textClass: "",
    className: "",
    iconName: "",
  };
};

export const getProcessInstanceStatusColor = (processInstance: {
  status: string;
}): { label: string; color: IGRPColorVariants; iconName: string } => {
  const status = processInstance.status?.toUpperCase() as ProcessInstanceStatus;
  const label = getProcessInstanceStatusLabel(status);
  const color = getProcessInstanceStatusVariant(status);

  return {
    label,
    color,
    iconName: "",
  };
};

export const getPriorityColor = (item: {
  priority: string | number;
}): { label: string; color: IGRPColorVariants; iconName: string } => {
  const priority = item.priority;
  const label = getPriorityLabel(priority);
  const color = getPriorityVariant(priority);

  return {
    label,
    color,
    iconName: "",
  };
};

/** Priority from API (getProcessDefinitionPriorities): label + value + optional color (hex). */
export interface ApiPriorityInfo {
  label: string;
  value: string;
  color?: string;
}

/**
 * Returns badge options for a task priority using API-defined priorities when available.
 * When apiPriority carries an explicit hex color, `badgeStyle` (inline hex) is returned;
 * otherwise a DS `color` is returned so the badge stays theme-aware.
 */
export function getPriorityBadgeFromApi(
  apiPriority: ApiPriorityInfo | undefined,
  fallback: { priority: string | number },
): {
  label: string;
  color?: IGRPColorVariants;
  badgeStyle?: React.CSSProperties;
} {
  if (apiPriority) {
    const label = apiPriority.label || String(apiPriority.value);
    if (apiPriority.color) {
      return {
        label,
        badgeStyle: {
          backgroundColor: `${apiPriority.color}20`,
          color: apiPriority.color,
        },
      };
    }
    return {
      label,
      color: getPriorityColor(fallback).color,
    };
  }
  const fallbackColor = getPriorityColor(fallback);
  return {
    label: fallbackColor.label,
    color: fallbackColor.color,
  };
}
