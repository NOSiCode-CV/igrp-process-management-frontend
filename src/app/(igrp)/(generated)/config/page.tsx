'use client';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { ProcessList } from '@/app/(myapp)/config/components/process-list';
import { ActionsItem } from '@/app/(myapp)/config/components/actions-item';
import { Empty } from '@/app/(myapp)/components/empty';
import { SelectedItems } from '@/app/(myapp)/config/components/selected-items';
import { AddChecklistItem } from '@/app/(myapp)/config/components/add-checklist-item';
import { AddItem } from '@/app/(myapp)/config/components/add-item';
import { PriorityForm } from '@/app/(myapp)/config/components/priority-form';
import { IGRPOptionsProps } from '@igrp/igrp-framework-react-design-system';
import {
  IGRPDataTableFacetedFilterFn,
  IGRPDataTableDateRangeFilterFn,
} from '@igrp/igrp-framework-react-design-system';
import {
  IGRPDataTableHeaderSortToggle,
  IGRPDataTableHeaderSortDropdown,
  IGRPDataTableHeaderRowsSelect,
} from '@igrp/igrp-framework-react-design-system';
import TaskEditor from '@/app/(igrp)/(generated)/config/components/taskeditor';
import {
  IGRPPageHeader,
  IGRPCard,
  IGRPCardHeader,
  IGRPHeadline,
  IGRPCardContent,
  IGRPInputSearch,
  IGRPButton,
  IGRPTabs,
  IGRPTabItem,
  IGRPSeparator,
  IGRPInputText,
  IGRPCombobox,
  IGRPInputNumber,
  IGRPDataTable,
  IGRPDataTableRowAction,
  IGRPDataTableButtonLink,
} from '@igrp/igrp-framework-react-design-system';
import { useConfigPage } from '@/app/(myapp)/config/hooks/use-config-page';
import { DATE_FORMAT_OPTIONS } from '@/app/(myapp)/config/constants';

export default function PageConfigComponent() {
  type Table1 = {
    name: string;
    key: string;
    candidateGroups: string;
    defaultPriority: string;
    defaultDueDate: string;
  };

  const [selectedProcess, setSelectedProcess] = useState<any | undefined>(undefined);

  const [newGroupInput, setNewGroupInput] = useState<string>(``);

  const [editingTask, setEditingTask] = useState<any | undefined>(undefined);

  const [editingTaskIndex, setEditingTaskIndex] = useState<number>(-1);

  const [taskNewGroup, setTaskNewGroup] = useState<string>(``);

  const [filterProcess, setFilterProcess] = useState<string | undefined>(``);

  const [isResetting, setIsResetting] = useState<boolean>(false);

  const { igrpToast } = useIGRPToast();

  function handleAddGroup(value: any): void {
    const raw = typeof value === 'string' ? value : (value?.processKey ?? value?.key ?? '');
    const trimmed = raw.trim().replace(/,/g, '').replace(/\s+/g, ' ');
    if (!trimmed) return;
    const current = assignGroups.form.getValues('groups') || '';
    const parts = current
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.includes(trimmed)) return;
    const next = [...parts, trimmed].join(', ');
    assignGroups.form.setValue('groups', next);
    setNewGroupInput('');
  }

  async function handleSaveConfiguration(): Promise<void> {
    if (!selectedProcess?.id) {
      igrpToast({ type: 'error', title: 'Erro', description: 'Selecione um processo.' });
      return;
    }
    saveConfigurationMutation.mutate();
  }

  async function handleResetConfiguration(): Promise<void> {
    if (isResetting || saveConfigurationMutation.isPending) return;
    setIsResetting(true);
    try {
      if (selectedProcess?.id) {
        numberingConfig.loadConfig();
        assignGroups.loadConfig();
        priorityConfig.loadConfig();
        userTasks.loadConfig();
      }
      await loadAllProcesses();
    } finally {
      setIsResetting(false);
    }
  }

  function generateSampleNumber(): string {
    const { prefix, dateFormat, separator, sequenceLength } = numberingValues;
    const parts: string[] = [prefix || ''];

    if (dateFormat && dateFormat !== 'none') {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      switch (dateFormat) {
        case 'yyyy':
          parts.push(year);
          break;
        case 'yyyyMM':
          parts.push(year + month);
          break;
        case 'yyyyMMdd':
          parts.push(year + month + day);
          break;
      }
    }

    const sequence = '1'.padStart(sequenceLength || 3, '0');
    parts.push(sequence);
    return parts.join(separator || '-');
  }

  function handleRemoveGroup(item: any): void {
    const raw = typeof item === 'string' ? item : (item?.processKey ?? item?.key ?? '');
    const trimmed = raw.trim();
    if (!trimmed) return;
    const current = assignGroups.form.getValues('groups') ?? '';
    const parts = current
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const next = parts.filter((p) => p !== trimmed).join(', ');
    assignGroups.form.setValue('groups', next);
  }

  function closeTaskEditor(): void {
    setEditingTask(undefined);
    setEditingTaskIndex(-1);
    setTaskNewGroup('');
  }

  function openTaskEditor(task: any): void {
    const { index, ...rest } = task;
    setEditingTask({ ...rest });
    setEditingTaskIndex(index);
    setTaskNewGroup('');
  }

  async function onArchiveSuccess(): Promise<void> {
    setSelectedProcess(undefined);
    await loadAllProcesses();
  }

  const {
    allProcesses,
    availableGroups,
    loading,
    loadAllProcesses,
    assignGroups,
    numberingConfig,
    priorityConfig,
    userTasks,
    saveConfigurationMutation,
  } = useConfigPage({ processSelected: selectedProcess, filterProcess });

  useEffect(() => {
    if (selectedProcess?.processKey) {
      numberingConfig.loadConfig();
      assignGroups.loadConfig();
      priorityConfig.loadConfig();
    } else {
      numberingConfig.form.reset({
        prefix: '',
        dateFormat: 'yyyy',
        separator: '-',
        sequenceLength: 3,
      });
    }
  }, [selectedProcess?.processKey]);

  const numberingValues = numberingConfig.form.watch();
  const groupsValue = assignGroups.form.watch('groups') ?? '';

  return (
    <div className={cn('page', 'space-y-6')}>
      <div className={cn('section', ' space-y-6')}>
        <IGRPPageHeader
          id={`pageHeader1`}
          title={`Configuração de Processo`}
          description={`Configure a numeração, os grupos candidatos e as definições de tarefas`}
          iconBackButton={`Settings`}
          showBackButton={true}
          urlBackButton={`/#`}
          variant={`h3`}
        >
          <div className="flex items-center gap-2"></div>
        </IGRPPageHeader>

        <div className={cn('grid', 'lg:grid-cols-4 ', ' gap-4')}>
          <div className={cn('col-span-1 flex flex-col gap-6 ')}>
            <IGRPCard id={`card1`}>
              <IGRPCardHeader>
                <IGRPHeadline
                  id={`headline2`}
                  title={`Processos`}
                  description={`Selecione um processo para configurar`}
                  variant={`h6`}
                  roleColor={`solid`}
                  color={`primary`}
                  showIcon={false}
                ></IGRPHeadline>
              </IGRPCardHeader>
              <IGRPCardContent className={cn('space-y-4 px-0', 'space-x-3', 'space-y-3')}>
                <IGRPInputSearch
                  id={`inputSearch1`}
                  label={undefined}
                  showStartIcon={true}
                  startIcon={`Search`}
                  submitIcon={`ArrowRight`}
                  required={false}
                  submitButtonLabel={undefined}
                  placeholder={`Pesquisar...`}
                  className={cn('pl-3')}
                  setValueChange={(value) => setFilterProcess(value)}
                  value={filterProcess}
                ></IGRPInputSearch>

                <ProcessList
                  items={allProcesses}
                  selectedProcess={selectedProcess}
                  setSelectedProcess={setSelectedProcess}
                  loading={loading}
                ></ProcessList>
              </IGRPCardContent>
            </IGRPCard>
          </div>
          <div
            className={cn(
              'col-span-1 flex flex-col gap-6 ',
              'md:col-span-3 flex flex-col gap-6 ',
              'lg:col-span-3 flex flex-col gap-6 ',
              'xl:col-span-3 flex flex-col gap-6 ',
            )}
          >
            <div className={cn('flex flex-row flex-wrap items-center justify-between gap-2')}>
              <div className={cn('flex')}>
                {selectedProcess?.name && (
                  <IGRPHeadline
                    id={`headline1`}
                    variant={`h6`}
                    roleColor={`solid`}
                    color={`primary`}
                    showIcon={false}
                    title={selectedProcess?.name}
                    description={selectedProcess?.processKey + ' - ' + selectedProcess?.version}
                  ></IGRPHeadline>
                )}
              </div>
              <div className={cn('flex', ' flex justify-end gap-2')}>
                <ActionsItem
                  processDefinitionId={selectedProcess?.id}
                  onArchiveSuccess={onArchiveSuccess}
                  onImportSuccess={loadAllProcesses}
                ></ActionsItem>
                <IGRPButton
                  id={`button2`}
                  variant={`secondary`}
                  size={`default`}
                  showIcon={false}
                  loading={isResetting}
                  loadingText={`A recarregar...`}
                  disabled={isResetting || saveConfigurationMutation.isPending}
                  onClick={handleResetConfiguration}
                >
                  Cancelar
                </IGRPButton>

                <IGRPButton
                  id={`button1`}
                  variant={`default`}
                  size={`default`}
                  showIcon={false}
                  loading={saveConfigurationMutation.isPending}
                  loadingText={`A gravar...`}
                  disabled={isResetting || saveConfigurationMutation.isPending}
                  onClick={handleSaveConfiguration}
                >
                  Guardar Configuração
                </IGRPButton>
              </div>
            </div>
            <div className={cn()}>
              {!selectedProcess?.name && (
                <Empty
                  title={`Selecione um processo para configurar`}
                  description={`Escolha um processo na lista para configurar os grupos candidatos, a numeração e as tarefas.`}
                  className={`border border-dashed rounded-md p-6`}
                ></Empty>
              )}
            </div>
            {selectedProcess?.name && (
              <IGRPTabs
                variant={`default`}
                tabContentClassName={`space-y-4`}
                showIcon={true}
                iconPlacement={`start`}
                contentBorder={true}
                badgePlacement={`end`}
                orientation={`horizontal`}
                items={[
                  {
                    value: `tabsItem1-bwOE`,
                    label: `Definições Gerais`,
                    icon: `Settings2`,
                    badgeVariant: `solid` as const,
                    badgeColor: `primary` as const,
                    content: (
                      <>
                        <IGRPCard id={`card2`}>
                          <IGRPCardHeader>
                            <IGRPHeadline
                              id={`headline3`}
                              title={`Grupos Candidatos ao Nível do Processo`}
                              description={`Grupos com acesso a este processo. Aplicam-se a todas as tarefas, exceto quando substituídos ao nível da tarefa.`}
                              variant={`h6`}
                              roleColor={`solid`}
                              color={`primary`}
                              showIcon={false}
                            ></IGRPHeadline>
                          </IGRPCardHeader>
                          <IGRPCardContent className={cn('space-y-4', 'space-x-3', 'space-y-3')}>
                            <SelectedItems
                              items={groupsValue}
                              removeItem={handleRemoveGroup}
                            ></SelectedItems>
                            <IGRPSeparator
                              id={`separator2`}
                              orientation={`horizontal`}
                            ></IGRPSeparator>

                            <AddChecklistItem
                              label={`Grupos Disponíveis`}
                              availableItems={availableGroups}
                              items={groupsValue
                                .split(',')
                                .map((s) => ({ key: s.trim() }))
                                .filter((x) => x.key)}
                              removeItem={handleRemoveGroup}
                              addItem={handleAddGroup}
                            ></AddChecklistItem>
                            <IGRPSeparator
                              id={`separator1`}
                              orientation={`horizontal`}
                            ></IGRPSeparator>

                            <AddItem
                              label={`Adicionar Grupo Personalizado`}
                              placeholder={`Introduza o nome do grupo...`}
                              value={newGroupInput}
                              setValue={setNewGroupInput}
                              addItem={handleAddGroup}
                            ></AddItem>
                          </IGRPCardContent>
                        </IGRPCard>

                        <IGRPCard id={`card3`}>
                          <IGRPCardHeader>
                            <IGRPHeadline
                              id={`headline4`}
                              title={`Opções de Prioridade`}
                              description={`Defina os níveis de prioridade disponíveis para as tarefas deste processo. Cada opção tem um rótulo e um valor numérico.`}
                              variant={`h6`}
                              roleColor={`solid`}
                              color={`primary`}
                              showIcon={false}
                            ></IGRPHeadline>
                          </IGRPCardHeader>
                          <IGRPCardContent className={cn('space-y-4', 'space-x-3', 'space-y-3')}>
                            <PriorityForm
                              priorityOptions={priorityConfig.priorityOptions}
                              newPriorityLabel={priorityConfig.newPriorityLabel}
                              newPriorityValue={priorityConfig.newPriorityValue}
                              newPriorityColor={priorityConfig.newPriorityColor}
                              updatePriorityOption={priorityConfig.updatePriority}
                              removePriorityOption={priorityConfig.removePriority}
                              addPriorityOption={priorityConfig.addPriority}
                              setNewPriorityLabel={priorityConfig.setNewPriorityLabel}
                              setNewPriorityValue={priorityConfig.setNewPriorityValue}
                              setNewPriorityColor={priorityConfig.setNewPriorityColor}
                            ></PriorityForm>
                          </IGRPCardContent>
                        </IGRPCard>
                      </>
                    ),
                  },

                  {
                    value: `tabsItem2-niex`,
                    label: `Numeração do Processo`,
                    icon: `Hash`,
                    badgeVariant: `solid` as const,
                    badgeColor: `primary` as const,
                    content: (
                      <>
                        <IGRPCard id={`card4`}>
                          <IGRPCardHeader>
                            <IGRPHeadline
                              id={`headline5`}
                              title={`Configuração de Numeração do Processo`}
                              description={`Configure como os números das instâncias de processo são gerados. Exemplo: LOAN-2026-001`}
                              variant={`h6`}
                              roleColor={`solid`}
                              color={`primary`}
                              showIcon={false}
                            ></IGRPHeadline>
                          </IGRPCardHeader>
                          <IGRPCardContent className={cn('space-y-4', 'space-x-3', 'space-y-3')}>
                            <div className={cn('grid', 'lg:grid-cols-2 ', ' gap-4')}>
                              <IGRPInputText
                                id={`inputText1`}
                                label={`Prefixo`}
                                showIcon={false}
                                required={false}
                                placeholder={`ex.: LOAN`}
                                className={cn('col-span-1')}
                                onChange={(e) =>
                                  numberingConfig.addFieldValue('prefix', e.target.value)
                                }
                                value={numberingValues.prefix}
                              ></IGRPInputText>

                              <IGRPCombobox
                                id={`combobox1`}
                                label={`Formato da Data`}
                                variant={`single`}
                                placeholder={`Selecione uma opção...`}
                                selectLabel={`No option found`}
                                showSearch={true}
                                showIcon={false}
                                iconName={`CornerDownRight`}
                                className={cn('col-span-1')}
                                onChange={(v: string | string[]) =>
                                  numberingConfig.addFieldValue(
                                    'dateFormat',
                                    Array.isArray(v) ? (v[0] ?? '') : v,
                                  )
                                }
                                options={DATE_FORMAT_OPTIONS}
                                value={numberingValues.dateFormat}
                              ></IGRPCombobox>

                              <IGRPInputText
                                id={`inputText2`}
                                label={`Separator`}
                                showIcon={false}
                                required={false}
                                placeholder={`-`}
                                className={cn('col-span-1')}
                                onChange={(e) =>
                                  numberingConfig.addFieldValue('separator', e.target.value)
                                }
                                value={numberingValues.separator}
                              ></IGRPInputText>

                              <IGRPInputNumber
                                id={`inputNumber1`}
                                label={`Comprimento da Sequência`}
                                max={10}
                                step={1}
                                required={false}
                                min={1}
                                className={cn('col-span-1')}
                                onChange={(value: number) =>
                                  numberingConfig.addFieldValue('sequenceLength', value.toString())
                                }
                                value={numberingValues.sequenceLength}
                              ></IGRPInputNumber>
                            </div>
                            <div className={cn(' rounded-lg bg-muted p-4')}>
                              <p className={cn(' text-sm font-medium mb-2')}>
                                Número Gerado (Exemplo)
                              </p>
                              <p className={cn(' text-2xl font-mono')}>{generateSampleNumber()}</p>
                            </div>
                          </IGRPCardContent>
                        </IGRPCard>
                      </>
                    ),
                  },

                  {
                    value: `tabsItem3-perT`,
                    label: `Configuração de Tarefas`,
                    icon: `Users`,
                    badgeVariant: `solid` as const,
                    badgeColor: `primary` as const,
                    content: (
                      <>
                        <IGRPCard id={`card5`}>
                          <IGRPCardHeader>
                            <IGRPHeadline
                              id={`headline6`}
                              title={`Tarefas do Utilizador`}
                              description={`Configure os grupos candidatos e as definições de cada tarefa deste processo`}
                              variant={`h6`}
                              roleColor={`solid`}
                              color={`primary`}
                              showIcon={false}
                            ></IGRPHeadline>
                          </IGRPCardHeader>
                          <IGRPCardContent className={cn('space-y-4', 'space-x-3', 'space-y-3')}>
                            <IGRPDataTable<Table1, Table1>
                              id={`table1`}
                              pageSizePagination={[]}
                              columns={[
                                {
                                  header: 'Nome da Tarefa',
                                  accessorKey: 'name',

                                  cell: ({ row }) => {
                                    return row.getValue('name');
                                  },
                                  filterFn: IGRPDataTableFacetedFilterFn,
                                },
                                {
                                  header: 'Chave da Tarefa',
                                  accessorKey: 'key',

                                  cell: ({ row }) => {
                                    return row.getValue('key');
                                  },
                                  filterFn: IGRPDataTableFacetedFilterFn,
                                },
                                {
                                  header: 'Grupos Candidatos',
                                  accessorKey: 'candidateGroups',

                                  cell: ({ row }) => {
                                    return row.getValue('candidateGroups');
                                  },
                                  filterFn: IGRPDataTableFacetedFilterFn,
                                },
                                {
                                  header: 'Prioridade',
                                  accessorKey: 'defaultPriority',

                                  cell: ({ row }) => {
                                    return row.getValue('defaultPriority');
                                  },
                                  filterFn: IGRPDataTableFacetedFilterFn,
                                },
                                {
                                  header: 'Data Limite',
                                  accessorKey: 'defaultDueDate',

                                  cell: ({ row }) => {
                                    return row.getValue('defaultDueDate');
                                  },
                                  filterFn: IGRPDataTableFacetedFilterFn,
                                },
                                {
                                  id: 'tableActionListCell1',
                                  enableHiding: false,
                                  cell: ({ row }) => {
                                    const rowData = row.original;

                                    return (
                                      <IGRPDataTableRowAction>
                                        <IGRPDataTableButtonLink
                                          labelTrigger={`Editar`}
                                          variant={`ghost`}
                                          icon={`Pencil`}
                                          className={cn('size-11')}
                                          action={() => openTaskEditor(rowData)}
                                        ></IGRPDataTableButtonLink>
                                      </IGRPDataTableRowAction>
                                    );
                                  },
                                  filterFn: IGRPDataTableFacetedFilterFn,
                                },
                              ]}
                              clientFilters={[]}
                              data={userTasks.list}
                            />

                            {editingTask !== undefined && (
                              <TaskEditor
                                open={editingTask !== undefined}
                                editingTask={editingTask}
                                setOpen={(open) => !open && closeTaskEditor()}
                                onSave={async (req) => {
                                  if (!selectedProcess?.id) return;
                                  await userTasks.handleSave(req);
                                }}
                              ></TaskEditor>
                            )}
                          </IGRPCardContent>
                        </IGRPCard>
                      </>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
