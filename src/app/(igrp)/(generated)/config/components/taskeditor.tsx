'use client';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPOptionsProps } from '@igrp/igrp-framework-react-design-system';
import { SelectedItems } from '@/app/(myapp)/config/components/selected-items';
import { AddChecklistItem } from '@/app/(myapp)/config/components/add-checklist-item';
import { AddItem } from '@/app/(myapp)/config/components/add-item';
import {
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  IGRPModalDialogDescription,
  IGRPCombobox,
  IGRPInputText,
  IGRPSeparator,
  IGRPModalDialogFooter,
  IGRPButton,
} from '@igrp/igrp-framework-react-design-system';
import { PRIORITY_OPTIONS } from '@/app/(myapp)/config/constants';
import { CreateProcessArtifactRequest } from '@igrp/platform-process-management-types';
import { useBusinessGroups } from '@/app/(myapp)/access-management/use-business-groups';

export default function Taskeditor({
  open,
  setOpen,
  editingTask,
  onSave,
  availableGroups,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingTask: any;
  onSave: (req: any) => string;
  availableGroups?: string;
}) {
  const [formKey, setFormKey] = useState<string>(`''`);

  const [candidateGroups, setCandidateGroups] = useState<string>(`''`);

  const [defaultPriority, setDefaultPriority] = useState<string>(`''`);

  const [defaultDueDate, setDefaultDueDate] = useState<string>(`''`);

  const [newGroupInput, setNewGroupInput] = useState<string>(`''`);

  const { igrpToast } = useIGRPToast();

  function handleRemoveGroup(item: any): void {
    const raw = typeof item === 'string' ? item : (item?.processKey ?? item?.key ?? '');
    const trimmed = raw.trim();
    const next = groupsArray.filter((g) => g !== trimmed).join(',');
    setCandidateGroups(next);
  }

  function handleAddGroup(value: any): void {
    const raw = typeof value === 'string' ? value : (value?.processKey ?? value?.key ?? '');
    const trimmed = raw.trim().replace(/,/g, '').replace(/\s+/g, ' ');
    if (!trimmed || groupsArray.includes(trimmed)) return;
    const next = groupsArray.length ? `${candidateGroups},${trimmed}` : trimmed;
    setCandidateGroups(next);
    setNewGroupInput('');
  }

  function handleSave(): void {
    if (!editingTask?.key || !editingTask?.name) return;
    const req: CreateProcessArtifactRequest = {
      key: editingTask.key,
      name: editingTask.name,
      formKey: formKey.trim(),
      candidateGroups: candidateGroups.trim() || undefined,
      dueDate: defaultDueDate.trim(),
      priority: Number(defaultPriority),
    };
    onSave(req);
    setOpen(false);
  }

  useEffect(() => {
    if (editingTask) {
      setFormKey(editingTask.formKey ?? '');
      setCandidateGroups(editingTask.candidateGroupsRaw ?? '');
      setDefaultPriority('');
      setDefaultDueDate('');
      setNewGroupInput('');
    }
  }, [editingTask]);

  const groupsArray = candidateGroups
    ? candidateGroups
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const { groupOptions } = useBusinessGroups();
  const availableItemsArray = groupOptions.map((g) => ({
    key: g.value,
    name: g.name,
    processKey: g.value,
  }));

  return (
    <div className={cn('component')}>
      <div className={cn('section', ' space-y-6')}>
        <IGRPModalDialog onOpenChange={setOpen} open={open}>
          <IGRPModalDialogContent size={`lg`}>
            <IGRPModalDialogHeader>
              <IGRPModalDialogTitle id={`modalDialogTitle1`}>
                Editar Configuração da Tarefa
              </IGRPModalDialogTitle>

              <IGRPModalDialogDescription id={`modalDialogDescription1`}>
                {editingTask.name}
              </IGRPModalDialogDescription>
            </IGRPModalDialogHeader>
            <div className={cn('grid', 'md:grid-cols-2 ', ' gap-4')}>
              <IGRPCombobox
                id={`combobox1`}
                label={`Prioridade Predefinida`}
                variant={`single`}
                placeholder={`Selecione uma opção...`}
                selectLabel={`Nenhuma opção encontrada`}
                showSearch={true}
                showIcon={false}
                iconName={`CornerDownRight`}
                className={cn('col-span-1')}
                onChange={(v) =>
                  setDefaultPriority(Array.isArray(v) ? (v[0] ?? '') : String(v ?? ''))
                }
                options={PRIORITY_OPTIONS}
                value={defaultPriority}
              ></IGRPCombobox>

              <IGRPInputText
                id={`inputText1`}
                label={`Prazo Predefinido (Duração ISO)`}
                showIcon={false}
                required={false}
                placeholder={`ex.: P3D para 3 dias`}
                className={cn('col-span-1')}
                onChange={(e) => setDefaultDueDate(e.target.value)}
                value={defaultDueDate}
              ></IGRPInputText>
            </div>
            <IGRPInputText
              id={`inputText2`}
              label={`Chave do Formulário`}
              showIcon={false}
              required={false}
              onChange={(e) => setFormKey(e.target.value)}
              value={formKey}
            ></IGRPInputText>

            <IGRPSeparator id={`separator1`} orientation={`horizontal`}></IGRPSeparator>

            <SelectedItems items={candidateGroups} removeItem={handleRemoveGroup}></SelectedItems>
            <AddChecklistItem
              label={`Grupos Candidatos`}
              availableItems={availableItemsArray}
              items={groupsArray.map((g) => ({ key: g }))}
              addItem={handleAddGroup}
              removeItem={handleRemoveGroup}
            ></AddChecklistItem>
            <AddItem
              label={`Adicionar Grupo Personalizado`}
              placeholder={`Introduza o nome do grupo...`}
              value={newGroupInput}
              addItem={handleAddGroup}
              setValue={setNewGroupInput}
            ></AddItem>
            <IGRPModalDialogFooter>
              <div className={cn('flex', ' flex-1 justify-end gap-2')}>
                <IGRPButton
                  id={`button2`}
                  variant={`outline`}
                  size={`default`}
                  showIcon={false}
                  onClick={(open) => setOpen(!open)}
                >
                  Cancelar
                </IGRPButton>

                <IGRPButton
                  id={`button1`}
                  variant={`default`}
                  size={`default`}
                  showIcon={false}
                  onClick={handleSave}
                >
                  Guardar Alterações
                </IGRPButton>
              </div>
            </IGRPModalDialogFooter>
          </IGRPModalDialogContent>
        </IGRPModalDialog>
      </div>
    </div>
  );
}
