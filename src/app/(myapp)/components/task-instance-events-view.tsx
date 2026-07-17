"use client";

import { useMemo } from "react";
import {
  IGRPIcon,
  IGRPDataTable,
  IGRPDataTableFacetedFilterFn,
  IGRPCopyTo,
  IGRPBadge,
  IGRPButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  type IGRPIconName,
} from "@igrp/igrp-framework-react-design-system";
import { TaskInstanceEvent } from "@igrp/platform-process-management-types";
import { format } from "date-fns";

interface TaskInstanceEventsViewProps {
  events: TaskInstanceEvent[];
}

export function TaskInstanceEventsView({
  events,
}: TaskInstanceEventsViewProps) {
  const sortedEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    return [...events].sort((a, b) => {
      const dateA = new Date(a.performedAt).getTime();
      const dateB = new Date(b.performedAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [events]);

  const getEventTypeLabel = (eventType: string) => {
    const eventTypeMap: Record<string, string> = {
      ASSIGN: "Atribuído",
      CLAIM: "Assumido",
      UNCLAIM: "Não Assumido",
      COMPLETE: "Terminado",
      CREATE: "Criado",
    };
    return eventTypeMap[eventType] || eventType;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      ASSIGNED: "Atribuído",
      UNASSIGNED: "Não Atribuído",
      COMPLETED: "Terminado",
      CREATED: "Criado",
    };
    return statusMap[status] || status;
  };

  const getEventTypeColor = (eventType: string) => {
    const colorMap: Record<string, string> = {
      ASSIGN: "text-[oklch(0.6_0.2_250)] border-[oklch(0.6_0.2_250)]",
      CLAIM: "text-[oklch(0.6_0.2_200)] border-[oklch(0.6_0.2_200)]",
      UNCLAIM: "text-[oklch(0.6_0.2_30)] border-[oklch(0.6_0.2_30)]",
      COMPLETE: "text-[oklch(0.7_0.18_150)] border-[oklch(0.7_0.18_150)]",
      CREATE: "text-[oklch(0.6_0.2_280)] border-[oklch(0.6_0.2_280)]",
    };
    return (
      colorMap[eventType] || "text-muted-foreground border-muted-foreground"
    );
  };

  const getEventTypeIcon = (eventType: string) => {
    const iconMap: Record<string, string> = {
      ASSIGN: "UserCheck",
      CLAIM: "UserPlus",
      UNCLAIM: "UserMinus",
      COMPLETE: "CircleCheck",
      CREATE: "CirclePlus",
    };
    return iconMap[eventType] || "Circle";
  };

  return (
    <>
      <IGRPDataTable<TaskInstanceEvent, TaskInstanceEvent>
        id="taskInstanceEvents"
        showFilter={true}
        showPagination={true}
        columns={[
          {
            header: "Tipo de Evento",
            accessorKey: "eventType",
            cell: ({ row }) => {
              const event = row.original;
              const eventType = event.eventType;
              const iconName = getEventTypeIcon(eventType);
              return (
                <div className="flex items-center gap-2">
                  <IGRPBadge
                    variant="outline"
                    showIcon
                    iconName={iconName as IGRPIconName}
                    className={`text-[10px] px-1.5 py-0 ${getEventTypeColor(eventType)}`}
                  >
                    {getEventTypeLabel(eventType)}
                  </IGRPBadge>
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Estado",
            accessorKey: "status",
            cell: ({ row }) => {
              const event = row.original;
              return (
                <div className="flex items-center gap-2">
                  <IGRPBadge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 text-muted-foreground"
                  >
                    {getStatusLabel(event.status)}
                  </IGRPBadge>
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Realizado Por",
            accessorKey: "performedBy",
            cell: ({ row }) => {
              const event = row.original;
              return (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                    <IGRPIcon
                      iconName="User"
                      className="h-3.5 w-3.5 text-muted-foreground"
                    />
                  </div>
                  <span className="text-sm text-foreground font-mono">
                    {event.userProfilePerformedBy?.fullName ||
                      event.performedBy}
                  </span>
                  <IGRPCopyTo value={event.performedBy} />
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Data/Hora",
            accessorKey: "performedAt",
            cell: ({ row }) => {
              const event = row.original;
              try {
                const date = new Date(event.performedAt);
                return (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <IGRPIcon iconName="Calendar" className="h-3.5 w-3.5" />
                    <span>{format(date, "MMM d, yyyy HH:mm")}</span>
                  </div>
                );
              } catch {
                return (
                  <div className="text-sm text-muted-foreground">
                    {event.performedAt}
                  </div>
                );
              }
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
          {
            header: "Observações",
            accessorKey: "obs",
            cell: ({ row }) => {
              const event = row.original;
              if (!event.obs) {
                return <></>;
              }
              return (
                <div className="max-w-[200px]">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-foreground truncate">
                      {event.obs}
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <IGRPButton
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                          iconName="Info"
                          aria-label="Ver observações"
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-2">
                          <h4 className="font-medium">Observações</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.obs}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <IGRPCopyTo value={event.obs} />
                  </div>
                </div>
              );
            },
            filterFn: IGRPDataTableFacetedFilterFn,
          },
        ]}
        clientFilters={[]}
        data={sortedEvents}
      />
    </>
  );
}
