"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  IGRPButton,
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  IGRPModalDialogDescription,
  IGRPModalDialogFooter,
  IGRPTextarea,
  useIGRPToast,
} from "@igrp/igrp-framework-react-design-system";
import { cancelProcessInstance } from "@/app/(myapp)/client/process-instances";

/** Statuses where cancelling a process instance is meaningful. */
const CANCELABLE = new Set(["CREATED", "RUNNING", "SUSPENDED"]);

/**
 * Destructive "Cancelar Processo" action for the process instance detail page.
 *
 * Custom component (referenced from `view.json`) so it survives page
 * regeneration. Calls `POST /process-instances/{id}/cancel` with an optional
 * `obsCancel` note, then invalidates the detail + list queries. Renders nothing
 * when the instance is not in a cancelable status (e.g. COMPLETED / CANCELED).
 */
function ProcessCancelAction({
  processInstanceId,
  status,
}: {
  processInstanceId?: string;
  status?: string;
}) {
  const [open, setOpen] = useState(false);
  const [obs, setObs] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  const { igrpToast } = useIGRPToast();
  const queryClient = useQueryClient();

  if (!processInstanceId || !CANCELABLE.has((status ?? "").toUpperCase())) {
    return null;
  }

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      await cancelProcessInstance(processInstanceId, obs.trim() || undefined);
      igrpToast({
        type: "success",
        title: "Processo Cancelado",
        description: "O processo foi cancelado com sucesso.",
      });
      queryClient.invalidateQueries({
        queryKey: ["process-details", processInstanceId],
      });
      queryClient.invalidateQueries({ queryKey: ["process-instances"] });
      setOpen(false);
      setObs("");
    } catch (error) {
      console.error("Error cancelling process:", error);
      igrpToast({
        type: "error",
        title: "Erro ao Cancelar",
        description: "Não foi possível cancelar o processo. Tente novamente.",
      });
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <>
      <IGRPButton
        variant="destructive"
        size="sm"
        showIcon={true}
        iconName="CircleX"
        onClick={() => setOpen(true)}
      >
        Cancelar Processo
      </IGRPButton>

      <IGRPModalDialog
        open={open}
        onOpenChange={(o) => {
          if (isCanceling) return;
          setOpen(o);
        }}
      >
        <IGRPModalDialogContent size="md">
          <IGRPModalDialogHeader>
            <IGRPModalDialogTitle>Cancelar Processo</IGRPModalDialogTitle>
            <IGRPModalDialogDescription>
              Tem a certeza que deseja cancelar este processo? Esta ação não pode
              ser revertida.
            </IGRPModalDialogDescription>
          </IGRPModalDialogHeader>

          <IGRPTextarea
            name="obsCancel"
            label="Motivo do cancelamento (opcional)"
            rows={3}
            placeholder="Indique o motivo do cancelamento"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />

          <IGRPModalDialogFooter>
            <IGRPButton
              variant="outline"
              disabled={isCanceling}
              onClick={() => setOpen(false)}
            >
              Voltar
            </IGRPButton>
            <IGRPButton
              variant="destructive"
              showIcon={true}
              iconName="CircleX"
              loading={isCanceling}
              loadingText="A cancelar..."
              disabled={isCanceling}
              onClick={() => {
                void handleCancel();
              }}
            >
              Cancelar Processo
            </IGRPButton>
          </IGRPModalDialogFooter>
        </IGRPModalDialogContent>
      </IGRPModalDialog>
    </>
  );
}

export { ProcessCancelAction };
export default ProcessCancelAction;
