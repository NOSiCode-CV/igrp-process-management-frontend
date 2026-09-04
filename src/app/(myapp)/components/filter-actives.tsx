import { FilterState } from "./processtaksfilter/hooks/use-dropdown-data";
import { IGRPBadge, IGRPIcon } from "@igrp/igrp-framework-react-design-system";

function FilterActives({
  filters,
  onFiltersChange,
}: {
  filters: any;
  onFiltersChange: (filters: any) => void;
}) {
  const { variables, dateFrom, dateTo } = filters as FilterState;

  const clearDateRange = () => {
    onFiltersChange({ ...filters, dateFrom: null, dateTo: null });
  };

  const removeVariableFilter = (id: string) => {
    onFiltersChange({
      ...filters,
      variables: variables.filter((f) => f.id !== id),
    });
  };

  const getSymbol = (operator: string) => {
    switch (operator) {
      case "EQUALS":
        return "=";
      case "LIKE":
        return "~";
      case "GREATER_THAN":
        return ">";
      case "LESS_THAN":
        return "<";
      case "GREATER_THAN_OR_EQUAL":
        return ">=";
      case "LESS_THAN_OR_EQUAL":
        return "<=";
      case "NOT_EQUALS":
        return "!=";
      case "NOT_EQUALS_IGNORE_CASE":
        return "!=";
      case "EQUALS_IGNORE_CASE":
        return "=";
      case "LIKE_IGNORE_CASE":
        return "~";
      default:
        return "";
    }
  };

  return (
    <>
      {((variables && variables.length > 0) || dateFrom) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {dateFrom && (
            <IGRPBadge variant="soft" className="pr-1.5">
              <span className="inline-flex items-center gap-1.5">
                <IGRPIcon iconName="Calendar" className="size-3 shrink-0" />
                <span className="whitespace-nowrap">
                  {dateFrom}
                  {dateTo && ` / ${dateTo}`}
                </span>
                <button
                  onClick={clearDateRange}
                  className="ml-1 inline-flex items-center rounded p-0.5 hover:bg-muted"
                >
                  <IGRPIcon iconName="X" className="size-3 shrink-0" />
                </button>
              </span>
            </IGRPBadge>
          )}
          {variables
            .filter((f) => f.value !== "")
            .map((filter) => (
              <IGRPBadge key={filter.id} variant="soft" className="pr-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-mono text-xs">{filter.name}</span>
                  <span className="text-muted-foreground">
                    {getSymbol(filter.operator)}
                  </span>
                  <span className="font-medium">{filter.value}</span>
                  <button
                    onClick={() => removeVariableFilter(filter.id)}
                    className="ml-1 inline-flex items-center rounded p-0.5 hover:bg-muted"
                  >
                    <IGRPIcon iconName="X" className="size-3 shrink-0" />
                  </button>
                </span>
              </IGRPBadge>
            ))}
        </div>
      )}
    </>
  );
}

export { FilterActives };
