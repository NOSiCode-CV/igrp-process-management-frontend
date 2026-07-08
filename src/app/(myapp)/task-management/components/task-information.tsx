import {
  IGRPBadge,
  IGRPColorVariants,
  IGRPCopyTo,
  IGRPIcon,
  IGRPLabel,
  IGRPLink,
  IGRPSeparator,
} from "@igrp/igrp-framework-react-design-system";
import { Task } from "@igrp/platform-process-management-types";
import { format } from "date-fns";

interface TaskInformationProps extends Task {
  description?: string;
  followUpDate?: Date;
  priorityLabel?: string;
  priorityVariant?: IGRPColorVariants;
}

export function TaskInformation({
  task,
}: {
  task: TaskInformationProps | null;
}) {
  if (!task) return null;

  const candidateGroups = task?.candidateGroups
    ? task?.candidateGroups.split(",")
    : [];

  const assignedBy = task.userProfileAssignedBy?.fullName || task.assignedBy;

  return (
    <div className="space-y-4">
      {task && (
        <>
          {task.description && (
            <>
              <div>
                <IGRPLabel
                  label="Descrição"
                  className="text-muted-foreground"
                />
                <p className="text-sm mt-1">{task.description}</p>
              </div>
              <IGRPSeparator />
            </>
          )}

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Responsável</span>
                <span className="text-sm font-medium">
                  {assignedBy || "Não atribuído"}
                </span>
              </div>

              {task.priorityVariant && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Prioridade
                  </span>
                  <IGRPBadge
                    color={task.priorityVariant || "primary"}
                    variant="outline"
                  >
                    {task.priorityLabel}
                  </IGRPBadge>
                </div>
              )}

              {candidateGroups && candidateGroups.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">
                    Grupos Candidatos
                  </span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {candidateGroups.map((group) => (
                      <IGRPBadge
                        key={group}
                        variant="outline"
                        className="text-xs"
                      >
                        {group}
                      </IGRPBadge>
                    ))}
                  </div>
                </div>
              )}

              {task.formKey && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Formulário</span>
                  <span className="text-sm font-mono">{task.formKey}</span>
                </div>
              )}
            </div>

            {/* Right column - Dates */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <IGRPIcon
                  iconName="Clock"
                  className="h-4 w-4 text-muted-foreground"
                />
                <div className="flex-1 flex justify-between">
                  <span className="text-sm text-muted-foreground">Criado</span>
                  <span className="text-sm">
                    {task.startedAt
                      ? format(task.startedAt, "MMM d, yyyy HH:mm")
                      : "N/A"}
                  </span>
                </div>
              </div>

              {task.assignedAt && (
                <div className="flex items-center gap-3">
                  <IGRPIcon
                    iconName="Users"
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Assumida
                    </span>
                    <span className="text-sm">
                      {format(task.assignedAt, "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-3">
                  <IGRPIcon
                    iconName="Calendar"
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Prazo
                    </span>
                    <span className="text-sm flex items-center gap-2">
                      {format(task.dueDate, "MMM d, yyyy HH:mm")}
                      {new Date() > new Date(task.dueDate) && (
                        <IGRPIcon
                          iconName="AlertTriangle"
                          className="h-4 w-4 text-destructive"
                        />
                      )}
                    </span>
                  </div>
                </div>
              )}

              {task.followUpDate && (
                <div className="flex items-center gap-3">
                  <IGRPIcon
                    iconName="Flag"
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Acompanhamento
                    </span>
                    <span className="text-sm">
                      {format(task.followUpDate, "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <IGRPSeparator />
          <div>
            <IGRPLabel
              label="Instância do Processo"
              className="text-muted-foreground"
            />
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{task.processName}</div>
                <div className="flex items-center gap-2 mt-1 text-xs font-mono text-muted-foreground hover:text-foreground">
                  {task.processNumber && <span>{task.processNumber}</span>}
                  <IGRPCopyTo value={task.processNumber} />
                </div>
              </div>
              <IGRPLink
                href={`/process-instances/${task.processInstanceId}`}
                className="bg-transparent border rounded-sm p-1  px-3 hover:bg-muted text-foreground"
              >
                <span className="text-sm">Ver Processo</span>
              </IGRPLink>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
