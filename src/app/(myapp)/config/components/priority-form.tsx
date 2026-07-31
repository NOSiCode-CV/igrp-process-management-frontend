import {
  IGRPButton,
  IGRPInputColor,
  IGRPInputText,
  IGRPLabel,
  IGRPSeparator,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  Table,
  TableRow,
} from "@igrp/igrp-framework-react-design-system";
import type { Priority } from "@igrp/platform-process-management-types";

function PriorityForm({
  priorityOptions,
  updatePriorityOption,
  removePriorityOption,
  addPriorityOption,
  newPriorityLabel,
  newPriorityColor,
  setNewPriorityLabel,
  setNewPriorityColor,
  newPriorityValue,
  setNewPriorityValue,
}: {
  priorityOptions: Priority[];
  updatePriorityOption: (index: number, field: string, value: string) => void;
  removePriorityOption: (index: number) => void;
  addPriorityOption: () => void;
  newPriorityLabel: string;
  setNewPriorityLabel: (value: string) => void;
  newPriorityValue: string;
  setNewPriorityValue: (value: string) => void;
  newPriorityColor: string;
  setNewPriorityColor: (value: string) => void;
}) {
  return (
    <>
      {(priorityOptions || []).length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rótulo</TableHead>
              <TableHead className="w-32">Valor</TableHead>
              <TableHead className="w-32">Cor</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(priorityOptions || []).map((option, index) => (
              <TableRow key={option.id ?? `${option.code}-${index}`}>
                <TableCell>
                  <IGRPInputText
                    value={option.label ?? ""}
                    onChange={(e) =>
                      updatePriorityOption(index, "label", e.target.value)
                    }
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <IGRPInputText
                    type="number"
                    value={option.code ?? ""}
                    onChange={(e) =>
                      updatePriorityOption(index, "code", e.target.value)
                    }
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <IGRPInputColor
                    defaultValue="#ED6C02"
                    placeholder="Cor (ex.: #ED6C02)"
                    value={option.color ?? "#ED6C02"}
                    onChange={(value) =>
                      updatePriorityOption(index, "color", value ?? "")
                    }
                    format="hex"
                  />
                </TableCell>
                <TableCell>
                  <IGRPButton
                    variant="ghost"
                    size="icon"
                    onClick={() => removePriorityOption(index)}
                    className="h-8 w-8 text-destructive"
                    iconName="Trash"
                    aria-label="Eliminar prioridade"
                  ></IGRPButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma opção de prioridade definida
        </p>
      )}

      <IGRPSeparator />

      <div className="space-y-2">
        <IGRPLabel label="Adicionar Opção de Prioridade"></IGRPLabel>
        <div className="flex gap-2">
          <IGRPInputText
            placeholder="Rótulo (ex.: Alta)"
            value={newPriorityLabel ?? ""}
            onChange={(e) => setNewPriorityLabel(e.target.value)}
            className="flex-1"
          />
          <IGRPInputText
            type="number"
            placeholder="Valor (ex.: 1)"
            value={newPriorityValue ?? ""}
            onChange={(e) => setNewPriorityValue(e.target.value)}
            className="w-32"
          />
          <IGRPInputColor
            defaultValue="#ED6C02"
            placeholder="Cor (ex.: #ED6C02)"
            value={newPriorityColor || "#ED6C02"}
            onChange={(value) => setNewPriorityColor(value ?? "")}
            className="w-32"
            format="hex"
          />
          <IGRPButton
            onClick={addPriorityOption}
            size="icon"
            iconName="Plus"
            aria-label="Adicionar prioridade"
          ></IGRPButton>
        </div>
      </div>
    </>
  );
}

export { PriorityForm };
