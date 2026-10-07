import { useCallback, useEffect, useMemo, useState } from "react";
import { ExtendedArea, ProcessMapHookReturn } from "../types";
import { useProcessMapData } from "./use-process-map-data";
import { useTreeExpansion } from "./use-tree-expansion";
import { usePriorityModal } from "./use-priority-modal";
import { useTreeSearch } from "./use-tree-search";
import { useTreeComputed } from "./use-tree-computed";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Area, Process } from "@igrp/platform-process-management-types";
import { useIGRPToast } from "@igrp/igrp-framework-react-design-system";
import { useAccessManagement } from "../../access-management/hooks";
import { useAreaHandlers } from "./area/use-area-handlers";
import { useProcessOperations } from "./use-process-operations";
import { getAllAreasFlat } from "../utils/area-hierarchy";
import { findNodeById } from "../utils/tree-utils";

export function useProcessMap(
  router?: AppRouterInstance,
): ProcessMapHookReturn {
  const [activeArea, setActiveArea] = useState<ExtendedArea | undefined>(
    undefined,
  );
  const [processKey, setProcessKey] = useState<string | undefined>(undefined);

  // Data management
  const {
    areas,
    loadedNodes,
    loading: areasLoading,
    error,
    loadSubareas,
    refreshData,
  } = useProcessMapData();

  // Tree expansion state
  const { expandedNodes, toggleNode: originalToggleNode } = useTreeExpansion();

  // Process operations (now with priority workflow)
  const {
    selectedProcess,
    selectProcess,
    prepareProcessStart,
    startProcessWithPriority,
    handleRemoveProcess,
    handleAssociateProcess,
    allProcesses,
    allProcessesManage,
    loading: processesLoading,
  } = useProcessOperations(refreshData, router);

  const { igrpToast } = useIGRPToast();

  // Modal management
  const { priorityModal, priorities, loadingPriorities } = usePriorityModal({
    processKey,
  });

  // Computed tree values
  const { treeNodes, manageNodes, flatNodes, totalProcesses, totalAreas } =
    useTreeComputed(areas, expandedNodes, allProcesses?.content ?? []);

  // Search functionality
  const { searchTerm, setSearchTerm, filteredNodes, clearSearch } =
    useTreeSearch(treeNodes);

  useEffect(() => {
    if (!activeArea?.id) return;
    const fresh = findNodeById(manageNodes, activeArea.id);
    if (!fresh) {
      setActiveArea(undefined);
      return;
    }
    setActiveArea((current) => {
      if (
        current &&
        current.id === fresh.id &&
        current.process === fresh.process &&
        current.name === fresh.name
      ) {
        return current;
      }
      return fresh;
    });
  }, [manageNodes, activeArea?.id]);

  // Enhanced toggle node that also loads subareas when expanding
  const toggleNode = useCallback(
    async (node: ExtendedArea) => {
      const { id: nodeId } = node;

      const isCurrentlyExpanded = expandedNodes.has(nodeId);

      setActiveArea(node);

      // Toggle the expansion state
      originalToggleNode(nodeId);

      // If we're expanding (not collapsing) and haven't loaded subareas yet, load them
      if (!isCurrentlyExpanded && !loadedNodes.has(nodeId)) {
        try {
          await loadSubareas(nodeId);
        } catch (error) {
          igrpToast({
            type: "error",
            title: "Erro",
            description: "Erro ao carregar subáreas. Tente novamente.",
          });
        }
      }
    },
    [expandedNodes, originalToggleNode, loadedNodes, loadSubareas, igrpToast],
  );

  // New startProcess function that opens priority modal first
  const startProcess = useCallback(
    (
      process: Process,
      processDefinitionId: string,
      processKey: string,
      applicationBase: string,
      businessKey?: string,
      variables?: Array<{ name: string; value: string }>,
    ) => {
      setProcessKey(processKey);
      // Prepare the process start parameters
      prepareProcessStart(
        processDefinitionId,
        processKey,
        applicationBase,
        businessKey,
        variables,
      );

      // Open priority modal
      priorityModal.open(process);
    },
    [prepareProcessStart, priorityModal],
  );

  // Handle priority modal save
  const handlePrioritySave = useCallback(
    async (data: { priority: string }) => {
      const priority = parseInt(data.priority, 10);
      if (!isNaN(priority)) {
        await startProcessWithPriority(priority);
        priorityModal.close();
      } else {
        igrpToast({
          type: "error",
          title: "Erro",
          description: "Por favor, selecione uma prioridade válida.",
        });
      }
    },
    [startProcessWithPriority, priorityModal, igrpToast],
  );

  const { applicationsOptions } = useAccessManagement();

  const flatAreas = getAllAreasFlat(areas);

  const mapOptions = useMemo(() => {
    return flatAreas.map((area: Area) => ({
      label: area.name,
      value: area.id,
    }));
  }, [flatAreas]);

  // Area management - pass setAreaProcesses
  const areaHandlers = useAreaHandlers(
    areas,
    handleAssociateProcess,
    handleRemoveProcess,
    refreshData,
  );

  return {
    allProcesses,
    allProcessesManage,
    // State
    areas,
    expandedNodes,
    loadedNodes,
    selectedProcess,
    loading: areasLoading || processesLoading,
    error,

    // Computed values
    treeNodes,
    flatNodes,
    filteredNodes,
    totalProcesses,
    totalAreas,

    // Search
    searchTerm,
    setSearchTerm,
    clearSearch,

    // Actions
    toggleNode,
    loadSubareas,
    selectProcess,
    startProcess, // Updated to use priority workflow
    refreshData,

    prioritiesOptions: priorities,
    loadingPriorities: loadingPriorities,

    // Modals
    priorityModal: {
      ...priorityModal,
      onSave: handlePrioritySave,
    },

    manageAreas: {
      // Manage view shows every area (unpruned), unlike the filtered "Ver Mapa".
      areas: manageNodes,
      expandedNodes,
      options: {
        applications: applicationsOptions,
        areas: mapOptions,
      },
      ...areaHandlers,
      handleRemoveProcess,
      activeArea,
    },
  };
}
