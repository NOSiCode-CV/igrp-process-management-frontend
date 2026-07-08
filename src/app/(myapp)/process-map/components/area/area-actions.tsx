import React, { useState } from "react";
import { ExtendedArea } from "../../types";
import {
  IGRPAlertDialog,
  IGRPBadge,
  IGRPButton,
} from "@igrp/igrp-framework-react-design-system";

interface NodeActionsProps {
  node: ExtendedArea;
  onEdit: (node: ExtendedArea, parentAreaId?: string) => void;
  onDelete: (nodeId: string) => void;
  onAddSubarea: (nodeId: string) => void;
  onRemoveProcess: (nodeId: string, processId: string) => void;
}

export function AreaActions({
  node,
  onEdit,
  onDelete,
  onAddSubarea,
  onRemoveProcess,
}: NodeActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { type, data } = node;

  const isAreaOrSubarea = type === "area" || type === "subarea";
  const processCount =
    isAreaOrSubarea && data && "process" in data
      ? ((data as ExtendedArea).process?.length ?? 0)
      : 0;

  return (
    <div className="flex items-center space-x-1">
      {processCount > 0 && (
        <IGRPBadge variant="soft" className="text-xs">
          {processCount}
        </IGRPBadge>
      )}
      {isAreaOrSubarea && (
        <>
          <IGRPButton
            onClick={(e) => {
              e.stopPropagation();
              onEdit(data as ExtendedArea, data?.areaId ?? undefined);
            }}
            title="Editar"
            iconName={"Pencil"}
            size={"icon"}
            variant={"ghost"}
          ></IGRPButton>
        </>
      )}
      <IGRPButton
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title="Excluir"
        iconName="Trash2"
        size={"icon"}
        variant={"ghost"}
      ></IGRPButton>

      {isAreaOrSubarea && (
        <IGRPButton
          onClick={(e) => {
            e.stopPropagation();
            onAddSubarea(node.id);
          }}
          title="Adicionar Subárea"
          iconName={"Plus"}
          size={"icon"}
          variant={"ghost"}
        ></IGRPButton>
      )}

      <IGRPAlertDialog
        title="Excluir"
        open={isOpen}
        onOpenChange={setIsOpen}
        description={
          isAreaOrSubarea
            ? "Tem certeza que deseja excluir esta área? Todas as subáreas também serão removidas."
            : "Tem certeza que deseja excluir este processo?"
        }
        iconName="Trash2"
        showIcon={true}
        variant="destructive"
        actionLabel="Excluir"
        cancelLabel="Cancel"
        onAction={() => {
          isAreaOrSubarea
            ? onDelete(node.id)
            : onRemoveProcess(data?.areaId ?? "", data?.id ?? "");
        }}
        onCancel={() => {
          setIsOpen(false);
        }}
      ></IGRPAlertDialog>
    </div>
  );
}
