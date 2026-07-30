import { ProcessInstance } from "@igrp/platform-process-management-types";

export interface ProcessInstancesFilters {
  processNumber: string;
  processKey: string;
  user: string;
  status:
    | "CREATED"
    | "RUNNING"
    | "SUSPENDED"
    | "CANCELED"
    | "COMPLETED"
    | undefined;
  dateFrom: string;
  dateTo: string;
  areaId?: string;
  subareaId?: string;
  processType?: string;
  organic?: string;
  // Process instance specific filters
  procReleaseKey?: string;
  procReleaseId?: string;
  applicationBase?: string;
  businessKey?: string;
  startedBy?: string;
}

export interface ProcessInstancesState {
  processInstances: ProcessInstance[];
  loading: boolean;
  error: string | null | undefined;
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface DropdownOptions {
  areas: Array<{ label: string; value: string }>;
  subareas: Array<{ label: string; value: string }>;
  processTypes: Array<{ label: string; value: string }>;
  statuses: Array<{ label: string; value: string }>;
  organics: Array<{ label: string; value: string }>;
  users: Array<{ label: string; value: string }>;
}

export interface ProcessInstanceTableRow {
  processInfo: string;
  createBy: string;
  daysWaiting: string;
  version: string;
  progress: string;
  startedAt: string;
  endedAt: string;
  priority: string;
  status: string;
  processInstanceId: string;
  procReleaseKey: string;
  startedBy: string;
  businessKey: string;
}
