import React from "react";
import { ExtendedArea } from "../types";
import { Process } from "@igrp/platform-process-management-types";
import { IGRPButton } from "@igrp/igrp-framework-react-design-system";

interface NodeActionsProps {
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

export function NodeActions({ node, onStartProcess }: NodeActionsProps) {
  if (node.type !== "process") {
    return null;
  }

  const handleStartProcess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.data) {
      const process = node.data as Process;
      // Pass the process object as the first parameter
      onStartProcess(
        process,
        process.releaseId,
        process.processKey,
        node.applicationBase,
        undefined,
        [],
      );
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <IGRPButton
        onClick={handleStartProcess}
        title="Iniciar processo"
        aria-label="Iniciar processo"
        iconName={"Play"}
        size={"icon"}
        iconClassName="text-green-600 hover:text-green-800"
        variant={"ghost"}
      ></IGRPButton>
    </div>
  );
}
