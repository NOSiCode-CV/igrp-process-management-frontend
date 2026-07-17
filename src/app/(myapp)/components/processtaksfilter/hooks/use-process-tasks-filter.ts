import { useMemo, useEffect, useRef } from "react";
import { useFilterData } from "./use-filter-data";
import {
  DateRange,
  IGRPOptionsProps,
} from "@igrp/igrp-framework-react-design-system";
import { VariableFilter } from "../../filter-data";
import { format } from "date-fns";
import { useBusinessGroups } from "../../../access-management/use-business-groups";
import { useBusinessUsers } from "../../../access-management/use-business-users";

export function useProcessTasksFilter(
  setSelectAreaOptions: (options: IGRPOptionsProps[]) => void,
  setSelectSubareaOptions: (options: IGRPOptionsProps[]) => void,
  setSelectProcesstypeOptions: (options: IGRPOptionsProps[]) => void,
  setSelectStatusOptions: (options: IGRPOptionsProps[]) => void,
  setSelectOrganicOptions: (options: IGRPOptionsProps[]) => void,
  setSelectUserOptions: (options: IGRPOptionsProps[]) => void,
  onFiltersChange?: (filters: any) => void,
  isProcess?: boolean,
  // Options for the beta.19 task filters (candidate groups / users). Optional:
  // pages that don't surface these filters simply omit the setters.
  setSelectCandidateGroupsOptions?: (options: IGRPOptionsProps[]) => void,
  setSelectCandidateUsersOptions?: (options: IGRPOptionsProps[]) => void,
) {
  const { filters, dropdownOptions, updateFilters, resetFilters } =
    useFilterData(isProcess);
  const isInitialMount = useRef(true);
  const prevFiltersRef = useRef(filters);

  // Transform dropdown options to IGRP format
  const transformedAreaOptions = useMemo((): IGRPOptionsProps[] => {
    return dropdownOptions.areas.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [dropdownOptions.areas]);

  const transformedSubareaOptions = useMemo((): IGRPOptionsProps[] => {
    return dropdownOptions.subareas.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [dropdownOptions.subareas]);

  const transformedProcesstypeOptions = useMemo((): IGRPOptionsProps[] => {
    return dropdownOptions.processTypes.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [dropdownOptions.processTypes]);

  const transformedStatusOptions = useMemo((): IGRPOptionsProps[] => {
    return dropdownOptions.statuses.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [dropdownOptions.statuses]);

  const transformedOrganicOptions = useMemo((): IGRPOptionsProps[] => {
    return dropdownOptions.organics.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [dropdownOptions.organics]);

  const transformedUserOptions = useMemo((): IGRPOptionsProps[] => {
    return dropdownOptions.users.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [dropdownOptions.users]);

  // Candidate groups / users come from access-management (beta.19 filters).
  const { groupOptions } = useBusinessGroups();
  const { userOptions } = useBusinessUsers();

  const transformedCandidateGroupOptions = useMemo((): IGRPOptionsProps[] => {
    return groupOptions.map((option) => ({
      label: option.name,
      value: option.value,
    }));
  }, [groupOptions]);

  const transformedCandidateUserOptions = useMemo((): IGRPOptionsProps[] => {
    return userOptions.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [userOptions]);

  // Update the IGRPStudio generated state variables when dropdown options change
  useEffect(() => {
    setSelectAreaOptions(transformedAreaOptions);
  }, [transformedAreaOptions, setSelectAreaOptions]);

  useEffect(() => {
    setSelectSubareaOptions(transformedSubareaOptions);
  }, [transformedSubareaOptions, setSelectSubareaOptions]);

  useEffect(() => {
    setSelectProcesstypeOptions(transformedProcesstypeOptions);
  }, [transformedProcesstypeOptions, setSelectProcesstypeOptions]);

  useEffect(() => {
    setSelectStatusOptions(transformedStatusOptions);
  }, [transformedStatusOptions, setSelectStatusOptions]);

  useEffect(() => {
    setSelectOrganicOptions(transformedOrganicOptions);
  }, [transformedOrganicOptions, setSelectOrganicOptions]);

  useEffect(() => {
    setSelectUserOptions(transformedUserOptions);
  }, [transformedUserOptions, setSelectUserOptions]);

  useEffect(() => {
    setSelectCandidateGroupsOptions?.(transformedCandidateGroupOptions);
  }, [transformedCandidateGroupOptions, setSelectCandidateGroupsOptions]);

  useEffect(() => {
    setSelectCandidateUsersOptions?.(transformedCandidateUserOptions);
  }, [transformedCandidateUserOptions, setSelectCandidateUsersOptions]);

  // Notify parent component when filters change (except on initial mount and area/subarea changes)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevFiltersRef.current = filters;
      return;
    }

    // Check if filters changed (excluding area/subarea which trigger dropdown updates)
    const hasChanged =
      prevFiltersRef.current.processType !== filters.processType ||
      prevFiltersRef.current.status !== filters.status ||
      prevFiltersRef.current.organic !== filters.organic ||
      prevFiltersRef.current.user !== filters.user ||
      prevFiltersRef.current.processNumber !== filters.processNumber ||
      prevFiltersRef.current.dateFrom !== filters.dateFrom ||
      prevFiltersRef.current.dateTo !== filters.dateTo ||
      prevFiltersRef.current.candidateGroups !== filters.candidateGroups ||
      prevFiltersRef.current.candidateUsers !== filters.candidateUsers ||
      prevFiltersRef.current.name !== filters.name ||
      prevFiltersRef.current.priority !== filters.priority ||
      JSON.stringify(prevFiltersRef.current.variables) !==
        JSON.stringify(filters.variables);

    if (hasChanged && onFiltersChange) {
      onFiltersChange(filters);
    }

    prevFiltersRef.current = filters;
  }, [
    filters.processType,
    filters.status,
    filters.organic,
    filters.user,
    filters.processNumber,
    filters.dateFrom,
    filters.dateTo,
    filters.candidateGroups,
    filters.candidateUsers,
    filters.name,
    filters.priority,
    filters.variables,
    onFiltersChange,
  ]);

  // Handle filter changes
  const handleAreaChange = (selected: string | string[]) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    const newFilters = { areaId: value, subareaId: "", processType: "" };
    updateFilters(newFilters);
    // Don't apply filters immediately for area/subarea changes as they affect dropdown options
  };

  const handleSubareaChange = (selected: string | string[]) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    const newFilters = { subareaId: value, processType: "" };
    updateFilters(newFilters);
    // Don't apply filters immediately for area/subarea changes as they affect dropdown options
  };

  const handleProcessTypeChange = (selected: string | string[]) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    const newFilters = { processType: value };
    updateFilters(newFilters);
  };

  const handleStatusChange = (selected: string | string[]) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    const newFilters = { status: value };
    updateFilters(newFilters);
  };

  const handleOrganicChange = (selected: string | string[]) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    const newFilters = { organic: value };
    updateFilters(newFilters);
  };

  const handleUserChange = (selected: string | string[]) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    const newFilters = { user: value };
    updateFilters(newFilters);
  };

  const handleProcessNumberChange = (value: string) => {
    const newFilters = { processNumber: value };
    updateFilters(newFilters);
  };

  const handleDateChange = (date: DateRange | null) => {
    const dateFrom = date?.from ? format(date.from, "dd-MM-yyyy") : null;
    const dateTo = date?.to ? format(date.to, "dd-MM-yyyy") : null;
    updateFilters({ dateFrom, dateTo });
  };

  const handleFiltersChange = (variables: VariableFilter[]) => {
    updateFilters({ variables });
  };

  const handleCandidateGroupsChange = (selected: string | string[]) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    updateFilters({ candidateGroups: value });
  };

  const handleCandidateUsersChange = (selected: string | string[]) => {
    const value = Array.isArray(selected) ? selected[0] : selected;
    updateFilters({ candidateUsers: value });
  };

  const handleNameChange = (value: string) => {
    updateFilters({ name: value });
  };

  const handlePriorityChange = (value: string | number) => {
    const num =
      typeof value === "number" ? value : value === "" ? NaN : Number(value);
    updateFilters({ priority: Number.isNaN(num) ? undefined : num });
  };

  return {
    // Filter values
    filters,
    resetFilters,
    // Actions
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
    handleNameChange,
    handlePriorityChange,
  };
}
