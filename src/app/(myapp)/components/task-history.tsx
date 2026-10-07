"use client";

import {
  IGRPIcon,
  IGRPButton,
  IGRPDataTable,
  IGRPDataTableFacetedFilterFn,
  IGRPCopyTo,
  cn,
  IGRPBadge,
} from "@igrp/igrp-framework-react-design-system";
import {
  formatDuration,
  getTypeColor,
  getTypeFromValue,
  getTypeIcon,
} from "../utils/columns-template";
import {
  ActivityProgress,
  TaskVariables,
} from "@igrp/platform-process-management-types";

interface TaskHistory extends ActivityProgress {
  priority?: number;
}

interface TaskHistoryProps {
  tasks: TaskHistory[];
}

function TaskHistory({ tasks }: TaskHistoryProps) {
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "Concluído",
      current: "Atual",
      pending: "Pendente",
    };
    const normalizedStatus = status.toLowerCase();
    return (
      statusMap[normalizedStatus] ||
      status.charAt(0).toUpperCase() + status.toLowerCase().slice(1)
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
      <div className="flex items-center gap-2 flex-1 min-w-0 ">
        <span className="text-sm text-foreground truncate max-w-[270px]">
          {String(variableValue)}
        </span>
        <IGRPCopyTo value={String(variableValue)} />
      </div>
    );
  };

  return (
    <>
      <IGRPDataTable<TaskHistory, TaskHistory>
        id="taskHistory"
        showFilter={true}
        showPagination={true}
        columns={[
          {
            id: "expand",
            header: "",
            size: 24,
            cell: ({ row }) => {
              const task = row.original;
              const hasVariables = task.variables && task.variables.length > 0;
              const isExpanded = row.getIsExpanded();

              if (!hasVariables) return null;

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
            header: "Tarefa",
            accessorKey: "name",
            cell: ({ row }) => {
              const task = row.original;
              return (
                <div>
                  <div className="font-medium text-foreground">
                    {task.activityName}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {task.activityId}
                  </div>
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Utilizador",
            accessorKey: "assignee",
            cell: ({ row }) => {
              const task = row.original;
              return (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                    <IGRPIcon
                      iconName="User"
                      className="h-3.5 w-3.5 text-muted-foreground"
                    />
                  </div>
                  <span className="text-sm text-foreground">
                    {task.assignee || "-"}
                  </span>
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Duração",
            accessorKey: "duration",
            cell: ({ row }) => {
              const task = row.original;
              return (
                <div className="text-sm text-muted-foreground">
                  {task.duration ? formatDuration(task.duration) : "-"}
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Resultado",
            accessorKey: "outcome",
            cell: ({ row }) => {
              const task = row.original;
              return (
                <div>
                  {task.status && (
                    <IGRPBadge
                      variant="outline"
                      className={cn(
                        task.status === "COMPLETED"
                          ? "text-[oklch(0.7_0.18_150)] border-[oklch(0.7_0.18_150)]"
                          : "text-muted-foreground",
                      )}
                    >
                      <span className="inline-flex items-center gap-1 [&>svg]:size-3 [&>svg]:shrink-0">
                        <IGRPIcon iconName="CircleCheck" className="h-3 w-3" />
                        <span className="text-sm">
                          {getStatusLabel(task.status)}
                        </span>
                      </span>
                    </IGRPBadge>
                  )}
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
        ]}
        clientFilters={[]}
        data={tasks}
        getRowCanExpand={(row) => {
          const task = row.original;
          return !!(task.variables && task.variables.length > 0);
        }}
        renderSubComponent={(row) => {
          const task = row.original;
          const hasVariables = task.variables && task.variables.length > 0;

          if (!hasVariables) return undefined;

          return (
            <div className="px-4 py-3 bg-muted/20 rounded-b-md">
              <div className="ml-10">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Variáveis da Tarefa ({task.variables!.length})
                </h4>
                <div className="space-y-2">
                  {task.variables!.map((variable, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-md bg-background border border-border"
                    >
                      <div className="flex items-center gap-2 min-w-[180px]">
                        <IGRPBadge
                          variant="soft"
                          color={getTypeColor(variable.value)}
                          className={`text-[10px] px-1.5 py-0`}
                        >
                          <span className="inline-flex items-center gap-1 [&>svg]:size-3 [&>svg]:shrink-0">
                            {getTypeIcon(variable.value)}
                            {getTypeFromValue(variable.value)}
                          </span>
                        </IGRPBadge>
                        <span className="text-sm font-medium text-foreground font-mono">
                          {variable.name}
                        </span>
                      </div>
                      {renderVariableValue(variable)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }}
      />
    </>
  );
}

export { TaskHistory };
