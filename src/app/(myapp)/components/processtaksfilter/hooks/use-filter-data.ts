import { useState } from "react";
import { useDropdownData, FilterState } from "./use-dropdown-data";

export function useFilterData(isProcess?: boolean) {
  const initialFilters = {
    areaId: "",
    subareaId: "",
    processType: "",
    processNumber: "",
    status: "",
    dateFrom: null,
    dateTo: null,
    organic: "",
    user: "",
    candidateGroups: "",
    candidateUsers: "",
    name: "",
    priority: undefined,
    variables: [],
  };
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const { dropdownOptions } = useDropdownData(filters, isProcess);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    updateFilters(initialFilters);
  };

  return {
    filters,
    dropdownOptions,
    updateFilters,
    resetFilters,
  };
}
