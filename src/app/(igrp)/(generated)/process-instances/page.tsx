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
import { useProcessInstances } from '@/app/(myapp)/process-instances/hooks/use-process-instances';

export default function PageProcessinstancesComponent() {
  type Table1 = {
    processInfo: string;
    businessKey: string;
    startedBy: string;
    version: string;
    progress: string;
    startedAt: string;
    daysWaiting: string;
    status: string;
    priority: string;
    processInstanceId: string;
  };

  const [statstatsCard1Value, setStatstatsCard1Value] = useState<string | number>(0);
  const [statstatsCard2Value, setStatstatsCard2Value] = useState<string | number>(0);
  const [statstatsCard4Value, setStatstatsCard4Value] = useState<string | number>(0);
  const [statstatsCard3Value, setStatstatsCard3Value] = useState<string | number>(0);

  const { igrpToast } = useIGRPToast();

  async function goToProcessRuntime(row: any): Promise<void | undefined> {
    const taskUrl = await urlConfig.buildTaskExecutionUrl(
      row.procReleaseKey,
      row.processInstanceId,
      row.taskKey,
      row.taskId,
      row.applicationBase,
    );
    window.location.assign(taskUrl as any);
  }

  async function consultarProcess(row: any): Promise<void> {
    // Navigate to task execution page using centralized URL config
    const taskUrl = await urlConfig.buildProcessInstanceUrl(
      row.processInstanceId,
      row.applicationBase,
    );
    window.location.assign(taskUrl as any);
  }

  //-------------------reserved area start----------------------------
  const { stats, loading: statsLoading } = useDashboard();
  const router = useRouter();
  const { tableData, loading, error, handleSearch, resetFilters, updateFilters, filters } =
    useProcessInstances();

  // Update table data when process instances change
  useEffect(() => {
    if (stats && !statsLoading) {
      setStatstatsCard1Value(stats.processInstances.totalInstances);
      setStatstatsCard2Value(stats.processInstances.totalRunning);
      setStatstatsCard3Value(stats.processInstances.totalCompleted);
      setStatstatsCard4Value(stats.processInstances.totalCancelled);
    }
  }, [stats]);

  // Handle filter application with process instance filters
  const handleApplyFilters = (filters?: any) => {
    if (filters) {
      // Update filters directly - useQuery will auto-refetch
      updateFilters(filters);
    }
  };

  // Handle filter reset
  const handleResetFilters = () => {
    resetFilters();
  };

  // Handle search
  const handleSearchSubmit = (searchTerm: string) => {
    handleSearch(searchTerm);
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

  //-------------------reserved area end------------------------------

  return (
    <div className={cn('page', 'space-y-6')}>
      <IGRPPageHeader
        id={`pageHeader1`}
        title={`Histórico de Processo`}
        description={`Consultar e auditar instâncias históricas de processos`}
        iconBackButton={`ArrowLeft`}
        urlBackButton={`/dashboard`}
        variant={`h3`}
      >
        <div className="flex items-center gap-2"></div>
      </IGRPPageHeader>

      <div className={cn('grid', 'md:grid-cols-2 ', 'lg:grid-cols-4 ', ' gap-4')}>
        <IGRPStatsCard
          id={`statsCard1`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`info`}
          iconBackground={`square`}
          title={`Total de Processos`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`Settings`}
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
          title={`Total em Execução`}
          titleSize={`sm`}
          valueSize={`2xl`}
          showIcon={true}
          iconName={`Play`}
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
          iconName={`CircleCheck`}
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
          isProcess={true}
          onSearch={handleSearchSubmit}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          onFiltersChange={handleApplyFilters}
        ></TaskProcessFilter>
      </div>
      <FilterActives filters={filters} onFiltersChange={handleApplyFilters}></FilterActives>
      {!loading && (
        <IGRPDataTable<Table1, Table1>
          id={`processes`}
          showFilter={true}
          showPagination={true}
          paginationClassName={`px-3 pb-3`}
          className={cn('border-0 border-solid border-[#000000]')}
          columns={[
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Processo`} />
              ),
              accessorKey: 'processInfo',

              cell: ({ row }) => {
                return row.getValue('processInfo');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Business Key`} />
              ),
              accessorKey: 'businessKey',

              cell: ({ row }) => {
                return row.getValue('businessKey');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Iniciado por`} />
              ),
              accessorKey: 'startedBy',

              cell: ({ row }) => {
                return row.getValue('startedBy');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Ver.`} />
              ),
              accessorKey: 'version',

              cell: ({ row }) => {
                return row.getValue('version');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: 'Progresso',
              accessorKey: 'progress',

              cell: ({ row }) => {
                return row.getValue('progress');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Iniciado`} />
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
              accessorKey: 'daysWaiting',

              cell: ({ row }) => {
                return row.getValue('daysWaiting');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Estado`} />
              ),
              accessorKey: 'status',

              cell: ({ row }) => {
                return row.getValue('status');
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
                      labelTrigger={`Detalhes do Processo`}
                      href={`/process-instances/${row.original.processInstanceId}`}
                      variant={`ghost`}
                      icon={`Info`}

                      action={() => {
                        goToProcessRuntime(rowData);
                      }}
                    ></IGRPDataTableButtonLink>
                    <IGRPDataTableButtonLink
                      labelTrigger={`Consultar Processo`}
                      variant={`ghost`}
                      icon={`FileSpreadsheet`}

                      action={() => {
                        consultarProcess(rowData);
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
    </div>
  );
}
