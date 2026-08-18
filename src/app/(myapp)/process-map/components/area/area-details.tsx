import { useState } from "react";
import {
  IGRPAlertDialog,
  IGRPBadge,
  IGRPButton,
  IGRPIcon,
  IGRPLabel,
  IGRPSeparator,
} from "@igrp/igrp-framework-react-design-system";
import { ExtendedArea } from "../../types";

function AreaDetails({
  selectedArea,
  onEdit,
  onDelete,
}: {
  selectedArea?: ExtendedArea;
  onEdit: (area: ExtendedArea, parentId?: string) => void;
  onDelete: (areaId: string) => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { process: processes, parentId } = selectedArea || {};

  return (
    <>
      {selectedArea ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-8 w-8 rounded"
                style={{ backgroundColor: selectedArea.color }}
              />
              <div>
                <h3 className="font-semibold">{selectedArea.name}</h3>
                {selectedArea.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedArea.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <IGRPSeparator />

          <div className="space-y-2">
            <IGRPLabel label="Processos Atribuídos" />
            {processes && processes.length > 0 ? (
              <div className="space-y-2">
                {processes.map((process, index) => {
                  const { processKey } = process;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded border"
                    >
                      <IGRPIcon
                        iconName="FolderTree"
                        className="text-muted-foreground"
                      />
                      <span className="text-sm flex-1">
                        {process?.name || processKey}
                      </span>
                      <IGRPBadge
                        variant="outline"
                        className="text-xs font-mono"
                      >
                        {processKey}
                      </IGRPBadge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No processes assigned to this area
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <IGRPButton
              onClick={() => onEdit(selectedArea, parentId)}
              className="flex-1"
              iconName="Edit"
              disabled={isDeleting}
            >
              Edit
            </IGRPButton>
            <IGRPButton
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
              className="flex-1"
              iconName="Trash"
              loading={isDeleting}
              loadingText="A eliminar..."
              disabled={isDeleting}
            >
              Delete
            </IGRPButton>
          </div>
          <IGRPAlertDialog
            title="Excluir área"
            open={confirmDelete}
            onOpenChange={(open) => {
              if (isDeleting) return;
              setConfirmDelete(open);
            }}
            description="Tem certeza que deseja excluir esta área? Todas as subáreas também serão removidas."
            iconName="Trash2"
            showIcon={true}
            variant="destructive"
            actionLabel={isDeleting ? "A eliminar..." : "Excluir"}
            cancelLabel="Cancelar"
            actionProps={{ disabled: isDeleting }}
            cancelProps={{ disabled: isDeleting }}
            onAction={() => {
              if (!selectedArea?.id) return;
              void (async () => {
                setIsDeleting(true);
                try {
                  await onDelete(selectedArea.id);
                  setConfirmDelete(false);
                } finally {
                  setIsDeleting(false);
                }
              })();
            }}
            onCancel={() => {
              if (isDeleting) return;
              setConfirmDelete(false);
            }}
          ></IGRPAlertDialog>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <IGRPIcon
            iconName="FolderTree"
            className="h-12 w-12 mx-auto mb-3 opacity-50"
          />
          <p>Selecione uma área para ver detalhes</p>
        </div>
      )}
    </>
  );
}

export { AreaDetails };
