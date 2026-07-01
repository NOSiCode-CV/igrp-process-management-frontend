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
  IGRPRadioGroup,
  IGRPCombobox,
  IGRPInputText,
  IGRPTextarea,
  IGRPModalDialogFooter,
  IGRPButton,
} from "@igrp/igrp-framework-react-design-system";
import { PRIORITY_OPTIONS } from "@/app/(myapp)/config/constants";
import { useBusinessGroups } from "@/app/(myapp)/access-management/use-business-groups";
import { useBusinessUsers } from "@/app/(myapp)/access-management/use-business-users";

export default function Commonusertaskmodalform({
  open,
  setOpen,
  onSave,
  modalTitle,
  modalSubTitle,
  userRequired,
  showPriority,
}: {
  open: boolean;
  setOpen: (prompt: boolean) => void;
  onSave: (data: any) => void;
  modalTitle: string;
  modalSubTitle: string;
  userRequired?: boolean;
  showPriority?: boolean;
}) {
  z.config(z.locales.en());

  const form1 = z.object({
    user: z.string().optional(),
    userCustom: z.string().optional(),
    candidateGroups: z.string().optional(),
    candidateGroupsCustom: z.string().optional(),
    priority: z.string().optional(),
    note: z.string().optional(),
  });

  type Form1ZodType = typeof form1;

  const initForm1: z.infer<Form1ZodType> = {
    user: ``,
    userCustom: ``,
    candidateGroups: ``,
    candidateGroupsCustom: ``,
    priority: ``,
    note: ``,
  };

  const formform1Ref = useRef<IGRPFormHandle<Form1ZodType> | null>(null);
  const [form1Data, setForm1Data] = useState<any>(initForm1);
  const [radioatribuirTaskOptions, setRadioatribuirTaskOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectuserOptions, setSelectuserOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectpriorityOptions, setSelectpriorityOptions] = useState<
    IGRPOptionsProps[]
  >([]);
  const [selectcandidateGroupsOptions, setSelectcandidateGroupsOptions] =
    useState<IGRPOptionsProps[]>([]);

  const [atribuirTask, setAtribuirTask] = useState<string>("user");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { igrpToast } = useIGRPToast();
  const { groupOptions } = useBusinessGroups();
  const { userOptions } = useBusinessUsers();

  useEffect(() => {
    setSelectpriorityOptions(PRIORITY_OPTIONS);

    setRadioatribuirTaskOptions([
      { value: "user", label: "Utilizador" },
      { value: "group", label: "Grupo" },
    ]);

    setAtribuirTask("user");
  }, []);

  useEffect(() => {
    setSelectuserOptions(userOptions);
  }, [userOptions]);

  useEffect(() => {
    setSelectcandidateGroupsOptions(
      groupOptions.map((g) => ({
        value: g.value,
        label: `${g.name} (${g.value})`,
      })),
    );
  }, [groupOptions]);

  return (
    <div className={cn("component")}>
      <IGRPModalDialog onOpenChange={setOpen} open={open}>
        <IGRPModalDialogContent size={`xl`} className={cn()}>
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
              const cg =
                (data.candidateGroupsCustom || "").trim() ||
                data.candidateGroups;
              const usr = (data.userCustom || "").trim() || data.user;
              setIsSubmitting(true);
              try {
                await onSave({
                  ...data,
                  user: usr,
                  candidateGroups: cg,
                  assigneTo: atribuirTask,
                });
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
                {userRequired && (
                  <IGRPRadioGroup
                    id={`atribuirTask`}
                    dir={`ltr`}
                    orientation={`horizontal`}
                    variant={`default`}
                    size={`md`}
                    gridSize={`default`}
                    label={`Atribuir tarefa a:`}
                    required={true}
                    className={cn("col-span-1")}
                    onValueChange={(e) => {
                      setAtribuirTask(e);
                    }}
                    options={radioatribuirTaskOptions}
                    value={atribuirTask}
                  ></IGRPRadioGroup>
                )}
                {userRequired && atribuirTask === "user" && (
                  <IGRPCombobox
                    id={`user`}
                    label={`Utilizador`}
                    variant={`single`}
                    placeholder={`Selecione uma opção...`}
                    required={true}
                    selectLabel={`Nenhuma opção encontrada`}
                    showSearch={true}
                    showIcon={false}
                    iconName={`CornerDownRight`}
                    className={cn("col-span-1")}
                    onChange={() => {}}
                    options={selectuserOptions}
                  ></IGRPCombobox>
                )}
                {userRequired && atribuirTask === "user" && (
                  <IGRPInputText
                    id={`userCustom`}
                    label={`ou Utilizador personalizado`}
                    showIcon={false}
                    required={false}
                    placeholder={`ex: utilizador@nosi.cv`}
                    className={cn("col-span-1")}
                  ></IGRPInputText>
                )}
                {atribuirTask === "group" && (
                  <IGRPCombobox
                    id={`candidateGroups`}
                    label={`Grupo`}
                    variant={`single`}
                    placeholder={`Selecione um grupo...`}
                    required={true}
                    selectLabel={`Nenhuma opção encontrada`}
                    showSearch={true}
                    showIcon={false}
                    iconName={`CornerDownRight`}
                    className={cn("col-span-1")}
                    onChange={() => {}}
                    options={selectcandidateGroupsOptions}
                  ></IGRPCombobox>
                )}
                {atribuirTask === "group" && (
                  <IGRPInputText
                    id={`candidateGroupsCustom`}
                    label={`ou Grupo personalizado`}
                    showIcon={false}
                    required={false}
                    placeholder={`ex: DSIP.ATENDEDOR`}
                    className={cn("col-span-1")}
                  ></IGRPInputText>
                )}
                {showPriority && (
                  <IGRPCombobox
                    id={`priority`}
                    label={`Prioridade`}
                    variant={`single`}
                    placeholder={`Selecione uma opção...`}
                    required={false}
                    selectLabel={`Nenhuma opção encontrada`}
                    showSearch={true}
                    showIcon={false}
                    iconName={`CornerDownRight`}
                    className={cn("col-span-1")}
                    onChange={() => {}}
                    options={selectpriorityOptions}
                  ></IGRPCombobox>
                )}
                <IGRPTextarea
                  id={`note`}
                  label={`Nota`}
                  rows={3}
                  required={false}
                  className={cn("col-span-1")}
                ></IGRPTextarea>
              </div>
            </>
          </IGRPForm>
          <IGRPModalDialogFooter className={cn("")}>
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
                loadingText={`A submeter...`}
                disabled={isSubmitting}
                onClick={() => formform1Ref.current?.submit()}
              >
                Submeter
              </IGRPButton>
            </div>
          </IGRPModalDialogFooter>
        </IGRPModalDialogContent>
      </IGRPModalDialog>
    </div>
  );
}
