import {
  IGRPBadge,
  IGRPButton,
  IGRPCombobox,
  IGRPIcon,
  Input,
  IGRPLabel,
  PopoverContent,
  Popover,
  PopoverTrigger,
} from "@igrp/igrp-framework-react-design-system";
import { useState } from "react";
import { OperatorOptions } from "./types";

export interface VariableFilter {
  id: string;
  name: string;
  operator: string;
  value: string;
}

function FilterData({
  availableVariableNames,
  onChange,
}: {
  availableVariableNames?: string[];
  onChange: (filters: VariableFilter[]) => void;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [variableFilters, setVariableFilters] = useState<VariableFilter[]>([]);

  const addVariableFilter = () => {
    const newFilter = {
      id: crypto.randomUUID(),
      name: "", //availableVariableNames[0] || "",
      operator: "EQUALS",
      value: "",
    };
    setVariableFilters([...variableFilters, newFilter]);
    //onChange([...variableFilters, newFilter]);
  };

  const updateVariableFilter = (
    id: string,
    updates: Partial<VariableFilter>,
  ) => {
    const { name, operator, value } = updates;

    const updatedFilters = variableFilters.map((f) =>
      f.id === id ? { ...f, ...updates } : f,
    );
    setVariableFilters(updatedFilters);
    if (name && operator && value) onChange(updatedFilters);
  };

  const removeVariableFilter = (id: string) => {
    setVariableFilters(variableFilters.filter((f) => f.id !== id));
    onChange(variableFilters);
  };

  const clearAllFilters = () => {
    setVariableFilters([]);
    onChange([]);
  };

  return (
    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <PopoverTrigger asChild>
        <IGRPButton
          variant="outline"
          size="default"
          className={`bg-secondary border-border gap-2 ${variableFilters && variableFilters.length > 0 ? "border-primary" : ""}`}
        >
          <IGRPIcon iconName="Funnel" />
          <span>Filtrar por Dados</span>
          {variableFilters.length > 0 && (
            <IGRPBadge
              variant="soft"
              className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {variableFilters.length}
            </IGRPBadge>
          )}
        </IGRPButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(480px,calc(100vw-2rem))] max-w-[480px] p-4"
        align="start"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              Filtrar por Variáveis do Processo
            </h4>
            {variableFilters.length > 0 && (
              <IGRPButton
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-xs"
              >
                Limpar tudo
              </IGRPButton>
            )}
          </div>

          {variableFilters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum filtro de variável aplicado. Adicione um filtro para
              reduzir os processos.
            </p>
          ) : (
            <div className="space-y-3">
              {variableFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-end gap-2 p-3 rounded-lg border border-border bg-secondary/50"
                >
                  <div className="flex-1 space-y-1.5">
                    <IGRPLabel
                      label="Variável"
                      className="text-xs text-muted-foreground"
                    />
                    {availableVariableNames &&
                    availableVariableNames.length > 0 ? (
                      <IGRPCombobox
                        value={filter.name}
                        onChange={(v) =>
                          updateVariableFilter(filter.id, {
                            name: v as string,
                          } as VariableFilter)
                        }
                        options={availableVariableNames.map((name) => ({
                          label: name,
                          value: name,
                        }))}
                      />
                    ) : (
                      <Input
                        className="h-8 text-sm"
                        placeholder="Digite o nome da variável..."
                        value={filter.name}
                        onChange={(e) =>
                          updateVariableFilter(filter.id, {
                            name: e.target.value,
                          } as VariableFilter)
                        }
                      />
                    )}
                  </div>

                  <div className="w-[120px] space-y-1.5">
                    <IGRPLabel
                      label="Operador"
                      className="text-xs text-muted-foreground"
                    />
                    <IGRPCombobox
                      value={filter.operator}
                      onChange={(v) =>
                        updateVariableFilter(filter.id, {
                          operator: v as VariableFilter["operator"],
                        } as VariableFilter)
                      }
                      options={OperatorOptions}
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <IGRPLabel
                      label="Valor"
                      className="text-xs text-muted-foreground"
                    />
                    <Input
                      className="h-8 text-sm"
                      placeholder="Digite o valor..."
                      value={filter.value}
                      onChange={(e) =>
                        updateVariableFilter(filter.id, {
                          ...filter,
                          value: e.target.value,
                        } as VariableFilter)
                      }
                    />
                  </div>

                  <IGRPButton
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeVariableFilter(filter.id)}
                    aria-label="Remover filtro"
                  >
                    <IGRPIcon iconName="X" />
                  </IGRPButton>
                </div>
              ))}
            </div>
          )}

          <IGRPButton
            variant="outline"
            size="sm"
            onClick={addVariableFilter}
            className="w-full gap-2 bg-transparent"
          >
            <IGRPIcon iconName="Plus" />
            Adicionar Filtro
          </IGRPButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { FilterData };
