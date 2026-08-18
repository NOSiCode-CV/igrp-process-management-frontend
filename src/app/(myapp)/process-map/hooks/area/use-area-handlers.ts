import { useIGRPToast } from "@igrp/igrp-framework-react-design-system";
import { useAreaForm } from "./use-area-form";
import {
  createArea,
  deleteArea,
  getSubareas,
  updateArea,
} from "@/app/(myapp)/client/area";
import {
  associateProcessToArea,
  removeProcessFromArea,
} from "@/app/(myapp)/client/area-process";
import {
  CreateAreaRequest,
  Process,
  UpdateAreaRequest,
} from "@igrp/platform-process-management-types";
import { findAreaById } from "../../utils/area-hierarchy";
import { AreaFormData, ExtendedArea } from "../../types";
import { processKeyOf, removeIdsOf } from "../../utils/process-identity";

export function useAreaHandlers(
  areas: ExtendedArea[],
  handleAssociateProcess: (
    areaId: string,
    processData: Process,
  ) => Promise<void>,
  handleRemoveProcess: (
    areaId: string,
    processDefinitionId: string,
  ) => Promise<void>,
  refreshData: () => void | Promise<void>,
) {
  const { igrpToast } = useIGRPToast();

  const areaForm = useAreaForm();

  const handleCreateArea = async (formData: AreaFormData) => {
    try {
      const newArea = await createArea(formData as CreateAreaRequest);

      for (const process of formData.processes || []) {
        const processKey = processKeyOf(process);
        if (!processKey) continue;
        await associateProcessToArea(newArea.id, {
          processKey,
          releaseId: process.id || process.releaseId || "",
          version: process.version ?? "",
          name: process.name ?? processKey,
        });
      }

      await refreshData();

      igrpToast({
        type: "success",
        title: "Sucesso",
        description: "Área criada com sucesso!",
      });

      return newArea;
    } catch (error) {
      console.error("Error creating area:", error);
      throw error;
    }
  };

  const removeAssociation = async (areaId: string, process: Process) => {
    const ids = removeIdsOf(process);
    if (ids.length === 0) {
      throw new Error("Missing process definition id");
    }
    let lastError: unknown;
    for (const id of ids) {
      try {
        await removeProcessFromArea(areaId, id);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };

  const handleUpdateArea = async (areaId: string, formData: AreaFormData) => {
    try {
      const { processes: nextProcesses = [], ...areaFields } = formData;
      const updatedArea = await updateArea(
        areaId,
        areaFields as UpdateAreaRequest,
      );

      const existing = areaForm.originalProcesses;
      const nextByKey = new Map(
        nextProcesses
          .map((process) => [processKeyOf(process), process] as const)
          .filter(([key]) => key.length > 0),
      );

      const toRemove = existing.filter((process) => {
        const key = processKeyOf(process);
        if (!key) return true;
        const next = nextByKey.get(key);
        return !next || next !== process;
      });
      const toAdd = nextProcesses.filter((process) => {
        const key = processKeyOf(process);
        if (!key) return false;
        const previous = existing.find((item) => processKeyOf(item) === key);
        return !previous || previous !== process;
      });

      for (const process of toRemove) {
        await removeAssociation(areaId, process);
      }

      for (const process of toAdd) {
        const processKey = processKeyOf(process);
        await associateProcessToArea(areaId, {
          processKey,
          releaseId: process.id || process.releaseId || "",
          version: process.version ?? "",
          name: process.name ?? processKey,
        });
      }

      await refreshData();

      igrpToast({
        type: "success",
        title: "Sucesso",
        description: "Área atualizada com sucesso!",
      });

      return updatedArea;
    } catch (error) {
      console.error("Error updating area:", error);
      igrpToast({
        type: "error",
        title: "Erro",
        description: "Erro ao atualizar área. Tente novamente.",
      });
      throw error;
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    try {
      await deleteArea(areaId);

      await refreshData();
      igrpToast({
        type: "success",
        title: "Sucesso",
        description: "Área excluída com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting area:", error);
      igrpToast({
        type: "error",
        title: "Erro",
        description: "Erro ao excluir área. Tente novamente.",
      });
      throw error;
    }
  };

  const loadSubareas = async (parentAreaId: string) => {
    try {
      await getSubareas(parentAreaId);
      await refreshData();
    } catch (error) {
      console.error("Error loading subareas:", error);
    }
  };

  const getSubareasForParent = (parentAreaId: string): ExtendedArea[] => {
    const parentArea = findAreaById(areas, parentAreaId);
    return parentArea?.subareas || [];
  };

  return {
    areaForm,
    handleCreateArea,
    handleUpdateArea,
    handleDeleteArea,
    loadSubareas,
    getSubareasForParent,
  };
}
