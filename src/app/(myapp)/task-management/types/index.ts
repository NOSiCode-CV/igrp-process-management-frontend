import type {
  Task,
  VariableParams,
} from "@igrp/platform-process-management-types";

export interface TaskManagementFilters {
  processNumber?: string;
  processKey?: string;
  /** First-class API filter (client 0.1.0-beta.19). Prefer this over processType. */
  processReleaseKey?: string;
  user?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  areaId?: string;
  subareaId?: string;
  processType?: string;
  organic?: string;
  searchTerm?: string;
  // Filters added in client 0.1.0-beta.19
  candidateGroups?: string;
  candidateUsers?: string;
  name?: string;
  priority?: number;
  variables?: VariableParams;
  page?: number;
  size?: number;
}

export interface TaskManagementState {
  tasks: Task[];
  loading: boolean;
  error: string | null | undefined;
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

export type TaskManagementTab = "myTasks" | "availableTasks";

export interface TaskManagementTableRow {
  currentStep: string;
  process: string;
  assignedBy: string;
  startedAt: string;
  endedAt: string;
  priority: string;
  duration: string;
  status: string;
  taskId: string;
  //taskKey?: string;
  processKey?: string;
  processInstanceId?: string;
  processName?: string;
  /** Comma-separated candidate role codes — scopes the assign user picker. */
  candidateGroups?: string;
}

export interface AssignTaskModalState {
  isOpen: boolean;
  selectedTask: TaskManagementTableRow | null;
}
