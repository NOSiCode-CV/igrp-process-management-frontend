'use client';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { IGRPFormHandle } from '@igrp/igrp-framework-react-design-system';
import { z } from 'zod';
import { IGRPOptionsProps } from '@igrp/igrp-framework-react-design-system';
import { AddChecklistItem } from '@/app/(myapp)/config/components/add-checklist-item';
import { processKeyOf } from '@/app/(myapp)/process-map/utils/process-identity';
import {
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  IGRPModalDialogDescription,
  IGRPForm,
  IGRPCombobox,
  IGRPInputText,
  IGRPInputColor,
  IGRPTextarea,
  IGRPSelect,
  IGRPInputHidden,
  IGRPModalDialogFooter,
  IGRPButton,
  IGRPModalDialogClose,
} from '@igrp/igrp-framework-react-design-system';

export default function Areamodal({
  open,
  setOpen,
  isEditing,
  formData,
  onFormChange,
  onSave,
  onClose,
  options,
  allProcesses,
}: {
  open: boolean;
  setOpen: (prompt: boolean) => void;
  isEditing: boolean;
  formData: any;
  onFormChange: (data: any) => void;
  onSave: (data: any) => any;
  onClose: () => void;
  options: any;
  allProcesses: any;
}) {
  z.config(z.locales.en());

  const hasApplications = (options?.applications?.length ?? 0) > 0;

  const form1 = z.object({
    applicationBase: hasApplications
      ? z.string().nonempty()
      : z.string().optional(),
    applicationBaseText: hasApplications
      ? z.string().optional()
      : z.string().nonempty(),
    name: z.string().nonempty(),
    code: z.string().nonempty(),
    color: z.string().optional(),
    description: z.string().optional(),
    parentId: z.string().optional(),
    processes: z.array(z.object()).optional(),
  });

  type Form1ZodType = typeof form1;

  const initForm1: z.infer<Form1ZodType> = {
    applicationBase: ``,
    applicationBaseText: ``,
    name: ``,
    code: ``,
    color: `#3b82f6`,
    description: ``,
    parentId: ``,
    processes: [],
  };

  const formform1Ref = useRef<IGRPFormHandle<Form1ZodType> | null>(null);
  const [form1Data, setForm1Data] = useState<any>(initForm1);

  const [editingArea, setEditingArea] = useState<void | undefined>(undefined);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedProcesses, setSelectedProcesses] = useState<any[]>([]);
  const selectedProcessesRef = useRef<any[]>([]);
  const didInitSelectionRef = useRef<boolean>(false);

  const { igrpToast } = useIGRPToast();

  function syncSelected(nextProcesses: any[]): void {
    selectedProcessesRef.current = nextProcesses;
    setSelectedProcesses(nextProcesses);
  }

  async function handleFormSubmit(data: z.infer<any>): Promise<void | undefined> {
    if (isSaving) return;
    const applicationBase = (
      hasApplications ? data.applicationBase : data.applicationBaseText || data.applicationBase
    )?.trim();
    if (!applicationBase) return;
    const next = {
      ...data,
      applicationBase,
      applicationBaseText: applicationBase,
      processes: selectedProcessesRef.current,
    };
    onFormChange(next);
    setIsSaving(true);
    try {
      await onSave(next);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddItem(item: any): void {
    const key = processKeyOf(item);
    if (!key) return;
    if (selectedProcessesRef.current.some((process) => processKeyOf(process) === key)) {
      return;
    }
    const nextProcesses = [...selectedProcessesRef.current, item];
    syncSelected(nextProcesses);
    const data = formform1Ref.current?.getValues();
    onFormChange({ ...data, processes: nextProcesses });
  }

  function handleRemoveItem(item: any): void {
    const key = processKeyOf(item);
    const nextProcesses = selectedProcessesRef.current.filter(
      (process) => processKeyOf(process) !== key,
    );
    syncSelected(nextProcesses);
    const data = formform1Ref.current?.getValues();
    onFormChange({ ...data, processes: nextProcesses });
  }

  const isUpdatingRef = useRef<boolean>(false);
  useEffect(() => {
    if (formData)
      setForm1Data({
        ...formData,
        applicationBaseText: (formData as any).applicationBase,
      });
  }, [formData]);

  useEffect(() => {
    if (!open) {
      didInitSelectionRef.current = false;
      selectedProcessesRef.current = [];
      setSelectedProcesses([]);
      setIsSaving(false);
      return;
    }
    if (didInitSelectionRef.current) return;
    const initial = [...(formData.processes || [])];
    if (isEditing && initial.length === 0) return;
    didInitSelectionRef.current = true;
    selectedProcessesRef.current = initial;
    setSelectedProcesses(initial);
  }, [open, isEditing, formData.processes]);

  const title = isEditing ? 'Editar Área' : 'Adicionar Nova Área';
  const modalDescription = isEditing
    ? 'Atualize os detalhes da área e as atribuições de processos'
    : 'Crie uma nova área ou sub-área no mapa de processos';

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let rafId = 0;

    const trySubscribe = () => {
      const handle = formform1Ref.current;
      if (handle && typeof (handle as any).watch === 'function') {
        const subscription = (handle as any).watch((value: any) => {
          if (isUpdatingRef.current) return;

          if (options?.applications.length > 0) {
            const currentValue = (value as any)?.applicationBase;
            const currentText = (value as any)?.applicationBaseText;
            if (currentValue && currentValue !== currentText) {
              isUpdatingRef.current = true;
              formform1Ref.current?.setValue('applicationBaseText', currentValue);
              setTimeout(() => {
                isUpdatingRef.current = false;
              }, 0);
            }
          } else {
            const currentText = (value as any)?.applicationBaseText;
            const currentValue = (value as any)?.applicationBase;
            if (currentText && currentText !== currentValue) {
              isUpdatingRef.current = true;
              formform1Ref.current?.setValue('applicationBase', currentText);
              setTimeout(() => {
                isUpdatingRef.current = false;
              }, 0);
            }
          }
        });

        cleanup = () => {
          if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
          }
        };
      } else {
        rafId = window.requestAnimationFrame(trySubscribe);
      }
    };

    trySubscribe();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (cleanup) cleanup();
    };
  }, [options.applications]);

  const processesItems = (allProcesses || []).map((process: any) => ({
    ...process,
    key: process.processKey || process.id,
    name: process.name || process.processKey,
  }));

  const itemsChecked = selectedProcesses.map((process: any) => ({
    ...process,
    key: processKeyOf(process),
  }));

  return (
    <div className={cn('component')}>
      <IGRPModalDialog
        onOpenChange={(next) => {
          if (isSaving) return;
          setOpen(next);
        }}
        open={open}
      >
        <IGRPModalDialogContent size={`lg`}>
          <IGRPModalDialogHeader>
            <IGRPModalDialogTitle id={`modalDialogTitle1`}>{title}</IGRPModalDialogTitle>

            <IGRPModalDialogDescription id={`modalDialogDescription1`}>
              {modalDescription}
            </IGRPModalDialogDescription>
          </IGRPModalDialogHeader>
          <IGRPForm
            schema={form1}
            validationMode={`onBlur`}
            formRef={formform1Ref}
            onSubmit={handleFormSubmit}
            defaultValues={form1Data}
          >
            <>
              {options?.applications.length > 0 && (
                <IGRPCombobox
                  id={`applicationBase`}
                  label={`Aplicação`}
                  variant={`single`}
                  placeholder={`Selecione uma opção...`}
                  required={true}
                  selectLabel={`Nenhuma opção encontrada`}
                  showSearch={true}
                  showIcon={false}
                  iconName={`CornerDownRight`}
                  onChange={() => {}}
                  options={options?.applications || []}
                ></IGRPCombobox>
              )}
              {options?.applications.length === 0 && (
                <IGRPInputText
                  id={`applicationBaseText`}
                  label={`Aplicação`}
                  showIcon={false}
                  required={true}
                  placeholder={`ex.: INSS Core`}
                ></IGRPInputText>
              )}
              <IGRPInputText
                id={`name`}
                label={`Nome`}
                showIcon={false}
                required={true}
                placeholder={`ex.: Finanças e Contabilidade`}
              ></IGRPInputText>

              <div className={cn('grid', 'lg:grid-cols-2 ', ' gap-4')}>
                <IGRPInputText
                  id={`code`}
                  label={`Código`}
                  showIcon={false}
                  required={true}
                  placeholder={`ex.: FIN & RH`}
                  className={cn('col-span-1')}
                ></IGRPInputText>

                <IGRPInputColor
                  id={`color`}
                  label={`Cor`}
                  defaultValue={`#3b82f6`}
                  required={false}
                  format={`hex`}
                  defaultFormat={`hex`}
                  showFormatValue={true}
                  className={cn('col-span-1')}
                ></IGRPInputColor>
              </div>
              <IGRPTextarea
                id={`description`}
                label={`Descrição`}
                rows={3}
                required={false}
                placeholder={`Breve descrição da área`}
              ></IGRPTextarea>

              <IGRPSelect
                id={`parentId`}
                label={`Área Pai (Opcional)`}
                placeholder={`Selecione uma opção...`}
                options={options?.areas || []}
              ></IGRPSelect>

              <IGRPInputHidden
                id={`processes`}
                label={`processes`}
                required={false}
              ></IGRPInputHidden>
            </>
          </IGRPForm>

          <div className={cn('mt-4')}>
            <AddChecklistItem
              label={`Associar Processos`}
              availableItems={processesItems}
              items={itemsChecked}
              addItem={handleAddItem}
              removeItem={handleRemoveItem}
            ></AddChecklistItem>
          </div>
          <IGRPModalDialogFooter className={cn()}>
            <div
              className={cn(
                'flex',
                'flex-1',
                'flex flex-row flex-nowrap items-center justify-end gap-2',
              )}
            >
              <IGRPButton
                id={`button1`}
                variant={`default`}
                size={`default`}
                showIcon={false}
                loading={isSaving}
                loadingText={`A gravar...`}
                disabled={isSaving}
                onClick={() => {
                  if (isSaving) return;
                  formform1Ref.current?.submit();
                }}
              >
                Gravar
              </IGRPButton>
            </div>
            <IGRPModalDialogClose
              id={`modalDialogClose1`}
              onClick={() => {}}
            ></IGRPModalDialogClose>
          </IGRPModalDialogFooter>
        </IGRPModalDialogContent>
      </IGRPModalDialog>
    </div>
  );
}
