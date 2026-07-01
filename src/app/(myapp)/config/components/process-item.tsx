function ProcessItem({
  setSelectedProcess,
  selectedProcess,
  process,
}: {
  setSelectedProcess: (process: any) => void;
  selectedProcess: any;
  process: any;
}) {
  return (
    <button
      key={process.id}
      onClick={() => setSelectedProcess(process)}
      className={`w-full text-left px-4 py-2 mb-0 hover:bg-muted transition-colors border-b last:border-b-0 ${
        selectedProcess?.processKey === process.processKey ? "bg-muted" : ""
      }`}
    >
      <p className="font-medium">{process.name}</p>
      <p className="text-xs text-muted-foreground">{process.version}</p>
    </button>
  );
}

export { ProcessItem };
