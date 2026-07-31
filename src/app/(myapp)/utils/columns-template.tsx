import {
  IGRPBadge,
  IGRPCopyTo,
  IGRPIcon,
  IGRPDataTableCellBadge,
  Progress,
  cn,
  type IGRPColorVariants,
  type IGRPIconName,
} from "@igrp/igrp-framework-react-design-system";
import { format } from "date-fns";
import {
  getProcessInstanceStatusLabel,
  ProcessInstanceStatus,
} from "./status-helpers";

const progressColor = (status: string) => {
  if (status === "completed") return "bg-emerald-500";
  if (status === "terminated") return "bg-red-500";
  if (status === "suspended") return "bg-amber-500";
  return "bg-blue-500";
};

/** Options returned by getPriorityBadge / getPriorityBadgeFromApi for rendering the priority badge. */
export interface PriorityBadgeOptions {
  label: string;
  color?: IGRPColorVariants;
  badgeStyle?: React.CSSProperties;
}

/** True when a priority is present (1–5 scale). Missing/0/blank → empty cell. */
export function hasPriorityValue(
  priority: string | number | null | undefined,
): boolean {
  if (priority == null) return false;
  if (typeof priority === "string") {
    const t = priority.trim();
    if (!t || t === "undefined" || t === "null") return false;
    const n = Number(t);
    return !Number.isNaN(n) && n > 0;
  }
  return !Number.isNaN(priority) && priority > 0;
}

/**
 * Priority badge aligned with status badges: `variant="soft"` (no hard border look).
 * Returns empty when there is no priority — no fallback label.
 */
export const getPriorityTemplate = (
  opts: PriorityBadgeOptions | null | undefined,
  priorityValue: string | number | null | undefined,
) => {
  if (!hasPriorityValue(priorityValue)) return "";
  const label = opts?.label?.trim();
  if (!label) return "";

  // Same surface as Estado (`soft`); kill residual border from the DS base class.
  const badgeClassName = "border-transparent shadow-none";

  if (opts?.badgeStyle) {
    return (
      <IGRPBadge
        variant="soft"
        style={opts.badgeStyle}
        className={badgeClassName}
      >
        {label}
      </IGRPBadge>
    );
  }
  return (
    <IGRPBadge variant="soft" color={opts?.color} className={badgeClassName}>
      {label}
    </IGRPBadge>
  );
};

export const getDateTemplate = (date_: string | Date) => {
  return date_ ? (
    <>
      <div className={cn("flex items-center")}>
        <IGRPIcon
          name="dateIcon"
          iconName="Calendar"
          size={16}
          className={cn("mr-1")}
        />
        <span>{format(new Date(date_), "MMM dd, yyyy HH:mm")}</span>
      </div>
    </>
  ) : (
    ""
  );
};

export const getUserInfo = (assignee: string) => {
  return assignee ? (
    <div className={cn("flex items-center")}>
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 bg-muted rounded-full flex items-center justify-center",
        )}
      >
        <IGRPIcon
          name="userIcon"
          iconName="User"
          size={16}
          className={cn("text-muted-foreground")}
        />
      </div>
      <div className={cn("ml-2")}>
        <div className={cn("text-sm font-medium text-foreground")}>
          {assignee}
        </div>
      </div>
    </div>
  ) : (
    <span className={cn("text-sm text-muted-foreground")}>Unassigned</span>
  );
};

export const getProcessInfo = (processName: string, processNumber: string) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium">{processName}</span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs text-muted-foreground">
          {processNumber}
        </span>
        <IGRPCopyTo
          value={processNumber}
          tooltipMessage="Copy Process Number"
          triggerClassName="p-0.5 rounded hover:bg-muted transition-colors"
        />
      </div>
    </div>
  );
};

const processStatusColor = (
  status: ProcessInstanceStatus,
): IGRPColorVariants => {
  switch (status) {
    case "CREATED":
      return "info";
    case "RUNNING":
      return "warning";
    case "SUSPENDED":
      return "secondary";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
    case "TERMINATED":
      return "destructive";
    default:
      return "secondary";
  }
};

export const getProcessStatusTemplate = (status: ProcessInstanceStatus) => {
  return (
    <IGRPBadge dot variant="soft" color={processStatusColor(status)}>
      {getProcessInstanceStatusLabel(status)}
    </IGRPBadge>
  );
};

export const getText = (text: string) => {
  return <span className={cn("text-sm text-muted-foreground")}>{text}</span>;
};

export const getProgressTemplate = (progress: string, status: string) => {
  // Parse the progress string "0/3" format
  const [completedStr, totalStr] = progress.split("/");
  const completedTasks = parseInt(completedStr) || 0;
  const totalTasks = parseInt(totalStr) || 0;

  const progressColorClass = progressColor(status.toLowerCase());

  const progressValue = Number(
    ((completedTasks * 100) / totalTasks).toFixed(2),
  );

  return (
    <div className="flex items-center gap-2">
      <Progress
        value={progressValue}
        className={`w-18 h-2 flex-1`}
        indicatorClassName={`bg-primary ${progressColorClass}`}
      />
      <span className="text-xs text-muted-foreground font-mono w-10">
        {completedTasks}/{totalTasks}
      </span>
    </div>
  );
};

export const getBusinessKeyTemplate = (businessKey: string) => {
  return (
    <div className="flex items-center gap-1.5">
      <IGRPBadge variant="soft" className="font-mono text-xs">
        {businessKey}
      </IGRPBadge>
      <IGRPCopyTo
        value={businessKey}
        tooltipMessage="Copy Business Key"
        triggerClassName="p-0.5 rounded hover:bg-muted transition-colors"
      />
    </div>
  );
};

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export const getTypeFromValue = (value: unknown): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object") {
    return "json";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "double";
  }
  return typeof value;
};

export const getTypeColor = (value: unknown): IGRPColorVariants => {
  const type = getTypeFromValue(value);
  switch (type) {
    case "string":
      return "info";
    case "integer":
    case "double":
      return "indigo";
    case "boolean":
      return "success";
    case "json":
    case "array":
    case "object":
      return "warning";
    case "null":
    case "undefined":
      return "secondary";
    default:
      return "secondary";
  }
};

export const getTypeIcon = (value: unknown) => {
  const type = getTypeFromValue(value);
  switch (type) {
    case "string":
      return <IGRPIcon iconName="Type" />;
    case "integer":
    case "double":
      return <IGRPIcon iconName="Hash" />;
    case "boolean":
      return <IGRPIcon iconName="ToggleLeft" />;
    case "json":
    case "array":
    case "object":
      return <IGRPIcon iconName="Braces" />;
    default:
      return <IGRPIcon iconName="Type" />;
  }
};

/**
 * Icon NAME (not JSX) for a value's type — for use with IGRPBadge's
 * `showIcon`/`iconName` props so the badge renders the icon inline (a raw
 * <IGRPIcon> child renders oversized/stacked because the badge's `[&>svg]`
 * sizing only targets direct svg children).
 */
export const getTypeIconName = (value: unknown): IGRPIconName => {
  const type = getTypeFromValue(value);
  switch (type) {
    case "integer":
    case "double":
      return "Hash";
    case "boolean":
      return "ToggleLeft";
    case "json":
    case "array":
    case "object":
      return "Braces";
    default:
      return "Type";
  }
};

export const getCandidateGroupsTemplate = (candidateGroups: string[]) => {
  const groups = candidateGroups ?? [];
  return (
    <div className="flex flex-wrap gap-1">
      {groups.slice(0, 2).map((group) => (
        <IGRPBadge key={group} variant="soft" className="text-xs">
          {group}
        </IGRPBadge>
      ))}
      {candidateGroups.length > 2 && (
        <IGRPBadge variant="outline" className="text-xs">
          +{candidateGroups.length - 2}
        </IGRPBadge>
      )}
    </div>
  );
};
