import {
  IGRPBadge,
  IGRPButton,
  IGRPCheckbox,
  IGRPIcon,
  IGRPInputText,
  IGRPLabel,
} from "@igrp/igrp-framework-react-design-system";
import { useState } from "react";

export default function CandidateGroups({
  selectedCandidateGroups,
}: {
  selectedCandidateGroups: string;
}) {
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [selectedCandidateGroupsState, setSelectedCandidateGroupsState] =
    useState<string[]>([]);
  const [newGroupInput, setNewGroupInput] = useState<string>("");
  const handleToggleGroup = (group: string) => {
    setSelectedCandidateGroupsState([...selectedCandidateGroupsState, group]);
  };
  const handleAddCustomGroup = () => {
    setAvailableGroups([...availableGroups, newGroupInput]);
    setNewGroupInput("");
  };
  const handleRemoveGroup = (group: string) => {
    setSelectedCandidateGroupsState(
      selectedCandidateGroupsState.filter((g) => g !== group),
    );
  };

  return (
    <div className="grid gap-2">
      <IGRPLabel label="Grupos Candidatos" />
      <p className="text-xs text-muted-foreground">
        Selecione os grupos que podem reclamar esta tarefa
      </p>

      {/* Selected groups */}
      {selectedCandidateGroupsState.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/30">
          {selectedCandidateGroupsState.map((group) => (
            <IGRPBadge key={group} variant="soft" className="gap-1 pr-1">
              {group}
              <button
                onClick={() => handleRemoveGroup(group)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <IGRPIcon iconName="X" />
              </button>
            </IGRPBadge>
          ))}
        </div>
      )}

      {/* Available groups checklist */}
      <div className="border rounded-md max-h-40 overflow-y-auto">
        {availableGroups.map((group) => (
          <div
            key={group}
            className="flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
            onClick={() => handleToggleGroup(group)}
          >
            <IGRPCheckbox
              checked={selectedCandidateGroupsState.includes(group)}
              onCheckedChange={() => handleToggleGroup(group)}
            />
            <span className="text-sm">{group}</span>
          </div>
        ))}
      </div>

      {/* Add custom group */}
      <div className="flex gap-2">
        <IGRPInputText
          placeholder="Adicionar grupo personalizado..."
          value={newGroupInput}
          onChange={(e) => setNewGroupInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustomGroup()}
          className="flex-1"
        />
        <IGRPButton
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddCustomGroup}
          disabled={!newGroupInput.trim()}
          aria-label="Adicionar grupo"
        >
          <IGRPIcon iconName="Plus" />
        </IGRPButton>
      </div>
    </div>
  );
}
