import {
  IGRPCheckbox,
  IGRPLabel,
  ScrollArea,
} from "@igrp/igrp-framework-react-design-system";

function AddChecklistItem({
  addItem,
  removeItem,
  label,
  availableItems,
  items,
}: {
  addItem: (value: string) => void;
  removeItem: (value: string) => void;
  label: string;
  availableItems?: any;
  items?: any;
}) {
  const isItemChecked = (group: { key?: string }) =>
    (items || []).some((item: any) => item?.key === group?.key);

  return (
    <div className="space-y-2">
      <IGRPLabel label={label} />
      {availableItems && availableItems?.length > 0 ? (
        <ScrollArea className="h-48 border rounded-md p-3">
          <div className="space-y-2">
            {(availableItems || []).map((group: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between py-1"
              >
                <IGRPLabel
                  htmlFor={`process-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {group.processKey}
                    </p>
                  </div>
                </IGRPLabel>
                <IGRPCheckbox
                  id={`process-group-${group}`}
                  checked={isItemChecked(group)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addItem(group);
                    } else {
                      removeItem(group);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="border rounded-md p-3 py-6 border-dashed flex items-center justify-center text-center text-muted-foreground">
          <IGRPLabel label="Sem grupos disponíveis, use o grupo personalizado" />
        </div>
      )}
    </div>
  );
}

export { AddChecklistItem };
