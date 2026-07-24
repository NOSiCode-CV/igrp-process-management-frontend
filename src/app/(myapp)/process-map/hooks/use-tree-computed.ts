import { useMemo } from "react";
import { ExtendedArea } from "../types";
import { buildProcessTree, flattenTreeNodes } from "../utils/tree-utils";
import { Process } from "@igrp/platform-process-management-types";

export function useTreeComputed(
  areas: ExtendedArea[],
  expandedNodes: Set<string>,
  allProcesses: Process[],
) {
  // NOTE: `allProcesses` MUST be in the deps — the access filter reads it. It
  // loads from a separate query (usually after `areas`), so omitting it left
  // the tree built against an empty process set → "Ver Mapa" pruned everything.
  const treeNodes = useMemo(() => {
    return buildProcessTree(areas, allProcesses);
  }, [areas, allProcesses]);

  // Management view: every area must show (no pruning, no access filter).
  const manageNodes = useMemo(() => {
    return buildProcessTree(areas, allProcesses, {
      pruneEmpty: false,
      filterByAccess: false,
    });
  }, [areas, allProcesses]);

  const flatNodes = useMemo(() => {
    return flattenTreeNodes(treeNodes, expandedNodes);
  }, [treeNodes, expandedNodes]);

  const totalProcesses = useMemo(() => {
    const countProcesses = (nodes: ExtendedArea[]): number => {
      return nodes.reduce((count, node) => {
        if (node.type === "process") {
          return count + 1;
        }
        if (node.children) {
          return count + countProcesses(node.children);
        }
        return count;
      }, 0);
    };
    return countProcesses(treeNodes);
  }, [treeNodes]);

  const totalAreas = useMemo(() => {
    const countAreas = (nodes: ExtendedArea[]): number => {
      return nodes.reduce((count, node) => {
        if (node.type === "area" || node.type === "subarea") {
          return count + 1;
        }
        if (node.children) {
          return count + countAreas(node.children);
        }
        return count;
      }, 0);
    };
    return countAreas(treeNodes);
  }, [treeNodes]);

  return {
    treeNodes,
    manageNodes,
    flatNodes,
    totalProcesses,
    totalAreas,
  };
}
