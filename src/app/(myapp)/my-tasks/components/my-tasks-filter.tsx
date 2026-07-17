"use client";

import { useState } from "react";

import {
  IGRPSelect,
  IGRPDatePicker,
  IGRPButton,
  IGRPOptionsProps,
  IGRPInputText,
} from "@igrp/igrp-framework-react-design-system";
import { useMyTasksFilter } from "../hooks/use-my-tasks-filter";

interface MyTasksFilterProps {
  onSearch?: (searchTerm: string) => void;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
}

export default function MyTasksFilter({
  onSearch,
  onApplyFilters,
  onResetFilters,
}: MyTasksFilterProps) {
  // State for dropdown options (these would be set by the filter hook)
  const [selectAreaOptions, setSelectAreaOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectSubareaOptions, setSelectSubareaOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectProcesstypeOptions, setSelectProcesstypeOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectStatusOptions, setSelectStatusOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectOrganicOptions, setSelectOrganicOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectUserOptions, setSelectUserOptions] = useState<
    IGRPOptionsProps[]
  >([]);

  // Use the filter hook
  const {
    filters,
    handleAreaChange,
    handleSubareaChange,
    handleProcessTypeChange,
    handleStatusChange,
    handleOrganicChange,
    handleUserChange,
    handleProcessNumberChange,
    handleDateChange,
  } = useMyTasksFilter(
    setSelectAreaOptions,
    setSelectSubareaOptions,
    setSelectProcesstypeOptions,
    setSelectStatusOptions,
    setSelectOrganicOptions,
    setSelectUserOptions,
  );

  const handleSearchSubmit = () => {
    if (onSearch) {
      onSearch(filters.processNumber);
    }
  };

  const handleApplyFiltersClick = () => {
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  const handleResetFiltersClick = () => {
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <div className="p-4 border-b bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Area */}
        <div>
          <IGRPSelect
            label="Área"
            placeholder="Selecione uma área"
            options={selectAreaOptions}
            value={filters.areaId}
            onValueChange={handleAreaChange}
          />
        </div>

        {/* Subarea */}
        <div>
          <IGRPSelect
            label="Subárea"
            placeholder="Selecione uma subárea"
            options={selectSubareaOptions}
            value={filters.subareaId}
            onValueChange={handleSubareaChange}
            disabled={!filters.areaId}
          />
        </div>

        {/* Process Type */}
        <div>
          <IGRPSelect
            label="Tipo de Processo"
            placeholder="Selecione um tipo"
            options={selectProcesstypeOptions}
            value={filters.processType}
            onValueChange={handleProcessTypeChange}
            disabled={!filters.areaId}
          />
        </div>

        {/* Process Number */}
        <div>
          <IGRPInputText
            label="Número do Processo"
            placeholder="Digite o número"
            value={filters.processNumber}
            onChange={(e) => handleProcessNumberChange(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <IGRPSelect
            label="Estado"
            placeholder="Selecione um estado"
            options={selectStatusOptions}
            value={filters.status}
            onValueChange={handleStatusChange}
          />
        </div>

        {/* Process Date */}
        <div>
          <IGRPDatePicker
            mode="single"
            id="processDate"
            name="processDate"
            label="Data do Processo"
            placeholder="Selecione uma data"
            date={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
            onDateChange={(date) =>
              handleDateChange(date ? date.toISOString() : "")
            }
          />
        </div>

        {/* Organic */}
        <div>
          <IGRPSelect
            label="Orgânica"
            placeholder="Selecione uma orgânica"
            options={selectOrganicOptions}
            value={filters.organic}
            onValueChange={handleOrganicChange}
          />
        </div>

        {/* User */}
        <div>
          <IGRPSelect
            label="Utilizador"
            placeholder="Selecione um utilizador"
            options={selectUserOptions}
            value={filters.user}
            onValueChange={handleUserChange}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <IGRPButton onClick={handleApplyFiltersClick}>
          Aplicar Filtros
        </IGRPButton>
        <IGRPButton variant="outline" onClick={handleResetFiltersClick}>
          Limpar Filtros
        </IGRPButton>
        <IGRPButton variant="secondary" onClick={handleSearchSubmit}>
          Pesquisar
        </IGRPButton>
      </div>
    </div>
  );
}
