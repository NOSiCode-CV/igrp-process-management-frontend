import {
  IGRPBadgePrimitive,
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
                      <IGRPBadgePrimitive
                        variant="outline"
                        className="text-xs font-mono"
                      >
                        {processKey}
                      </IGRPBadgePrimitive>
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
            >
              Edit
            </IGRPButton>
            <IGRPButton
              variant="destructive"
              onClick={() => onDelete(selectedArea?.id)}
              className="flex-1"
              iconName="Trash"
            >
              Delete
            </IGRPButton>
          </div>
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
