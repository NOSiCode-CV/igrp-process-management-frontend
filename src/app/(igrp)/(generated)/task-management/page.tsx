'use client';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import TaskProcessFilter from '@/components/taskprocessfilter';
import { FilterActives } from '@/app/(myapp)/components/filter-actives';
import {
  IGRPDataTableFacetedFilterFn,
  IGRPDataTableDateRangeFilterFn,
} from '@igrp/igrp-framework-react-design-system';
import {
  IGRPDataTableHeaderSortToggle,
  IGRPDataTableHeaderSortDropdown,
  IGRPDataTableHeaderRowsSelect,
} from '@igrp/igrp-framework-react-design-system';
import { LoadingPage } from '@/app/(myapp)/components/loading-page';
import CommonUserTaskModalForm from '@/components/commonusertaskmodalform';
import {
  IGRPPageHeader,
  IGRPStatsCard,
  IGRPDataTable,
  IGRPDataTableCellBadge,
  IGRPDataTableRowAction,
  IGRPDataTableButtonLink,
} from '@igrp/igrp-framework-react-design-system';
import { useRouter } from 'next/navigation';
import { urlConfig } from '@/app/(myapp)/utils/url-config';
import { useDashboard } from '@/app/(myapp)/dashboard/hooks/use-dashboard';
import { useTaskManagement } from '@/app/(myapp)/task-management/hooks/use-task-management';
import { getTaskStatusColor } from '@/app/(myapp)/utils/status-badge';

export default function PageTaskmanagementComponent() {
  type Table1 = {
    process: string;
    currentStep: string;
    assignedBy: string;
    startedAt: string;
    endedAt: string;
    duration: string;
    status: string;
    priority: string;
    taskId: string;
  };

  const [statstatsCard1Value, setStatstatsCard1Value] = useState<string | number>(0);
  const [statstatsCard5Value, setStatstatsCard5Value] = useState<string | number>(0);
  const [statstatsCard2Value, setStatstatsCard2Value] = useState<string | number>(0);
  const [statstatsCard4Value, setStatstatsCard4Value] = useState<string | number>(0);
  const [statstatsCard3Value, setStatstatsCard3Value] = useState<string | number>(0);

  const { igrpToast } = useIGRPToast();

  async function executeTask(row: any): Promise<void | undefined> {
    // Navigate to task execution page using centralized URL config
    const taskUrl = await urlConfig.buildTaskExecutionUrl(
      row.processKey,
      row.processInstanceId,
      row.taskKey,
      row.taskId,
      row.applicationBase,
    );
    window.location.assign(taskUrl as any);
  }

  //-------------------reserved area start----------------------------
  const router = useRouter();
  const { stats, loading: statsLoading } = useDashboard();
  const {
    assignModalState,
    tableData,
    loading,
    error,
    handleSearch,
    resetFilters,
    updateFilters,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleAssignTask,
    getPriorityBadge,
    filters,
  } = useTaskManagement();

  // Transform data for the table
  useEffect(() => {
    if (stats && !statsLoading) {
      setStatstatsCard1Value(stats.tasks.totalTasks);
      setStatstatsCard5Value(stats.tasks.totalTasksAvailable);
      setStatstatsCard2Value(stats.tasks.totalTasksAssigned);
      setStatstatsCard3Value(stats.tasks.totalTasksCancelled);
      setStatstatsCard4Value(stats.tasks.totalTasksCompleted);
    }
  }, [stats, statsLoading]);

  const handleSearchSubmit = (searchTerm: string) => {
    handleSearch(searchTerm);
  };

  const handleApplyFilters = (filters?: any) => {
    if (filters) {
      // Update filters directly - useQuery will auto-refetch
      updateFilters(filters);
    }
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      igrpToast({
        title: 'Erro',
        description: error,
      });
    }
  }, [error, igrpToast]);

  // Handle assign task save
  const handleAssignTaskSave = async (formData: {
    user: string;
    note?: string;
    priority?: string;
    candidateGroups?: string;
    assigneTo?: string;
  }) => {
    if (formData.assigneTo === 'user' && formData.user === '') {
      igrpToast({
        type: 'error',
        title: 'Erro',
        description: 'O utilizador é obrigatório',
      });
      return;
    }
    if (formData.assigneTo === 'group' && formData.candidateGroups === '') {
      igrpToast({
        type: 'error',
        title: 'Erro',
        description: 'O grupo é obrigatório',
      });
      return;
    }
    const result = await handleAssignTask(
      formData.user,
      formData.priority ?? '',
      formData.note ?? '',
      formData.candidateGroups ?? '',
    );

    if (igrpToast) {
      igrpToast({
        type: result?.success ? 'success' : 'error',
        title: result?.success ? 'Sucesso' : 'Erro',
        description: result?.message,
      });
    }
  };

  // Define modal subtitle with dynamic content
  const modalSubtitle = `Indicar um utilizador para assumir a tarefa "${assignModalState.selectedTask?.currentStep}" do processo "${assignModalState.selectedTask?.processName}"`;

  //-------------------reserved area end------------------------------

  return (
    <div className={cn('page', 'space-y-6')}>
      <IGRPPageHeader
        id={`pageHeader1`}
        title={`Gestão de Tarefas`}
        description={`Visualize e gerencie todas as tarefas do sistema`}
        iconBackButton={`ChartLine`}
        urlBackButton={`/dashboard`}
        variant={`h3`}
      >
        <div className="flex items-center gap-2"></div>
      </IGRPPageHeader>

      <div
        className={cn('grid', 'md:grid-cols-5 ', 'lg:grid-cols-5 ', 'xl:grid-cols-5 ', ' gap-4')}
      >
        <IGRPStatsCard
          id={`statsCard1`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`info`}
          iconBackground={`square`}
          title={`Total Tarefas`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`ListChecks`}
          iconSize={`md`}
          iconVariant={`info`}
          iconPlacement={`end`}
          itemPlacement={`start`}
          showIconBorder={false}
          showIconBackground={true}
          className={cn('col-span-1')}
          onClick={() => {}}
          value={statstatsCard1Value}
        ></IGRPStatsCard>

        <IGRPStatsCard
          id={`statsCard5`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`indigo`}
          iconBackground={`square`}
          title={`Total Disponiveis`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`FolderOpen`}
          iconSize={`md`}
          iconVariant={`indigo`}
          iconPlacement={`end`}
          itemPlacement={`start`}
          showIconBackground={true}
          className={cn('col-span-1')}
          onClick={() => {}}
          value={statstatsCard5Value}
        ></IGRPStatsCard>

        <IGRPStatsCard
          id={`statsCard2`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`warning`}
          iconBackground={`square`}
          title={`Total Atribuibos`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`UserCheck`}
          iconSize={`md`}
          iconVariant={`warning`}
          iconPlacement={`end`}
          itemPlacement={`start`}
          showIconBackground={true}
          showIconBorder={false}
          className={cn('col-span-1')}
          onClick={() => {}}
          value={statstatsCard2Value}
        ></IGRPStatsCard>

        <IGRPStatsCard
          id={`statsCard4`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`destructive`}
          iconBackground={`square`}
          title={`Total Cancelados`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`CalendarX2`}
          iconSize={`md`}
          iconVariant={`destructive`}
          iconPlacement={`end`}
          itemPlacement={`start`}
          showIconBackground={true}
          className={cn('col-span-1')}
          onClick={() => {}}
          value={statstatsCard4Value}
        ></IGRPStatsCard>

        <IGRPStatsCard
          id={`statsCard3`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`success`}
          iconBackground={`square`}
          title={`Total Finalizados`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`CheckCheck`}
          iconSize={`md`}
          iconVariant={`success`}
          iconPlacement={`end`}
          itemPlacement={`start`}
          showIconBackground={true}
          showIconBorder={false}
          className={cn('col-span-1')}
          onClick={() => {}}
          value={statstatsCard3Value}
        ></IGRPStatsCard>
      </div>
      <div className={cn(' border rounded-sm p-3')}>
        <TaskProcessFilter
          showTaskFilters={true}
          onSearch={handleSearchSubmit}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          onFiltersChange={handleApplyFilters}
        ></TaskProcessFilter>
      </div>
      <FilterActives filters={filters} onFiltersChange={handleApplyFilters}></FilterActives>
      {!loading && (
        <IGRPDataTable<Table1, Table1>
          id={`table1`}
          showPagination={true}
          paginationClassName={`px-3 pb-3`}
          columns={[
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Processo`} />
              ),
              accessorKey: 'process',

              cell: ({ row }) => {
                return row.getValue('process');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Tarefa`} />
              ),
              accessorKey: 'currentStep',

              cell: ({ row }) => {
                return row.getValue('currentStep');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Utilizador`} />
              ),
              accessorKey: 'assignedBy',

              cell: ({ row }) => {
                return row.getValue('assignedBy');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Data Início`} />
              ),
              accessorKey: 'startedAt',

              cell: ({ row }) => {
                return row.getValue('startedAt');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Data Fim`} />
              ),
              accessorKey: 'endedAt',

              cell: ({ row }) => {
                return row.getValue('endedAt');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: 'Duração',
              accessorKey: 'duration',

              cell: ({ row }) => {
                return row.getValue('duration');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Estado`} />
              ),
              accessorKey: 'status',

              cell: ({ row }) => {
                const rowData = row.original;

                const { iconName, bgClass, textClass, label, className } =
                  getTaskStatusColor(rowData);
                return (
                  <IGRPDataTableCellBadge
                    label={label ?? row.original.status}
                    variant={`soft`}
                    badgeClassName={`${bgClass} ${textClass} ${className}`}
                  ></IGRPDataTableCellBadge>
                );
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: 'Prioridade',
              accessorKey: 'priority',

              cell: ({ row }) => {
                return row.getValue('priority');
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
                      labelTrigger={`Detalhes da Tarefa`}
                      href={`/task-management/${row.original.taskId}`}
                      variant={`ghost`}
                      icon={`ClipboardList`}

                      action={() => {}}
                    ></IGRPDataTableButtonLink>
                    {rowData?.status !== 'COMPLETED' && rowData?.status !== 'ASSIGNED' && (
                      <IGRPDataTableButtonLink
                        labelTrigger={`Atribuir Tarefa`}
                        variant={`ghost`}
                        icon={`UserCheck`}

                        action={() => {
                          handleOpenAssignModal(rowData);
                        }}
                      ></IGRPDataTableButtonLink>
                    )}
                  </IGRPDataTableRowAction>
                );
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
          ]}
          clientFilters={[]}

          data={tableData}
        />
      )}
      <LoadingPage isLoading={loading}></LoadingPage>
      <CommonUserTaskModalForm
        modalTitle={`Atribuir Tarefa`}
        userRequired={true}
        showPriority={true}
        open={assignModalState.isOpen}
        modalSubTitle={modalSubtitle}
        setOpen={(open) => (open ? {} : handleCloseAssignModal())}
        onSave={handleAssignTaskSave}
      ></CommonUserTaskModalForm>
    </div>
  );
}
