import React from "react";
import { ExtendedArea } from "../types";
import { NodeIcon } from "./node-icon";
import { NodeContent } from "./node-content";
import { ExpandButton } from "./expand-button";
import { Process } from "@igrp/platform-process-management-types";

interface TreeNodeProps {
  node: ExtendedArea;
  expandedNodes: Set<string>;
  onToggle: (node: ExtendedArea) => void;
  onStartProcess: (
    process: Process,
    processDefinitionId: string,
    processKey: string,
    applicationBase: string,
    businessKey?: string,
    variables?: Array<{ name: string; value: string }>,
  ) => void;
  searchTerm?: string;
}

export function TreeNode({
  node,
  expandedNodes,
  onToggle,
  onStartProcess,
  searchTerm,
}: TreeNodeProps) {
  const { color, id, type, level = 0, children } = node;

  const isExpanded = expandedNodes.has(id);
  const hasChildren = children && children.length > 0;
  const isProcess = type === "process";

  const startProcess = () => {
    if (!node.data) return;
    const process = node.data as Process;
    onStartProcess(
      process,
      process.releaseId,
      process.processKey,
      node.applicationBase,
      undefined,
      [],
    );
  };

  // A process row is a single, large interactive control: clicking (or
  // Enter/Space) anywhere on the row starts the process — a forgiving target
  // (WCAG 2.5.5) for imprecise pointers and fully keyboard-operable. The row is
  // the ONLY control in a process leaf (the "Iniciar" affordance is decorative
  // and the expand slot is a placeholder), so there are no nested interactive
  // elements. Area/subarea rows keep their click-to-toggle behaviour, with the
  // ExpandButton as the keyboard-reachable control.
  const processName = node.name ?? "";
  const rowInteractiveProps = isProcess
    ? {
        role: "button" as const,
        tabIndex: 0,
        "aria-label": `Iniciar processo: ${processName}`,
        title: `Iniciar processo: ${processName}`,
        onClick: startProcess,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startProcess();
          }
        },
      }
    : { onClick: () => onToggle(node) };

  return (
    <div className="w-full">
      <div
        className="relative flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-md cursor-pointer group/process focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        {...rowInteractiveProps}
      >
        <ExpandButton
          isExpanded={isExpanded}
          hasChildren={isProcess ? false : hasChildren || type === "area"}
          onToggle={() => onToggle(node)}
        />

        {color && (
          <div className="h-4 w-5 rounded" style={{ backgroundColor: color }} />
        )}

        <NodeIcon node={node} isExpanded={isExpanded} />

        <NodeContent node={node} />
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onStartProcess={onStartProcess}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
