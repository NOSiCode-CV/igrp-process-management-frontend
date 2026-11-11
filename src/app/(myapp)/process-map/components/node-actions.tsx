import React from "react";
import { ExtendedArea } from "../types";
import { IGRPIcon } from "@igrp/igrp-framework-react-design-system";

interface NodeActionsProps {
  node: ExtendedArea;
}

/**
 * Decorative "Iniciar" affordance for a process row.
 *
 * The whole process row is the interactive control (see TreeNode: it is a
 * `role="button"` that starts the process on click/Enter), so this is NOT a
 * button — it is a purely visual cue, hidden from assistive tech
 * (`aria-hidden`) and click-through (`pointer-events-none`). Keeping it
 * non-interactive is what lets the row be a single control with no nested
 * interactive elements. Icon + text so the cue never relies on the green
 * colour alone (WCAG 1.4.1).
 *
 * To avoid a wall of green chips when the whole tree is expanded, the cue is
 * revealed only on row hover or keyboard focus (and stays visible on touch
 * devices, which have no hover). The row stays fully operable regardless — the
 * cue's visibility never gates the action.
 */
export function NodeActions({ node }: NodeActionsProps) {
  if (node.type !== "process") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex items-center gap-1.5 rounded-md border border-green-600/40 bg-green-50 px-2.5 py-1.5 text-sm font-medium text-green-700 opacity-0 transition-opacity group-hover/process:opacity-100 group-focus/process:opacity-100 group-focus-within/process:opacity-100 [@media(hover:none)]:opacity-100 dark:border-green-500/30 dark:bg-green-950/40 dark:text-green-400"
    >
      <IGRPIcon name="icon1" iconName="Play" size={16} />
      <span>Iniciar</span>
    </div>
  );
}
