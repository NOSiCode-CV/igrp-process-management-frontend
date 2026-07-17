import React from "react";
import { ExtendedArea } from "../types";
import { NodeActions } from "./node-actions";
import { Area, Process } from "@igrp/platform-process-management-types";
import { IGRPBadge } from "@igrp/igrp-framework-react-design-system";

interface NodeContentProps {
  node: ExtendedArea;
  onStartProcess: (
    process: Process,
    processDefinitionId: string,
    processKey: string,
    applicationBase: string,
    businessKey?: string,
    variables?: Array<{ name: string; value: string }>,
  ) => void;
}

export function NodeContent({ node, onStartProcess }: NodeContentProps) {
  const isProcess = node.type === "process";
  const isAreaOrSubarea = node.type === "area" || node.type === "subarea";

  return (
    <div className="flex items-center justify-between w-full ">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <div className="flex-1 justify-between">
          <div className="font-medium text-sm truncate">
            {node?.name || "N/A"}
          </div>
          {isAreaOrSubarea && (
            <>
              <div className="text-xs text-gray-500 truncate">
                {(node.data as Area).description}
              </div>
            </>
          )}
          {isProcess && (
            <>
              <div className="text-xs text-gray-500 truncate">
                {(node.data as Process).description}
              </div>
            </>
          )}
        </div>
        {isProcess && (
          <>
            <div className="text-xs text-gray-500 truncate">
              {(node.data as Process).description}
            </div>
            <IGRPBadge
              variant="outline"
              className="text-xs font-mono opacity-0 group-hover/process:opacity-100"
            >
              {(node.data as Process).processKey}
            </IGRPBadge>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2 flex-shrink-0">
        <NodeActions node={node} onStartProcess={onStartProcess} />
      </div>
    </div>
  );
}
