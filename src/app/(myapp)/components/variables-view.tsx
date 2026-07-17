"use client";

import { format } from "date-fns";
import {
  IGRPIcon,
  IGRPButton,
  IGRPDataTable,
  IGRPDataTableFacetedFilterFn,
  IGRPCopyTo,
  IGRPBadge,
} from "@igrp/igrp-framework-react-design-system";
import { TaskVariables } from "@igrp/platform-process-management-types";
import {
  getTypeColor,
  getTypeFromValue,
  getTypeIcon,
} from "../utils/columns-template";

interface VariablesViewProps {
  variables: TaskVariables[];
}

export function VariablesView({ variables }: VariablesViewProps) {
  const isExpandable = (variable: TaskVariables) => {
    const type = getTypeFromValue(variable.value);
    return (
      type === "json" ||
      (typeof variable.value === "object" && variable.value !== null)
    );
  };

  const renderVariableValue = (variable: TaskVariables) => {
    const isJson = typeof variable.value === "object";
    const variableValue = variable.value;

    if (isJson) {
      return (
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto max-h-32 flex-1 text-foreground">
              {JSON.stringify(variableValue, null, 2)}
            </pre>
            <IGRPCopyTo value={JSON.stringify(variableValue, null, 2)} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm text-foreground truncate">
          {String(variableValue)}
        </span>
        <IGRPCopyTo value={String(variableValue)} />
      </div>
    );
  };

  return (
    <>
      <IGRPDataTable<TaskVariables, TaskVariables>
        id="processVariables"
        showFilter={true}
        showPagination={true}
        columns={[
          {
            id: "expand",
            header: "",
            size: 24,
            cell: ({ row }) => {
              const variable = row.original;
              const expandable = isExpandable(variable);
              const isExpanded = row.getIsExpanded();

              if (!expandable) return null;

              return (
                <div className="w-6 flex items-center justify-center">
                  <IGRPButton
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      row.toggleExpanded();
                    }}
                    iconName={isExpanded ? "ChevronDown" : "ChevronRight"}
                    aria-label={isExpanded ? "Recolher" : "Expandir"}
                  />
                </div>
              );
            },
            enableHiding: false,
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Tipo",
            accessorKey: "value",
            cell: ({ row }) => {
              const variable = row.original;
              const type = getTypeFromValue(variable.value);
              const TypeIcon = getTypeIcon(variable.value);
              return (
                <div className="flex items-center gap-2">
                  <IGRPBadge
                    variant="soft"
                    color={getTypeColor(variable.value)}
                    className={`text-[10px] px-1.5 py-0`}
                  >
                    {TypeIcon}
                    {type}
                  </IGRPBadge>
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Nome",
            accessorKey: "name",
            cell: ({ row }) => {
              const variable = row.original;
              return (
                <div className="font-mono text-sm font-medium text-foreground">
                  {variable.name}
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Valor",
            accessorKey: "value",
            cell: ({ row }) => {
              const variable = row.original;
              const expandable = isExpandable(variable);
              const isExpanded = row.getIsExpanded();

              if (expandable) {
                return (
                  <div className="min-w-0">
                    <span className="text-sm text-muted-foreground truncate">
                      {isExpanded
                        ? "Clique para recolher"
                        : JSON.stringify(variable.value).slice(0, 50) + "..."}
                    </span>
                  </div>
                );
              }

              return (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm text-foreground bg-muted/50 px-2 py-1 rounded truncate max-w-[200px]">
                    {String(variable.value)}
                  </span>
                  <IGRPCopyTo value={String(variable.value)} />
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          /* {
            header: "Última Atualização",
            accessorKey: "lastUpdatedTime",
            cell: ({ row }) => {
              const variable = row.original;
              const lastUpdatedTime = (variable as any).lastUpdatedTime;
              return (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <IGRPIcon iconName="Calendar" className="h-3.5 w-3.5" />
                  {lastUpdatedTime
                    ? format(lastUpdatedTime, "MMM d, HH:mm")
                    : "N/A"}
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          }, */
        ]}
        clientFilters={[]}
        data={variables}
        getRowCanExpand={(row) => {
          const variable = row.original;
          return isExpandable(variable);
        }}
        renderSubComponent={(row) => {
          const variable = row.original;
          const expandable = isExpandable(variable);

          if (!expandable) return undefined;

          return (
            <div className="px-4 py-3 bg-muted/20 rounded-b-md">
              <div className="ml-10">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Detalhes do Valor
                  </h4>
                  {(variable as any).createTime && (
                    <span className="text-xs text-muted-foreground">
                      Criado:{" "}
                      {format(
                        (variable as any).createTime,
                        "MMM d, yyyy HH:mm",
                      )}
                    </span>
                  )}
                </div>
                <div className="p-3 rounded-md bg-background border border-border">
                  {renderVariableValue(variable)}
                </div>
              </div>
            </div>
          );
        }}
      />
    </>
  );
}
