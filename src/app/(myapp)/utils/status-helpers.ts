import type { IGRPColorVariants } from "@igrp/igrp-framework-react-design-system";

// Process Instance Status Types
export type ProcessInstanceStatus =
  | "CREATED"
  | "RUNNING"
  | "SUSPENDED"
  | "CANCELLED"
  | "COMPLETED"
  | "TERMINATED";

// Task Status Types
export type TaskStatus =
  | "CREATED"
  | "ASSIGNED"
  | "COMPLETED"
  | "CANCELLED"
  | "DELETED"
  | "SUSPENDED";

// Priority Types - matching your priority modal values
export type Priority = "1" | "2" | "3" | "4" | "5";

// Badge Variant Types — aligned to the design-system color axis.
export type BadgeVariant = IGRPColorVariants;

/**
 * Get localized status label for process instances
 */
export const getProcessInstanceStatusLabel = (
  status: ProcessInstanceStatus,
): string => {
  switch (status) {
    case "CREATED":
      return "Criado";
    case "RUNNING":
      return "Em execução";
    case "SUSPENDED":
      return "Suspenso";
    case "CANCELLED":
      return "Cancelado";
    case "COMPLETED":
      return "Concluído";
    default:
      return status;
  }
};

/**
 * Get localized status label for tasks
 */
export const getTaskStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case "CREATED":
      return "Criado";
    case "ASSIGNED":
      return "Atribuído";
    case "COMPLETED":
      return "Completo";
    case "CANCELLED":
      return "Cancelado";
    case "SUSPENDED":
      return "Suspenso";
    case "DELETED":
      return "Excluído";
    default:
      return status;
  }
};

/**
 * Get localized label for priority - matching your priority modal labels
 */
export const getPriorityLabel = (
  priority: Priority | string | number,
): string => {
  const priorityStr = priority.toString();
  switch (priorityStr) {
    case "5":
      return "Muito Alta";
    case "4":
      return "Alta";
    case "3":
      return "Média";
    case "2":
      return "Baixa";
    case "1":
      return "Muito Baixa";
    default:
      return "Muito Baixa";
  }
};

/**
 * Get badge variant for process instance status
 */
export const getProcessInstanceStatusVariant = (
  status: ProcessInstanceStatus,
): BadgeVariant => {
  switch (status) {
    case "CREATED":
      return "info";
    case "RUNNING":
      return "warning";
    case "SUSPENDED":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    case "COMPLETED":
      return "success";
    case "TERMINATED":
      return "destructive";
    default:
      return "success";
  }
};

/**
 * Get badge variant for task status
 */
export const getTaskStatusVariant = (status: TaskStatus): BadgeVariant => {
  switch (status) {
    case "CREATED":
      return "info";
    case "ASSIGNED":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "destructive";
    case "DELETED":
      return "secondary";
    default:
      return "secondary";
  }
};

/**
 * Get badge variant for priority - matching your 1-5 scale
 */
export const getPriorityVariant = (
  priority: Priority | string | number,
): BadgeVariant => {
  const priorityNum =
    typeof priority === "number" ? priority : parseInt(priority.toString(), 10);

  switch (priorityNum) {
    case 5: // Muito Alta
      return "destructive";
    case 4: // Alta
    case 3: // Média
      return "warning";
    case 2: // Baixa
      return "secondary";
    case 1: // Muito Baixa
      return "secondary";
    default:
      return "secondary";
  }
};
