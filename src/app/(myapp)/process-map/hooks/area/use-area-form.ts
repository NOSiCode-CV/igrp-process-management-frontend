import { useState } from "react";
import type { Process } from "@igrp/platform-process-management-types";
import { AreaFormData, AreaModalState, ExtendedArea } from "../../types";

export function useAreaForm() {
  const [modalState, setModalState] = useState<AreaModalState>({
    isOpen: false,
    editingArea: null,
  });

  const [formData, setFormData] = useState<AreaFormData>({
    code: "",
    name: "",
    description: "",
    applicationBase: "",
    parentId: undefined, // Changed from area_fk to area_id
    color: "#3b82f6",
    processes: [],
  });

  const [originalProcesses, setOriginalProcesses] = useState<Process[]>([]);

  const openModal = (area?: ExtendedArea, parentAreaId?: string) => {
    if (area) {
      const source =
        area.process ??
        (area.data && "process" in area.data
          ? ((area.data as ExtendedArea).process ?? [])
          : []);
      const processes = source.filter(
        (process) => !process.status || process.status === "ACTIVE",
      );

      setModalState({
        isOpen: true,
        editingArea: area,
        parentAreaId,
      });
      setOriginalProcesses(processes);
      setFormData({
        code: area.code,
        name: area.name,
        description: area.description || "",
        applicationBase: area.applicationBase || "",
        parentId: area.areaId, // Changed from area_fk to area_id
        color: area.color || "#3b82f6",
        processes: processes || [],
      });
    } else {
      setModalState({
        isOpen: true,
        editingArea: null,
        parentAreaId,
      });
      setOriginalProcesses([]);
      setFormData({
        code: "",
        name: "",
        description: "",
        applicationBase: "",
        parentId: parentAreaId, // Changed from area_fk to area_id
        color: "#3b82f6",
        processes: [],
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      applicationBase: "",
      parentId: undefined, // Changed from area_fk to area_id
      color: "#3b82f6",
      processes: [],
    });
    setOriginalProcesses([]);
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      editingArea: null,
    });
    resetForm();
  };

  return {
    modalState,
    formData,
    setFormData,
    originalProcesses,
    openModal,
    closeModal,
    resetForm,
  };
}
