'use client';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { TaskInformation } from '@/app/(myapp)/task-management/components/task-information';
import { Empty } from '@/app/(myapp)/components/empty';
import { VariablesView } from '@/app/(myapp)/components/variables-view';
import { TaskInstanceEventsView } from '@/app/(myapp)/components/task-instance-events-view';
import CommonUserTaskModalForm from '@/components/commonusertaskmodalform';
import {
  IGRPPageHeader,
  IGRPBadge,
  IGRPCard,
  IGRPCardHeader,
  IGRPHeadline,
  IGRPCardContent,
  IGRPButton,
} from '@igrp/igrp-framework-react-design-system';
import { useTaskDetails } from '@/app/(myapp)/task-management/hooks/use-task-details';

export default function PageDetalhedatarefaComponent({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);

  const [libertarTarefa, setLibertarTarefa] = useState<boolean>(false);

  const [delegateTask, setDelegateTask] = useState<boolean>(false);

  const { igrpToast } = useIGRPToast();

  const { task, onUnclaimTask, onDelegateTask } = useTaskDetails(taskId);

  const modalSubtitle = `Libertar a tarefa "${task?.name}" do processo "${task?.processName}"`;

  const modalSubtitleDelegate = `Indicar um utilizador ou grupo para assumir a tarefa "${task?.name}" do processo "${task?.processName}"`;

  return (
    <div className={cn('page', 'space-y-6')}>
      <div className={cn('section', ' space-y-6')}>
        <IGRPPageHeader
          id={`pageHeader1`}
          iconBackButton={`ArrowLeft`}
          showBackButton={true}
          urlBackButton={`/task-management`}
          variant={`h3`}
          title={task?.processName || 'Task name'}
          description={task?.name + ' - ' + task?.taskKey}
        >
          <div className="flex items-center gap-2">
            <IGRPBadge
              id={`badge1`}
              variant={`outline`}
              size={`md`}
              showIcon={true}
              iconName={`CircleCheck`}
              iconPlacement={`start`}

              color={(task?.color as any) || 'primary'}
            >
              {task?.statusDesc}
            </IGRPBadge>
          </div>
        </IGRPPageHeader>

        <div className={cn('grid', 'grid-cols-3 ', 'md:grid-cols-2 ', 'lg:grid-cols-3 ', ' gap-4')}>
          <div className={cn('col-span-2 flex flex-col gap-6 ')}>
            <IGRPCard id={`card2`}>
              <IGRPCardHeader>
                <IGRPHeadline
                  id={`headline2`}
                  title={`Informação da Tarefa`}
                  description={``}
                  variant={`h6`}
                  roleColor={`solid`}
                  color={`primary`}
                  showIcon={false}
                ></IGRPHeadline>
              </IGRPCardHeader>
              <IGRPCardContent>
                <TaskInformation task={task}></TaskInformation>
              </IGRPCardContent>
            </IGRPCard>
          </div>
          <div className={cn('col-span-1 flex flex-col gap-6 ')}>
            <IGRPCard id={`card3`}>
              <IGRPCardHeader>
                <IGRPHeadline
                  id={`headline3`}
                  title={`Ações da Tarefa`}
                  description={`Concluir, delegar ou gerir esta tarefa`}
                  variant={`h6`}
                  roleColor={`solid`}
                  color={`primary`}
                  showIcon={false}
                ></IGRPHeadline>
              </IGRPCardHeader>
              <IGRPCardContent>
                {task?.status != 'COMPLETED' && (
                  <div className={cn('grid', 'grid-cols-1 ', ' gap-4')}>
                    <IGRPButton
                      id={`button1`}
                      variant={`default`}
                      size={`default`}
                      showIcon={true}
                      iconName={`CircleCheckBig`}
                      className={cn('flex justify-start', 'col-span-1')}
                      onClick={() => {}}
                    >
                      Concluir Tarefa
                    </IGRPButton>

                    <IGRPButton
                      id={`button2`}
                      variant={`outline`}
                      size={`default`}
                      showIcon={true}
                      iconName={`UserPlus`}
                      className={cn('flex justify-start', 'col-span-1')}
                      onClick={() => {
                        setDelegateTask(!delegateTask);
                      }}
                    >
                      Delegar
                    </IGRPButton>

                    <IGRPButton
                      id={`button3`}
                      variant={`outline`}
                      size={`default`}
                      showIcon={true}
                      iconName={`Flag`}
                      className={cn('flex justify-start', 'col-span-1')}
                      onClick={() => {}}
                    >
                      Alterar Prioridade
                    </IGRPButton>

                    <IGRPButton
                      id={`button4`}
                      variant={`outline`}
                      size={`default`}
                      showIcon={true}
                      iconName={`RotateCcw`}
                      className={cn('flex justify-start', 'col-span-1')}
                      onClick={() => {
                        setLibertarTarefa(!libertarTarefa);
                      }}
                    >
                      Libertar
                    </IGRPButton>
                  </div>
                )}
                {task?.status === 'COMPLETED' && (
                  <Empty
                    title={`Nenhuma ação`}
                    description={`Nenhuma ação encontrada para esta tarefa`}
                  ></Empty>
                )}
              </IGRPCardContent>
            </IGRPCard>
          </div>
        </div>
        <IGRPCard id={`card1`}>
          <IGRPCardContent>
            <IGRPHeadline
              id={`headline1`}
              title={`Variáveis`}
              description={``}
              variant={`h6`}
              roleColor={`solid`}
              color={`primary`}
              showIcon={true}
              iconName={`FileText`}
            ></IGRPHeadline>

            <VariablesView variables={task?.variables || []}></VariablesView>
          </IGRPCardContent>
        </IGRPCard>

        <IGRPCard id={`card4`}>
          <IGRPCardContent>
            <IGRPHeadline
              id={`headline4`}
              title={`Eventos`}
              description={``}
              variant={`h6`}
              roleColor={`solid`}
              color={`primary`}
              showIcon={true}
              iconName={`TimerReset`}
            ></IGRPHeadline>

            <TaskInstanceEventsView
              events={task?.taskInstanceEvents || []}
            ></TaskInstanceEventsView>
          </IGRPCardContent>
        </IGRPCard>

        <CommonUserTaskModalForm
          modalTitle={`Libertar Tarefa`}
          open={libertarTarefa}
          modalSubTitle={modalSubtitle}
          setOpen={setLibertarTarefa}
          onSave={(formData) =>
            onUnclaimTask(formData.note, () => setLibertarTarefa(!libertarTarefa))
          }
        ></CommonUserTaskModalForm>
        <CommonUserTaskModalForm
          modalTitle={`Atribuir Tarefa`}
          userRequired={true}
          modalSubTitle={modalSubtitleDelegate}
          open={delegateTask}
          setOpen={setDelegateTask}
          onSave={(formData) => onDelegateTask(formData, () => setDelegateTask(!delegateTask))}
        ></CommonUserTaskModalForm>
      </div>
    </div>
  );
}
