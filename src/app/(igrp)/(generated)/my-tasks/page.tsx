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
  IGRPDataTableRowAction,
  IGRPDataTableButtonLink,
} from '@igrp/igrp-framework-react-design-system';
import { useRouter } from 'next/navigation';
import { urlConfig } from '@/app/(myapp)/utils/url-config';
import { useDashboard } from '@/app/(myapp)/dashboard/hooks/use-dashboard';
import { useMyTasks } from '@/app/(myapp)/my-tasks/hooks/use-my-tasks';

export default function PageMytasksComponent() {
  type Table1 = {
    process: string;
    currentStep: string;
    startedAt: string;
    duration: string;
    priority: string;
    taskId: string;
    processName: string;
  };

  const [statstatsCard1Value, setStatstatsCard1Value] = useState<string | number>(0);
  const [statstatsCard2Value, setStatstatsCard2Value] = useState<string | number>(0);
  const [statstatsCard5Value, setStatstatsCard5Value] = useState<string | number>(0);
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
    router.push(taskUrl as any);
  }

  //-------------------reserved area start----------------------------
  const router = useRouter();

  const { stats, loading: statsLoading } = useDashboard();
  const {
    tableData,
    loading,
    filters,
    unclaimModalState,
    fetchMyTasks,
    applyFilters,
    resetFilters,
    handleSearch,
    updateFilters,
    handleUnclaimTask,
    handleOpenUnclaimModal,
    handleCloseUnclaimModal,
  } = useMyTasks();

  // Transform data for the table
  useEffect(() => {
    setStatstatsCard1Value(stats.tasks.totalMyTasks);
    setStatstatsCard2Value(stats.tasks.totalTasksAvailable);
    setStatstatsCard5Value(stats.tasks.totalMyTasksSuspended);
    setStatstatsCard4Value(stats.tasks.totalMyTasksCancelled);
    setStatstatsCard3Value(stats.tasks.totalMyTasksCompleted);
  }, [stats]);

  const handleSearchSubmit = (searchTerm: string) => {
    handleSearch(searchTerm);
  };

  const handleApplyFilters = (filters: any) => {
    updateFilters(filters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };
  // Handle unclaim task save
  const handleUnclaimTaskSave = async (formData: { note?: string }) => {
    const result = await handleUnclaimTask(formData.note);

    if (igrpToast) {
      igrpToast({
        type: result?.success ? 'success' : 'error',
        title: result?.success ? 'Sucesso' : 'Erro',
        description: result?.message,
      });
    }
  };

  // Define modal subtitle with dynamic content
  const modalSubtitle = `Libertar a tarefa "${unclaimModalState.selectedTask?.currentStep}" do processo "${unclaimModalState.selectedTask?.processName}"`;

  //-------------------reserved area end------------------------------

  return (
    <div className={cn('page', 'space-y-6')}>
      <IGRPPageHeader
        id={`pageHeader1`}
        title={`Minhas Tarefas`}
        description={`Tarefas atribuídas a você`}
        iconBackButton={`ArrowLeft`}
        urlBackButton={`/dashboard`}
        variant={`h3`}
      >
        <div className="flex items-center gap-2"></div>
      </IGRPPageHeader>

      <div
        className={cn('grid', 'md:grid-cols-2 ', 'lg:grid-cols-4 ', 'xl:grid-cols-5 ', ' gap-4')}
      >
        <IGRPStatsCard
          id={`statsCard1`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`info`}
          iconBackground={`square`}
          title={`Total de Tarefas`}
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
          id={`statsCard2`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`warning`}
          iconBackground={`square`}
          title={`Total Disponiveis`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`CircleAlert`}
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
          id={`statsCard5`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`primary`}
          iconBackground={`square`}
          title={`Total Suspensos`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`Pause`}
          iconSize={`md`}
          iconVariant={`primary`}
          iconPlacement={`end`}
          itemPlacement={`start`}
          showIconBackground={true}
          className={cn('col-span-1')}
          onClick={() => {}}
          value={statstatsCard5Value}
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
      <div className={cn(' border rounded-lg')}>
        <TaskProcessFilter
          showTaskFilters={true}
          hideCandidateUsers={true}
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
          showFilter={true}
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
                <IGRPDataTableHeaderSortToggle column={column} title={`Duraçāo`} />
              ),
              accessorKey: 'duration',

              cell: ({ row }) => {
                return row.getValue('duration');
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
                      labelTrigger={`Executar Tarefa`}
                      variant={`ghost`}
                      icon={`Play`}
                      action={() => {
                        executeTask(rowData);
                      }}
                    ></IGRPDataTableButtonLink>
                    <IGRPDataTableButtonLink
                      labelTrigger={`Libertar Tarefa`}
                      variant={`ghost`}
                      icon={`UserX`}
                      action={() => {
                        handleOpenUnclaimModal(rowData);
                      }}
                    ></IGRPDataTableButtonLink>
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
        modalTitle={`Libertar Tarefa`}
        modalSubTitle={modalSubtitle}
        open={unclaimModalState.isOpen}
        setOpen={(open) => (open ? {} : handleCloseUnclaimModal())}
        onSave={handleUnclaimTaskSave}
      ></CommonUserTaskModalForm>
    </div>
  );
}
