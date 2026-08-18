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
  onDelete: (nodeId: string) => void | Promise<void>;
  onAddSubarea: (nodeId: string) => void;
  onRemoveProcess: (nodeId: string, processId: string) => void | Promise<void>;
}

export function AreaActions({
  node,
  onEdit,
  onDelete,
  onAddSubarea,
  onRemoveProcess,
}: NodeActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
            aria-label="Editar área"
            iconName={"Pencil"}
            size={"icon"}
            variant={"ghost"}
            disabled={isDeleting}
          ></IGRPButton>
        </>
      )}
      <IGRPButton
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title="Excluir"
        aria-label="Eliminar área"
        iconName="Trash2"
        size={"icon"}
        variant={"ghost"}
        loading={isDeleting}
        disabled={isDeleting}
      ></IGRPButton>

      {isAreaOrSubarea && (
        <IGRPButton
          onClick={(e) => {
            e.stopPropagation();
            onAddSubarea(node.id);
          }}
          title="Adicionar Subárea"
          aria-label="Adicionar subárea"
          iconName={"Plus"}
          size={"icon"}
          variant={"ghost"}
          disabled={isDeleting}
        ></IGRPButton>
      )}

      <IGRPAlertDialog
        title="Excluir"
        open={isOpen}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setIsOpen(open);
        }}
        description={
          isAreaOrSubarea
            ? "Tem certeza que deseja excluir esta área? Todas as subáreas também serão removidas."
            : "Tem certeza que deseja excluir este processo?"
        }
        iconName="Trash2"
        showIcon={true}
        variant="destructive"
        actionLabel={isDeleting ? "A eliminar..." : "Excluir"}
        cancelLabel="Cancelar"
        actionProps={{ disabled: isDeleting }}
        cancelProps={{ disabled: isDeleting }}
        onAction={() => {
          void (async () => {
            setIsDeleting(true);
            try {
              if (isAreaOrSubarea) {
                await onDelete(node.id);
              } else {
                await onRemoveProcess(data?.areaId ?? "", data?.id ?? "");
              }
              setIsOpen(false);
            } finally {
              setIsDeleting(false);
            }
          })();
        }}
        onCancel={() => {
          if (isDeleting) return;
          setIsOpen(false);
        }}
      ></IGRPAlertDialog>
    </div>
  );
}
