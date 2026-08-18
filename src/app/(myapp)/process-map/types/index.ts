import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import { Area, Process } from "@igrp/platform-process-management-types";

// Use the same structure as process configuration - no need for ProcessMapArea

export interface ProcessTreeNode {
  id: string;
  name: string;
  type: "area" | "subarea" | "process";
  data: ExtendedArea | Process;
  children?: ProcessTreeNode[];
  level: number;
  parentId?: string;
  isExpanded?: boolean;
  hasChildren?: boolean;
  isLoaded?: boolean;
  applicationBase: string;
}

export interface ProcessMapState {
  areas: ExtendedArea[]; // Use ExtendedArea instead of ProcessMapArea
  expandedNodes: Set<string>;
  loadedNodes: Set<string>;
  selectedProcess?: Process;
  loading: boolean;
  error?: string;
}

export interface ProcessMapActions {
  toggleNode: (node: ExtendedArea) => void;
  loadSubareas: (areaId: string) => Promise<void>;
  selectProcess: (process: Process) => void;
  startProcess: (
    process: Process,
    processDefinitionId: string,
    processKey: string,
    applicationBase: string,
    businessKey?: string,
    variables?: Array<{ name: string; value: string }>,
  ) => void; // Updated signature to match implementation
  refreshData: () => void;
}

export interface ProcessMapHookReturn
  extends ProcessMapState,
    ProcessMapActions {
  // Computed values
  treeNodes: ExtendedArea[];
  flatNodes: ExtendedArea[];
  filteredNodes: ExtendedArea[];
  totalProcesses: number;
  totalAreas: number;

  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;

  allProcesses: any;
  allProcessesManage: any;

  loadingPriorities: boolean;
  prioritiesOptions: IGRPOptionsProps[] | undefined;

  // Modals
  priorityModal: {
    isOpen: boolean;
    process: Process | null;
    modalTitle: string;
    modalSubTitle: string;
    open: (process: Process) => void;
    close: () => void;
    setOpen: (open: boolean) => void;
    onSave: (data: { priority: string }) => Promise<void>;
  };

  manageAreas: {
    areas: ExtendedArea[];
    expandedNodes: Set<string>;
    options: {
      applications: {
        label: string;
        value: string;
      }[];
      areas: {
        label: string;
        value: string;
      }[];
    };
    handleCreateArea: (formData: AreaFormData) => Promise<Area>;
    handleUpdateArea: (areaId: string, formData: AreaFormData) => Promise<Area>;
    handleDeleteArea: (areaId: string) => Promise<void>;
    handleRemoveProcess: (areaId: string, processId: string) => Promise<void>;
    areaForm: {
      modalState: AreaModalState;
      openModal: (area?: ExtendedArea, parentAreaId?: string) => void;
      closeModal: () => void;
      setFormData: (formData: AreaFormData) => void;
      formData: AreaFormData;
    };
    activeArea: ExtendedArea | undefined;
  };
}

// Extended interfaces for UI components
export interface ExtendedArea extends Area {
  subareas?: ExtendedArea[];
  type?: "area" | "subarea" | "process";
  data?: Process | Area | ExtendedArea;
  children?: ExtendedArea[];
  level?: number;
  parentId?: string;
  hasChildren?: boolean;
  isLoaded?: boolean;
}

export interface AreaFormData {
  code: string;
  name: string;
  description: string;
  applicationBase: string;
  parentId?: string; // Changed from area_fk to area_id
  color?: string;
  processes?: Process[];
}

export interface ExpandedAreas {
  [key: string]: boolean;
}

export interface AreaProcessesMap {
  [areaId: string]: Process[];
}

// Modal states
export interface AreaModalState {
  isOpen: boolean;
  editingArea: Area | null;
  parentAreaId?: string;
}

export interface ProcessModalState {
  isOpen: boolean;
  selectedAreaId: string | null;
}

export interface ArtifactModalState {
  isOpen: boolean;
  selectedProcessId: string | null;
}

export interface ProcessNumberModalState {
  isOpen: boolean;
  selectedProcessId: string | null;
  selectedProcessKey: string | null;
  selectedProcessApplicationBase: string | null;
}
