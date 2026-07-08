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
  return (
    <>
      {hasChildren ? (
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
          iconClassName="w-6 h-6 text-muted-foreground"
        />
      ) : (
        <div className="w-6 h-6" />
      )}
    </>
  );
}
