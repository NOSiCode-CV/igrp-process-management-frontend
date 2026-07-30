"use client";

import { IGRPIcon } from "@igrp/igrp-framework-react-design-system";
import { format } from "date-fns";
import { formatDuration } from "../utils/shared";
import { ActivityProgress } from "@igrp/platform-process-management-types";

export function ActivityTimeline({
  activities = [],
}: {
  activities: ActivityProgress[];
}) {
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: "Concluído",
      current: "Atual",
      pending: "Pendente",
    };
    return (
      statusMap[status.toLowerCase()] ||
      status.charAt(0).toUpperCase() + status.slice(1)
    );
  };
  const activityIcons: Record<string, React.ReactNode> = {
    USER_TASK: <IGRPIcon iconName="User" />,
    SERVICE_TASK: <IGRPIcon iconName="Cog" />,
    SCRIPT_TASK: <IGRPIcon iconName="Code" />,
    MANUAL_TASK: <IGRPIcon iconName="Hand" />,
    RECEIVE_TASK: <IGRPIcon iconName="Receive" />,
    SEND_TASK: <IGRPIcon iconName="Send" />,
    BUSINESS_RULE_TASK: <IGRPIcon iconName="Rule" />,
    EXCLUSIVE_GATEWAY: <IGRPIcon iconName="GitBranch" />,
    PARALLEL_GATEWAY: <IGRPIcon iconName="GitFork" />,
    INCLUSIVE_GATEWAY: <IGRPIcon iconName="GitBranch" />,
    MESSAGE_INTERMEDIATE_EVENT_CATCH: <IGRPIcon iconName="Message" />,
    CALL_ACTIVITY: <IGRPIcon iconName="Phone" />,
    SUB_PROCESS: <IGRPIcon iconName="Layers" />,
    OTHER: <IGRPIcon iconName="Cog" />,
  };

  const activityColors: Record<string, string> = {
    USER_TASK: "bg-[oklch(0.7_0.18_150)]",
    SERVICE_TASK: "bg-[oklch(0.6_0.18_280)]",
    SCRIPT_TASK: "bg-[oklch(0.7_0.18_150)]",
    MANUAL_TASK: "bg-[oklch(0.7_0.18_150)]",
    RECEIVE_TASK: "bg-[oklch(0.7_0.18_150)]",
    SEND_TASK: "bg-[oklch(0.7_0.18_150)]",
    BUSINESS_RULE_TASK: "bg-[oklch(0.7_0.18_150)]",
    EXCLUSIVE_GATEWAY: "bg-[oklch(0.75_0.18_80)]",
    PARALLEL_GATEWAY: "bg-[oklch(0.75_0.18_80)]",
    INCLUSIVE_GATEWAY: "bg-[oklch(0.75_0.18_80)]",
    MESSAGE_INTERMEDIATE_EVENT_CATCH: "bg-[oklch(0.7_0.18_150)]",
    CALL_ACTIVITY: "bg-[oklch(0.7_0.18_150)]",
    SUB_PROCESS: "bg-[oklch(0.65_0.15_250)]",
    OTHER: "bg-gray-300",
    parallelGateway: "bg-[oklch(0.75_0.18_80)]",
  };

  return (
    <div className="space-y-6">
      {activities.length > 0 ? (
        activities.map((activity, index) => {
          const activityType = activity.type ?? "OTHER";
          const Icon = activityIcons[activityType] || (
            <IGRPIcon iconName="Cog" />
          );
          const color = activityColors[activityType] || "bg-muted";

          const status = activity.status ? activity.status.toLowerCase() : "";
          const durationMs =
            activity.durationMillis ?? activity.duration ?? undefined;

          return (
            <div key={index} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${color} text-background`}
              >
                {Icon}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {activity.activityName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {activity.activityId}
                    </p>
                  </div>
                  <div className="text-right">
                    {activity.startTime ? (
                      <>
                        <div className="text-sm text-foreground">
                          {format(new Date(activity.startTime), "HH:mm:ss")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(activity.startTime), "MMM d, yyyy")}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Pendente
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="mt-2 flex items-center gap-4 text-sm">
                  {activity.assignee && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <IGRPIcon iconName="User" />
                      {activity.assignee}
                    </div>
                  )}
                  {durationMs !== undefined && (
                    <div className="text-muted-foreground">
                      Duração: {formatDuration(durationMs)}
                    </div>
                  )}
                  <div
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      status === "completed"
                        ? "bg-[oklch(0.7_0.18_150)]/20 text-[oklch(0.7_0.18_150)]"
                        : status === "current"
                          ? "bg-[oklch(0.65_0.15_250)]/20 text-[oklch(0.65_0.15_250)]"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getStatusLabel(status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center text-muted-foreground">
          Nenhuma atividade encontrada
        </div>
      )}
    </div>
  );
}
