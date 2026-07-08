'use client';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPOptionsProps } from '@igrp/igrp-framework-react-design-system';
import { DateRange } from '@igrp/igrp-framework-react-design-system';
import { FilterData } from '@/app/(myapp)/components/filter-data';
import {
  IGRPInputSearch,
  IGRPCombobox,
  IGRPDatePickerRange,
  IGRPButton,
  IGRPSeparator,
  IGRPInputText,
} from '@igrp/igrp-framework-react-design-system';
import { useProcessTasksFilter } from '@/app/(myapp)/components/processtaksfilter/hooks/use-process-tasks-filter';
import { PRIORITY_OPTIONS } from '@/app/(myapp)/config/constants';

export default function Taskprocessfilter({
  onSearch,
  onApplyFilters,
  onResetFilters,
  onFiltersChange,
  isProcess,
  showTaskFilters,
}: {
  onSearch: (searchTerm: string) => void;
  onApplyFilters: (filters: any) => void;
  onResetFilters: () => void;
  onFiltersChange: (filters: any) => void;
  isProcess?: boolean;
  showTaskFilters?: boolean;
}) {
  const [selectStatusOptions, setSelectStatusOptions] = useState<IGRPOptionsProps[]>([]);
  const [selectAreaOptions, setSelectAreaOptions] = useState<IGRPOptionsProps[]>([]);
  const [selectSubareaOptions, setSelectSubareaOptions] = useState<IGRPOptionsProps[]>([]);
  const [selectProcesstypeOptions, setSelectProcesstypeOptions] = useState<IGRPOptionsProps[]>([]);
  const [selectPriorityOptions, setSelectPriorityOptions] =
    useState<IGRPOptionsProps[]>(PRIORITY_OPTIONS);
  const [selectCandidateGroupsOptions, setSelectCandidateGroupsOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectCandidateUsersOptions, setSelectCandidateUsersOptions] = useState<
    IGRPOptionsProps[]
  >([]);

  const { igrpToast } = useIGRPToast();

  function getDateRange(): any | undefined {
    //convert dateFrom and dateTo to date format dd-MM-yyyy and return the date range

    const { dateFrom, dateTo } = filters;

    if (!dateFrom || !dateTo) {
      return undefined;
    }

    const [year, month, day] = dateFrom?.split('-') || [];
    const dateFromFormatted = `${day}/${month}/${year}`;
    const [yearTo, monthTo, dayTo] = dateTo?.split('-') || [];
    const dateToFormatted = `${dayTo}/${monthTo}/${yearTo}`;

    return { from: new Date(dateFromFormatted), to: new Date(dateToFormatted) };
  }

  //---------------------Reserved Area begin-----------------------------------
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    handleFiltersChange,
    handleCandidateGroupsChange,
    handleCandidateUsersChange,
    handlePriorityChange,
    resetFilters,
  } = useProcessTasksFilter(
    setSelectAreaOptions,
    setSelectSubareaOptions,
    setSelectProcesstypeOptions,
    setSelectStatusOptions,
    //setSelectOrganicOptions,
    //setSelectUserOptions,
    () => {},
    () => {},
    onFiltersChange,
    isProcess,
    setSelectCandidateGroupsOptions,
    setSelectCandidateUsersOptions,
  );

  // Handle search
  const handleSearchSubmit = () => {
    onSearch(searchTerm);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    resetFilters();
    setSearchTerm('');
  };

  //---------------------Reserved Area end-----------------------------------

  return (
    <div className={cn('component')}>
      <div
        className={cn('flex flex-row flex-wrap items-center justify-start gap-2', ' px-3 flex-1')}
      >
        <IGRPInputSearch
          id={`inputSearch1`}
          label={undefined}
          showStartIcon={true}
          startIcon={`Search`}
          submitIcon={`ArrowRight`}
          required={false}
          submitButtonLabel={`Pesquisar`}
          placeholder={`Pesquisar por nome ou nº processo`}
          className={cn('py-1 flex-1 max-w-sm')}
          setValueChange={(value) => setSearchTerm(value)}
          onSearch={handleSearchSubmit}
          value={searchTerm}
        ></IGRPInputSearch>

        <div className={cn('grid', 'grid-cols-3 ', ' gap-4')}>
          <IGRPCombobox
            id={`Status`}
            label={undefined}
            variant={`single`}
            placeholder={`Selecione um estado...`}
            selectLabel={`No option found`}
            showSearch={true}
            showIcon={false}
            iconName={`CornerDownRight`}
            className={cn('col-span-1')}
            onChange={(selected) =>
              handleStatusChange(Array.isArray(selected) ? selected[0] : selected)
            }
            options={selectStatusOptions}
            value={filters.status}
          ></IGRPCombobox>

          <IGRPDatePickerRange
            placeholder={`Selecione uma data`}
            id={`datePickerRange1`}
            dateFormat={`dd/MM/yyyy`}
            onDateChange={(date) => handleDateChange(date ?? null)}
            date={getDateRange()}
          />
          <FilterData onChange={(filters) => handleFiltersChange(filters)}></FilterData>
        </div>
        <IGRPButton
          id={`button3`}
          variant={`outline`}
          size={`default`}
          showIcon={true}
          iconName={`Settings2`}
          className={cn('ml-auto')}
          onClick={() => {
            setShowFilter(!showFilter);
          }}
        >
          Filtros Avançados
        </IGRPButton>
      </div>
      {showFilter && (
        <IGRPSeparator
          id={`separator1`}
          orientation={`horizontal`}
          className={cn('my-3')}
        ></IGRPSeparator>
      )}
      {showFilter && (
        <div
          className={cn(
            'grid',
            'grid-cols-2 ',
            'md:grid-cols-2 ',
            'lg:grid-cols-4 ',
            ' gap-4 px-3',
          )}
        >
          <IGRPInputText
            id={`Processnumber`}
            label={`Número do processo`}
            showIcon={false}
            required={false}
            placeholder={`ex: CV-24509202511`}
            className={cn('col-span-1')}
            onChange={(e) => handleProcessNumberChange(e.target.value)}
            value={filters.processNumber}
          ></IGRPInputText>

          <IGRPCombobox
            id={`Area`}
            label={`Área`}
            variant={`single`}
            placeholder={`Selecione uma área...`}
            selectLabel={`No option found`}
            showSearch={true}
            showIcon={false}
            iconName={`CornerDownRight`}
            className={cn('col-span-1')}
            onChange={(selected) =>
              handleAreaChange(Array.isArray(selected) ? selected[0] : selected)
            }
            options={selectAreaOptions}
            value={filters.areaId}
          ></IGRPCombobox>

          <IGRPCombobox
            id={`Subarea`}
            label={`Sub-área`}
            variant={`single`}
            placeholder={`Select an option...`}
            selectLabel={`No option found`}
            showSearch={true}
            showIcon={false}
            iconName={`CornerDownRight`}
            className={cn('col-span-1')}
            onChange={(selected) =>
              handleSubareaChange(Array.isArray(selected) ? selected[0] : selected)
            }
            options={selectSubareaOptions}
            value={filters.subareaId}
            disabled={!filters.areaId}
          ></IGRPCombobox>

          <IGRPCombobox
            id={`Processtype`}
            label={`Tipo Processo`}
            variant={`single`}
            placeholder={`Select an option...`}
            selectLabel={`No option found`}
            showSearch={true}
            showIcon={false}
            iconName={`CornerDownRight`}
            className={cn('col-span-1')}
            onChange={(selected) =>
              handleProcessTypeChange(Array.isArray(selected) ? selected[0] : selected)
            }
            options={selectProcesstypeOptions}
            value={filters.processType}
            disabled={!filters.areaId && !filters.subareaId}
          ></IGRPCombobox>
        </div>
      )}
      {showFilter && showTaskFilters && (
        <div
          className={cn(
            'grid',
            'grid-cols-2 ',
            'md:grid-cols-2 ',
            'lg:grid-cols-4 ',
            ' gap-4 px-3 mt-4',
          )}
        >
          <IGRPCombobox
            id={`Priority`}
            label={`Prioridade`}
            variant={`single`}
            placeholder={`Selecione uma prioridade...`}
            selectLabel={`No option found`}
            showSearch={true}
            showIcon={false}
            iconName={`CornerDownRight`}
            className={cn('col-span-1')}
            onChange={(selected) =>
              handlePriorityChange(Array.isArray(selected) ? selected[0] : selected)
            }
            options={selectPriorityOptions}
            value={filters.priority != null ? String(filters.priority) : ''}
          ></IGRPCombobox>

          <IGRPCombobox
            id={`CandidateGroups`}
            label={`Grupo Candidato`}
            variant={`single`}
            placeholder={`Selecione um grupo...`}
            selectLabel={`No option found`}
            showSearch={true}
            showIcon={false}
            iconName={`CornerDownRight`}
            className={cn('col-span-1')}
            onChange={(selected) =>
              handleCandidateGroupsChange(Array.isArray(selected) ? selected[0] : selected)
            }
            options={selectCandidateGroupsOptions}
            value={filters.candidateGroups}
          ></IGRPCombobox>

          <IGRPCombobox
            id={`CandidateUsers`}
            label={`Utilizador Candidato`}
            variant={`single`}
            placeholder={`Selecione um utilizador...`}
            selectLabel={`No option found`}
            showSearch={true}
            showIcon={false}
            iconName={`CornerDownRight`}
            className={cn('col-span-1')}
            onChange={(selected) =>
              handleCandidateUsersChange(Array.isArray(selected) ? selected[0] : selected)
            }
            options={selectCandidateUsersOptions}
            value={filters.candidateUsers}
          ></IGRPCombobox>
        </div>
      )}
      {showFilter && (
        <IGRPSeparator
          id={`separator2`}
          orientation={`horizontal`}
          className={cn('my-3')}
        ></IGRPSeparator>
      )}
      {showFilter && (
        <div
          className={cn(
            'flex',
            'flex flex-row flex-nowrap items-stretch justify-end gap-2',
            ' pb-3 px-3',
          )}
        >
          <IGRPButton
            id={`button1`}
            variant={`outline`}
            size={`default`}
            showIcon={true}
            iconName={`Eraser`}
            onClick={handleResetFilters}
          >
            Limpar Filtros
          </IGRPButton>
        </div>
      )}
    </div>
  );
}
