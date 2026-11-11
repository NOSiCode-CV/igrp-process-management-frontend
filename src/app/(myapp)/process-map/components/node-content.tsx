import React from "react";
import { ExtendedArea } from "../types";
import { NodeActions } from "./node-actions";
import { Area, Process } from "@igrp/platform-process-management-types";

interface NodeContentProps {
  node: ExtendedArea;
}

export function NodeContent({ node }: NodeContentProps) {
  const isProcess = node.type === "process";
  const isAreaOrSubarea = node.type === "area" || node.type === "subarea";

  const description = isProcess
    ? (node.data as Process).description
    : isAreaOrSubarea
      ? (node.data as Area).description
      : undefined;
  // The process code (e.g. P3.4.1) reads as a quiet monospace caption under the
  // name — always visible and aligned, instead of a pill floating between the
  // name and the start button.
  const processKey = isProcess ? (node.data as Process).processKey : undefined;

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm truncate">
          {node?.name || "N/A"}
        </div>
        {(processKey || description) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            {processKey && (
              <span className="shrink-0 font-mono text-[11px] tracking-tight">
                {processKey}
              </span>
            )}
            {processKey && description && (
              <span aria-hidden="true" className="shrink-0 opacity-40">
                ·
              </span>
            )}
            {description && <span className="truncate">{description}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <NodeActions node={node} />
      </div>
    </div>
  );
}
