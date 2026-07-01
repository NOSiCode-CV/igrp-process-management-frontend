import { Process } from "@igrp/platform-process-management-types";
import { ExtendedArea } from "../types";

/**
 * Converts flat areas with processes into a hierarchical tree structure
 * Now works with ExtendedArea instead of ProcessMapArea
 */
export function buildProcessTree(
  areas: ExtendedArea[],
  allProcesses: Process[],
): ExtendedArea[] {
  const treeNodes: ExtendedArea[] = [];

  function processArea(
    area: ExtendedArea,
    applicationBase: string,
    level: number = 0,
    parentId?: string,
  ): ExtendedArea | null {
    // Add processes as children — only the active processes the current user
    // can access (matched against allProcesses by release id).
    const areaProcesses = area.process || [];
    const processNodes: ExtendedArea[] = areaProcesses
      .filter(
        (process: Process) =>
          process.status === "ACTIVE" &&
          allProcesses.some((p) => p.id === process.releaseId),
      )
      .map((process: Process) => ({
        ...process,
        id: `process-${process.id}`,
        name: process.name || process.processKey || "Unnamed Process",
        type: "process",
        level: level + 1,
        parentId: area.id,
        data: process,
        hasChildren: false,
        isLoaded: true,
        applicationBase: applicationBase,
        code: "",
      }));

    // Add subareas as children (recursively), dropping the ones the user has no
    // access to.
    const subareaNodes: ExtendedArea[] = (area.subareas || [])
      .map((subarea) =>
        processArea(subarea, subarea.applicationBase, level + 1, area.id),
      )
      .filter((node): node is ExtendedArea => node !== null);

    // Hide areas with no accessible processes and no visible subareas — if the
    // user can't access anything under an area, the area shouldn't appear.
    if (processNodes.length === 0 && subareaNodes.length === 0) {
      return null;
    }

    return {
      ...area,
      type: level === 0 ? "area" : "subarea",
      level,
      parentId,
      data: area,
      children: [...processNodes, ...subareaNodes],
      hasChildren: true,
      isLoaded: true,
      applicationBase: applicationBase,
    };
  }

  areas.forEach((area) => {
    const node = processArea(area, area.applicationBase, 0);
    if (node) treeNodes.push(node);
  });

  return treeNodes;
}

/**
 * Flattens tree nodes for rendering with proper indentation
 */
export function flattenTreeNodes(
  nodes: ExtendedArea[],
  expandedNodes: Set<string>,
): ExtendedArea[] {
  const flattened: ExtendedArea[] = [];

  function traverse(node: ExtendedArea) {
    flattened.push(node);

    if (expandedNodes.has(node.id) && node.children) {
      node.children.forEach((child) => traverse(child));
    }
  }

  nodes.forEach((node) => traverse(node));
  return flattened;
}

/**
 * Finds a node by ID in the tree
 */
export function findNodeById(
  nodes: ExtendedArea[],
  id: string,
): ExtendedArea | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Gets all process nodes from the tree
 */
export function getAllProcessNodes(nodes: ExtendedArea[]): ExtendedArea[] {
  const processes: ExtendedArea[] = [];

  function traverse(node: ExtendedArea) {
    if (node.type === "process") {
      processes.push(node);
    }
    if (node.children) {
      node.children.forEach((child) => traverse(child));
    }
  }

  nodes.forEach((node) => traverse(node));
  return processes;
}

/**
 * Searches nodes by name (case-insensitive)
 */
export function searchNodes(
  nodes: ExtendedArea[],
  searchTerm: string,
): ExtendedArea[] {
  if (!searchTerm.trim()) return nodes;

  const results: ExtendedArea[] = [];
  const lowerSearchTerm = searchTerm.toLowerCase();

  function traverse(node: ExtendedArea) {
    if (node.name.toLowerCase().includes(lowerSearchTerm)) {
      results.push(node);
    }
    if (node.children) {
      node.children.forEach((child) => traverse(child));
    }
  }

  nodes.forEach((node) => traverse(node));
  return results;
}
