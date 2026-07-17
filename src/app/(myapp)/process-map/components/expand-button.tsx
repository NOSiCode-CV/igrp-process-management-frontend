import React from "react";
import { IGRPButton } from "@igrp/igrp-framework-react-design-system";

interface ExpandButtonProps {
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ExpandButton({
  hasChildren,
  isExpanded,
  onToggle,
}: ExpandButtonProps) {
  if (!hasChildren) {
    return <div className="w-6 h-6" />; // Placeholder for alignment
  }

  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <IGRPButton
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        variant="ghost"
        size="icon"
        iconName={isExpanded ? "ChevronDown" : "ChevronRight"}
        aria-label={isExpanded ? "Recolher" : "Expandir"}
        className="p-1 hover:bg-muted rounded w-6 h-6"
        iconClassName="w-4 h-4 text-muted-foreground"
      />
    </div>
  );
}
