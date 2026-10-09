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
  IGRPDataTableCellBadge,
  IGRPDataTableRowAction,
  IGRPDataTableButtonLink,
} from '@igrp/igrp-framework-react-design-system';
import { useDashboard } from '@/app/(myapp)/dashboard/hooks/use-dashboard';
import { useAvailableTasks } from '@/app/(myapp)/available-tasks/hooks/use-available-tasks';
import { getTaskStatusColor } from '@/app/(myapp)/utils/status-badge';

export default function PageAvailabletasksComponent() {
  type Table1 = {
    processInfo: string;
    taskName: string;
    startedAt: string;
    duration: string;
    priority: string;
    status: string;
    taskId: string;
  };

  const [statstatsCard1Value, setStatstatsCard1Value] = useState<string | number>(0);

  const [showFilter, setShowFilter] = useState<boolean>(false);

  const { igrpToast } = useIGRPToast();

  //------------------------------------Reserved Area-------------------------
  const { stats, loading: statsLoading } = useDashboard();

  const {
    tableData,
    loading,
    error,
    totalElements,
    totalPages,
    currentPage,
    filters,
    handleSearch,
    updateFilters,
    applyFilters,
    resetFilters,
    handleClaimTask,
  } = useAvailableTasks();

  // Update table data when tableData changes
  useEffect(() => {
    setStatstatsCard1Value(stats.tasks.totalTasksAvailable);
  }, [stats]);

  const handleApplyFilters = (filters: any) => {
    updateFilters(filters);
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

  // Handle claim task action
  const onClaimTask = async (taskId: string) => {
    const result = await handleClaimTask(taskId); // You might want to get the actual user from context/session

    if (result.success) {
      igrpToast({
        type: 'success',
        title: 'Sucesso',
        description: 'Tarefa assumida com sucesso!',
      });
    } else {
      igrpToast({
        type: 'error',
        title: 'Erro',
        description: result.error || 'Erro ao assumir tarefa',
      });
    }
  };

  //------------------------------------Reserved Area-------------------------

  return (
    <div className={cn('page', 'space-y-6')}>
      <IGRPPageHeader
        id={`pageHeader1`}
        title={`Tarefas Disponíveis`}
        description={`Visualize e atribua tarefas disponíveis para você`}
        iconBackButton={`ArrowLeft`}
        urlBackButton={`/dashboard`}
        variant={`h3`}
      >
        <div className="flex items-center gap-2"></div>
      </IGRPPageHeader>

      <div className={cn('grid', 'md:grid-cols-2 ', 'lg:grid-cols-3 ', ' gap-4')}>
        <IGRPStatsCard
          id={`statsCard1`}
          cardBorderPosition={`top`}
          cardBorder={`rounded-lg`}
          cardVariant={`info`}
          iconBackground={`square`}
          title={``}
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
      </div>
      <div className={cn(' border rounded-sm p-3')}>
        <TaskProcessFilter
          showTaskFilters={true}
          onSearch={handleSearch}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          onFiltersChange={handleApplyFilters}
        ></TaskProcessFilter>
      </div>
      <FilterActives filters={filters} onFiltersChange={handleApplyFilters}></FilterActives>
      {!loading && (
        <IGRPDataTable<Table1, Table1>
          id={`tasks`}
          showPagination={true}
          isNumericPagination={true}
          paginationClassName={`px-3 pb-3`}
          pageSizePagination={[]}
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
                <IGRPDataTableHeaderSortToggle column={column} title={`Tarefa`} />
              ),
              accessorKey: 'taskName',

              cell: ({ row }) => {
                return row.getValue('taskName');
              },
              filterFn: IGRPDataTableFacetedFilterFn,
            },
            {
              header: ({ column }) => (
                <IGRPDataTableHeaderSortToggle column={column} title={`Data Inicio`} />
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
              id: 'tableActionListCell1',
              enableHiding: false,
              cell: ({ row }) => {
                const rowData = row.original;

                return (
                  <IGRPDataTableRowAction>
                    <IGRPDataTableButtonLink
                      labelTrigger={`Assumir Tarefa`}
                      variant={`ghost`}
                      icon={`CheckCheck`}

                      action={() => {
                        onClaimTask(rowData.taskId);
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
