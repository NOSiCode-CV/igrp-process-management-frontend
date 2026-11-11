'use client';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { ProcessCancelAction } from '@/app/(myapp)/process-instances/components/process-cancel-action';
import { StatCard } from '@/app/(myapp)/components/stat-card';
import { ActivityTimeline } from '@/app/(myapp)/components/activity-timeline';
import { TaskHistory } from '@/app/(myapp)/components/task-history';
import { VariablesView } from '@/app/(myapp)/components/variables-view';
import {
  IGRPPageHeader,
  IGRPBadge,
  IGRPTabs,
  IGRPTabItem,
  IGRPCard,
  IGRPCardContent,
  IGRPHeadline,
  Skeleton,
} from '@igrp/igrp-framework-react-design-system';
import { useProcessDetails } from '@/app/(myapp)/process-instances/hooks/use-process-details';
import { format, formatDistanceToNow } from 'date-fns';

export default function PageViewComponent({
  params,
}: {
  params: Promise<{ processInstanceId: string }>;
}) {
  const { processInstanceId } = use(params);

  const { igrpToast } = useIGRPToast();

  const { process, activityProgress, taskHistory, variables, isLoading } =
    useProcessDetails(processInstanceId);

  // Data is fetched client-side, so render a skeleton that mirrors the final
  // layout while it loads — otherwise the page shows an empty shell ("Process
  // Details", blank stats, "undefined eventos") with no sense of progress.
  if (isLoading) {
    return (
      <div
        className={cn('page', 'space-y-6')}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">A carregar detalhes do processo…</span>
        <div className={cn('section', ' space-y-6')}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className={cn('grid', 'md:grid-cols-2 ', 'lg:grid-cols-4 ', ' gap-4')}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-28" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('page', 'space-y-6')}>
      <div className={cn('section', ' space-y-6')}>
        <IGRPPageHeader
          id={`pageHeader1`}
          iconBackButton={`ArrowLeft`}
          showBackButton={true}
          urlBackButton={`/process-instances`}
          variant={`h3`}
          description={process?.number}
          title={process?.name || 'Process Details'}
        >
          <div className="flex items-center gap-2">
            <IGRPBadge
              id={`badge1`}
              variant={`outline`}
              size={`md`}
              showIcon={true}
              iconName={`CircleCheck`}
              iconPlacement={`start`}

              color={process?.color || 'secondary'}
            >
              {process?.statusDesc}
            </IGRPBadge>

            <ProcessCancelAction
              processInstanceId={processInstanceId}
              status={process?.status}
            ></ProcessCancelAction>
          </div>
        </IGRPPageHeader>

        <div className={cn('grid', 'md:grid-cols-2 ', 'lg:grid-cols-4 ', ' gap-4')}>
          <StatCard
            icon={`GitBranch`}
            label={`Business Key`}
            value={process?.businessKey}
          ></StatCard>
          <StatCard icon={`User`} label={`Iniciado Por`} value={process?.startedBy}></StatCard>
          <StatCard
            icon={`Calendar`}
            label={`Iniciado em`}
            value={process?.startedAt ? format(process?.startedAt, 'MMM d, yyyy HH:mm') : undefined}
            subvalue={
              process?.startedAt
                ? formatDistanceToNow(process?.startedAt, { addSuffix: true })
                : undefined
            }
          ></StatCard>
          <StatCard
            icon={`Clock`}
            label={`Duração`}
            subvalue={process?.endedAt ? format(process.endedAt, 'MMM d, yyyy HH:mm') : undefined}
            value={process?.duration}
          ></StatCard>
        </div>
        <IGRPTabs
          variant={`default`}
          tabContentClassName={`px-0`}
          iconPlacement={`start`}
          badgePlacement={`end`}
          orientation={`horizontal`}

          items={[
            {
              value: `tabsItem1-DkyH`,
              label: `Linha do Tempo de Eventos`,
              icon: `ArrowRight`,
              badgeVariant: `solid` as const,
              badgeColor: `primary` as const,
              content: (
                <>
                  <IGRPCard id={`card1`}>
                    <IGRPCardContent>
                      <IGRPHeadline
                        id={`headline2`}
                        title={`Ocorrência dos Eventos`}
                        variant={`h6`}
                        roleColor={`solid`}
                        color={`primary`}
                        showIcon={false}

                        description={activityProgress?.length + ' eventos registadas'}
                      ></IGRPHeadline>

                      <ActivityTimeline activities={activityProgress}></ActivityTimeline>
                    </IGRPCardContent>
                  </IGRPCard>
                </>
              ),
            },

            {
              value: `tabsItem2-s81g`,
              label: `Histórico de Tarefas`,
              icon: `ArrowRight`,
              badgeVariant: `solid` as const,
              badgeColor: `primary` as const,
              content: (
                <>
                  <IGRPCard id={`card2`}>
                    <IGRPCardContent>
                      <IGRPHeadline
                        id={`headline1`}
                        title={`Histórico de Tarefas`}
                        variant={`h6`}
                        roleColor={`solid`}
                        color={`primary`}
                        showIcon={false}

                        description={taskHistory.length + ' tarefas concluídas'}
                      ></IGRPHeadline>

                      <TaskHistory tasks={taskHistory}></TaskHistory>
                    </IGRPCardContent>
                  </IGRPCard>
                </>
              ),
            },

            {
              value: `tabsItem3-GmnQ`,
              label: `Variáveis`,
              icon: `ArrowRight`,
              badgeVariant: `solid` as const,
              badgeColor: `primary` as const,
              content: (
                <>
                  <IGRPCard id={`card3`}>
                    <IGRPCardContent>
                      <IGRPHeadline
                        id={`headline3`}
                        title={`Variáveis do Processo`}
                        variant={`h6`}
                        roleColor={`solid`}
                        color={`primary`}
                        showIcon={false}

                        description={variables.length + ' variáveis encontradas'}
                      ></IGRPHeadline>

                      <VariablesView variables={variables}></VariablesView>
                    </IGRPCardContent>
                  </IGRPCard>
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
