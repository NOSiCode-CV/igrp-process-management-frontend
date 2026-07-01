import { IGRPIcon } from "@igrp/igrp-framework-react-design-system";
import { ProcessItem } from "./process-item";

/**
 * Renders the selectable list of processes.
 *
 * Replaces the engine's `repetitiveList` (no longer supported — it regenerates
 * as an "Unsupported Component" placeholder). As a custom component it is
 * referenced from the page JSON like ProcessItem, so it survives regeneration.
 */
function ProcessList({
  items,
  selectedProcess,
  setSelectedProcess,
  loading,
}: {
  items?: any[];
  selectedProcess?: any;
  setSelectedProcess: (process: any) => void;
  loading?: boolean;
}) {
  const list = items || [];

  if (loading && list.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        <IGRPIcon iconName="LoaderCircle" className="h-4 w-4 animate-spin" />
        A carregar processos...
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      {list.map((item: any) => (
        <ProcessItem
          key={item.id}
          process={item}
          selectedProcess={selectedProcess}
          setSelectedProcess={setSelectedProcess}
        />
      ))}
    </div>
  );
}

export { ProcessList };
