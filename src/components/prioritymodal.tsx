"use client";

/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from "react";
import {
  cn,
  useIGRPMenuNavigation,
  useIGRPToast,
} from "@igrp/igrp-framework-react-design-system";
import { IGRPFormHandle } from "@igrp/igrp-framework-react-design-system";
import { z } from "zod";
import { IGRPOptionsProps } from "@igrp/igrp-framework-react-design-system";
import {
  IGRPModalDialog,
  IGRPModalDialogContent,
  IGRPModalDialogHeader,
  IGRPModalDialogTitle,
  IGRPModalDialogDescription,
  IGRPForm,
  IGRPCombobox,
  IGRPModalDialogFooter,
  IGRPButton,
} from "@igrp/igrp-framework-react-design-system";
import { PRIORITY_OPTIONS } from "@/app/(myapp)/config/constants";

export default function Prioritymodal({
  open,
  setOpen,
  onSave,
  modalTitle,
  modalSubTitle,
  prioritiesOptions,
  loadingPriorities,
}: {
  open: boolean;
  setOpen: (prompt: boolean) => void;
  onSave: (data: any) => void;
  modalTitle: string;
  modalSubTitle: string;
  prioritiesOptions: any;
  loadingPriorities: boolean;
}) {
  z.config(z.locales.en());

  const form1 = z.object({
    priority: z.string().nonempty(),
  });

  type Form1ZodType = typeof form1;

  const initForm1: z.infer<Form1ZodType> = {
    priority: `1`,
  };

  const formform1Ref = useRef<IGRPFormHandle<Form1ZodType> | null>(null);
  const [form1Data, setForm1Data] = useState<any>(initForm1);
  const [selectpriorityOptions, setSelectpriorityOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { igrpToast } = useIGRPToast();

  useEffect(() => {
    setSelectpriorityOptions(
      (prioritiesOptions || []).length > 0
        ? prioritiesOptions
        : PRIORITY_OPTIONS,
    );
  }, [loadingPriorities, prioritiesOptions]);

  return (
    <div className={cn("component")}>
      <IGRPModalDialog onOpenChange={setOpen} open={open}>
        <IGRPModalDialogContent size={`lg`} className={cn()}>
          <IGRPModalDialogHeader className={cn("")}>
            <IGRPModalDialogTitle id={`modalDialogTitle1`}>
              {modalTitle}
            </IGRPModalDialogTitle>
            <IGRPModalDialogDescription id={`modalDialogDescription1`}>
              {modalSubTitle}
            </IGRPModalDialogDescription>
          </IGRPModalDialogHeader>
          <IGRPForm
            schema={form1}
            validationMode={`onBlur`}
            formRef={formform1Ref}
            className={cn("")}
            onSubmit={async (data) => {
              setIsSubmitting(true);
              try {
                await onSave(data);
              } finally {
                setIsSubmitting(false);
              }
            }}
            defaultValues={form1Data}
          >
            <>
              <div
                className={cn(
                  "grid",
                  "grid-cols-1 ",
                  "md:grid-cols-1 ",
                  "lg:grid-cols-1 ",
                  " gap-4",
                )}
              >
                <IGRPCombobox
                  id={`priority`}
                  label={`Prioridade`}
                  variant={`single`}
                  placeholder={`Selecione uma opção...`}
                  required={true}
                  selectLabel={`Nenhuma opção encontrada`}
                  showSearch={true}
                  showIcon={false}
                  iconName={`CornerDownRight`}
                  className={cn("col-span-1")}
                  onChange={() => {}}
                  options={selectpriorityOptions}
                ></IGRPCombobox>
              </div>
            </>
          </IGRPForm>
          <IGRPModalDialogFooter
            className={cn(
              "flex-1",
              "",
              "flex flex-row flex-nowrap items-stretch justify-end gap-2",
            )}
          >
            <div
              className={cn(
                "flex",
                "flex-1",
                "flex flex-row flex-nowrap items-stretch justify-end gap-2",
              )}
            >
              <IGRPButton
                id={`button1`}
                variant={`default`}
                size={`default`}
                showIcon={false}
                className={cn()}
                loading={isSubmitting}
                loadingText={`A iniciar...`}
                disabled={isSubmitting}
                onClick={() => formform1Ref.current?.submit()}
              >
                Confirmar
              </IGRPButton>
            </div>
          </IGRPModalDialogFooter>
        </IGRPModalDialogContent>
      </IGRPModalDialog>
    </div>
  );
}
