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
  onArchiveSuccess?: () => void;
  onImportSuccess?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { igrpToast } = useIGRPToast();

  const handleArchive = async () => {
    try {
      await archiveProcessDefinition(processDefinitionId);
      igrpToast({
        title: "Definição de processo arquivada com sucesso",
        description: "A definição de processo foi arquivada com sucesso",
        type: "success",
      });
      onArchiveSuccess?.();
    } catch (error) {
      console.error(error);
      igrpToast({
        title: "Erro ao arquivar definição de processo",
        description: "Ocorreu um erro ao arquivar a definição de processo",
        type: "error",
      });
    } finally {
      setIsOpen(false);
    }
  };

  const handleExport = async () => {
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
      setIsOpen(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ProcessDefinitionSchema;
      await importProcessDefinition(data);
      igrpToast({
        title: "Definição de processo importada com sucesso",
        description: "A definição de processo foi importada com sucesso",
        type: "success",
      });
      onImportSuccess?.();
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
          <IGRPButton variant="outline">
            <IGRPIcon iconName="EllipsisVertical" />
          </IGRPButton>
        </IGRPDropdownMenuTrigger>
        <IGRPDropdownMenuContent>
          <IGRPDropdownMenuGroup>
            {processDefinitionId && (
              <IGRPDropdownMenuItem onClick={handleExport}>
                <IGRPIcon iconName="Download" />
                Export
              </IGRPDropdownMenuItem>
            )}
            <IGRPDropdownMenuItem onClick={handleImportClick}>
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
        onOpenChange={setIsOpen}
        description="Are you sure you want to archive this process definition?"
        iconName="Archive"
        showIcon={true}
        variant="destructive"
        actionLabel="Archive"
        cancelLabel="Cancel"
        onAction={handleArchive}
        onCancel={() => {
          setIsOpen(false);
        }}
      ></IGRPAlertDialog>
    </>
  );
}
