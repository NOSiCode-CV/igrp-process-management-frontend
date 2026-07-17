import { IGRPBadge, IGRPIcon } from "@igrp/igrp-framework-react-design-system";

export function SelectedItems({
  items,
  removeItem,
}: {
  items: string;
  removeItem: (item: string) => void;
}) {
  const itemsArray = items ? items.split(",") : [];
  return (
    <div className="flex flex-wrap gap-2">
      {itemsArray.length > 0 &&
        itemsArray.map((group) => (
          <IGRPBadge key={group} variant="soft" className="gap-1">
            {group}
            <button
              onClick={() => removeItem(group)}
              className="ml-1 hover:bg-muted rounded-full"
            >
              <IGRPIcon iconName="X" className="h-3 w-3" />
            </button>
          </IGRPBadge>
        ))}
      {itemsArray.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No candidate groups assigned
        </p>
      )}
    </div>
  );
}
