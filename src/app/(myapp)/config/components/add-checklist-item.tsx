import { IGRPLabel, ScrollArea } from "@igrp/igrp-framework-react-design-system";

function checklistKeyOf(item?: {
  processKey?: string;
  key?: string;
} | null): string {
  return (item?.processKey || item?.key || "").trim();
}

function AddChecklistItem({
  addItem,
  removeItem,
  label,
  availableItems,
  items,
}: {
  addItem: (value: any) => void;
  removeItem: (value: any) => void;
  label: string;
  availableItems?: any;
  items?: any;
}) {
  const selectedKeys = new Set(
    (items || []).map(checklistKeyOf).filter((key: string) => key.length > 0),
  );

  return (
    <div className="space-y-2">
      <IGRPLabel label={label} />
      {availableItems && availableItems?.length > 0 ? (
        <ScrollArea className="h-48 border rounded-md p-3">
          <div className="space-y-2">
            {(availableItems || []).map((group: any, index: number) => {
              const key = checklistKeyOf(group);
              const checked = Boolean(key) && selectedKeys.has(key);
              return (
                <button
                  key={key || group.id || index}
                  type="button"
                  className="flex w-full items-center justify-between py-1 text-left cursor-pointer"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (checked) {
                      const selected = (items || []).find(
                        (item: any) => checklistKeyOf(item) === key,
                      );
                      removeItem(selected || group);
                    } else {
                      addItem(group);
                    }
                  }}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {group.processKey || group.key}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className={
                      checked
                        ? "size-4 shrink-0 rounded-[4px] border border-primary bg-primary text-primary-foreground shadow-xs flex items-center justify-center"
                        : "size-4 shrink-0 rounded-[4px] border border-input bg-background shadow-xs"
                    }
                  >
                    {checked ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="size-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : null}
                  </span>
                </button>
              );
            })}
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
