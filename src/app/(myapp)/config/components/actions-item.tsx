import {
  IGRPAlertDialog,
  IGRPButton,
  useIGRPToast,
} from "@igrp/igrp-framework-react-design-system";
import {
  IGRPDropdownMenu,
  IGRPDropdownMenuContent,
  IGRPDropdownMenuGroup,
  IGRPDropdownMenuItem,
  IGRPDropdownMenuSeparator,
  IGRPDropdownMenuTrigger,
  IGRPIcon,
} from "@igrp/igrp-framework-react-design-system";
import { useRef, useState } from "react";
import {
  archiveProcessDefinition,
  exportProcessDefinition,
  importProcessDefinition,
} from "../../client/process";
import { ProcessDefinitionSchema } from "@igrp/platform-process-management-types";

export function ActionsItem({
  processDefinitionId,
  onArchiveSuccess,
  onImportSuccess,
}: {
  processDefinitionId: string;
  onArchiveSuccess?: () => void | Promise<void>;
  onImportSuccess?: () => void | Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { igrpToast } = useIGRPToast();
  const isBusy = isArchiving || isExporting || isImporting;

  const handleArchive = async () => {
    if (isArchiving) return;
    setIsArchiving(true);
    try {
      await archiveProcessDefinition(processDefinitionId);
      igrpToast({
        title: "Definição de processo arquivada com sucesso",
        description: "A definição de processo foi arquivada com sucesso",
        type: "success",
      });
      await onArchiveSuccess?.();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      igrpToast({
        title: "Erro ao arquivar definição de processo",
        description: "Ocorreu um erro ao arquivar a definição de processo",
        type: "error",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const data = await exportProcessDefinition(processDefinitionId);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${processDefinitionId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      igrpToast({
        title: "Definição de processo exportada com sucesso",
        description: "A definição de processo foi exportada com sucesso",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      igrpToast({
        title: "Erro ao exportar definição de processo",
        description: "Ocorreu um erro ao exportar a definição de processo",
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    if (isBusy) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isImporting) return;
    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ProcessDefinitionSchema;
      await importProcessDefinition(data);
      igrpToast({
        title: "Definição de processo importada com sucesso",
        description: "A definição de processo foi importada com sucesso",
        type: "success",
      });
      await onImportSuccess?.();
    } catch (error) {
      console.error(error);
      igrpToast({
        title: "Erro ao importar definição de processo",
        description:
          error instanceof SyntaxError
            ? "Ficheiro JSON inválido"
            : "Ocorreu um erro ao importar a definição de processo",
        type: "error",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden
      />
      <IGRPDropdownMenu>
        <IGRPDropdownMenuTrigger asChild>
          <IGRPButton
            variant="outline"
            aria-label="Abrir menu"
            loading={isBusy}
            loadingText="A processar..."
            disabled={isBusy}
          >
            <IGRPIcon iconName="EllipsisVertical" />
          </IGRPButton>
        </IGRPDropdownMenuTrigger>
        <IGRPDropdownMenuContent>
          <IGRPDropdownMenuGroup>
            {processDefinitionId && (
              <IGRPDropdownMenuItem onClick={handleExport} disabled={isBusy}>
                <IGRPIcon iconName="Download" />
                Export
              </IGRPDropdownMenuItem>
            )}
            <IGRPDropdownMenuItem onClick={handleImportClick} disabled={isBusy}>
              <IGRPIcon iconName="Upload" />
              Import new
            </IGRPDropdownMenuItem>
          </IGRPDropdownMenuGroup>
          {processDefinitionId && (
            <>
              <IGRPDropdownMenuSeparator />
              <IGRPDropdownMenuGroup>
                <IGRPDropdownMenuItem
                  variant="destructive"
                  disabled={isBusy}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <IGRPIcon iconName="Archive" />
                  Archive
                </IGRPDropdownMenuItem>
              </IGRPDropdownMenuGroup>
            </>
          )}
        </IGRPDropdownMenuContent>
      </IGRPDropdownMenu>

      <IGRPAlertDialog
        title="Arquivar"
        open={isOpen}
        onOpenChange={(open) => {
          if (isArchiving) return;
          setIsOpen(open);
        }}
        description="Are you sure you want to archive this process definition?"
        iconName="Archive"
        showIcon={true}
        variant="destructive"
        actionLabel={isArchiving ? "A arquivar..." : "Archive"}
        cancelLabel="Cancel"
        actionProps={{ disabled: isArchiving }}
        cancelProps={{ disabled: isArchiving }}
        onAction={() => {
          void handleArchive();
        }}
        onCancel={() => {
          if (isArchiving) return;
          setIsOpen(false);
        }}
      ></IGRPAlertDialog>
    </>
  );
}
