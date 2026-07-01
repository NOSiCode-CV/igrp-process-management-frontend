'use client';
/* THIS FILE WAS GENERATED AUTOMATICALLY BY iGRP STUDIO. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useRef } from 'react';
import { cn, useIGRPMenuNavigation, useIGRPToast } from '@igrp/igrp-framework-react-design-system';
import { ProcessTreeComponent } from '@/app/(myapp)/process-map/components/process-tree-node';
import PriorityModal from '@/components/prioritymodal';
import { LoadingPage } from '@/app/(myapp)/components/loading-page';
import { AreaTreeNodeComponent } from '@/app/(myapp)/process-map/components/area/area-tree-node';
import { AreaDetails } from '@/app/(myapp)/process-map/components/area/area-details';
import AreaModal from '@/app/(igrp)/(generated)/process-map/components/areamodal';
import {
  IGRPPageHeader,
  IGRPTabs,
  IGRPTabItem,
  IGRPHeadline,
  IGRPInputSearch,
  IGRPCard,
  IGRPCardHeader,
  IGRPButton,
  IGRPCardContent,
  IGRPCardFooter,
} from '@igrp/igrp-framework-react-design-system';
import { useRouter } from 'next/navigation';
import { useProcessMap } from '@/app/(myapp)/process-map/hooks/use-process-map';
import { ExtendedArea } from '@/app/(myapp)/process-map/types';

export default function PageProcessmapComponent() {
  const [openArea, setOpenArea] = useState<boolean>(false);

  const { igrpToast } = useIGRPToast();

  /*---------------------------------Reserved area begin------------------------------*/
  const router = useRouter();
  const pm = useProcessMap(router);
  /*---------------------------------Reserved area end------------------------------*/

  return (
    <div className={cn('page', 'space-y-6')}>
      <IGRPPageHeader
        id={`pageHeader1`}
        title={`Mapa de Processos`}
        description={` Navegue, gerencie e organize processos por áreas de negócio.`}
        iconBackButton={`Map`}
        showBackButton={true}
        variant={`h3`}
      >
        <div className="flex items-center gap-2"></div>
      </IGRPPageHeader>

      <IGRPTabs
        variant={`default`}
        tabContentClassName={`space-y-3`}
        showIcon={true}
        iconPlacement={`start`}
        contentBorder={true}
        badgePlacement={`end`}
        orientation={`horizontal`}
        items={[
          {
            value: `tabsItem2-vy8A`,
            label: `Ver Mapa`,
            icon: `Eye`,
            badgeVariant: `solid` as const,
            badgeColor: `primary` as const,
            content: (
              <>
                <IGRPHeadline
                  id={`headline1`}
                  title={`Mapa de Processo`}
                  description={`Navegue pelos processos organizados por áreas.`}
                  variant={`h6`}
                  roleColor={`solid`}
                  color={`primary`}
                  showIcon={true}
                  iconName={`Map`}
                ></IGRPHeadline>

                <IGRPInputSearch
                  id={`inputSearch1`}
                  label={undefined}
                  showStartIcon={true}
                  startIcon={`Search`}
                  submitIcon={`ArrowRight`}
                  required={false}
                  showSubmitButton={false}
                  placeholder={`Procurar por processos...`}
                  setValueChange={pm.setSearchTerm}
                  value={pm.searchTerm}
                ></IGRPInputSearch>

                {!pm.loading && (
                  <ProcessTreeComponent
                    nodes={pm.filteredNodes}
                    expandedNodes={pm.expandedNodes}
                    searchTerm={pm.searchTerm}
                    onStartProcess={pm.startProcess}
                    onToggle={pm.toggleNode}
                  ></ProcessTreeComponent>
                )}
                <PriorityModal
                  open={pm.priorityModal.isOpen}
                  modalTitle={pm.priorityModal.modalTitle}
                  modalSubTitle={pm.priorityModal.modalSubTitle}
                  prioritiesOptions={pm.prioritiesOptions}
                  loadingPriorities={pm.loadingPriorities}
                  setOpen={pm.priorityModal.setOpen}
                  onSave={pm.priorityModal.onSave}
                ></PriorityModal>
                <LoadingPage isLoading={pm.loading}></LoadingPage>
              </>
            ),
          },

          {
            value: `tabsItem1-IAqL`,
            label: `Gerir Área`,
            icon: `Settings`,
            badgeVariant: `solid` as const,
            badgeColor: `primary` as const,
            content: (
              <>
                <div className={cn('grid', 'lg:grid-cols-2 ', ' gap-4')}>
                  <div className={cn('col-span-1 flex flex-col gap-6 ')}>
                    <IGRPCard id={`card1`}>
                      <IGRPCardHeader>
                        <div
                          className={cn(
                            'flex',
                            'flex flex-row flex-nowrap items-center justify-between gap-2',
                          )}
                        >
                          <IGRPHeadline
                            id={`headline2`}
                            title={` Estrutura do Mapa de Processos`}
                            description={`Hierarquia de áreas e subáreas`}
                            variant={`h6`}
                            roleColor={`solid`}
                            color={`primary`}
                            showIcon={false}
                          ></IGRPHeadline>

                          <IGRPButton
                            id={`button1`}
                            variant={`default`}
                            size={`default`}
                            showIcon={true}
                            iconName={`Plus`}
                            onClick={(open) =>
                              open
                                ? pm.manageAreas.areaForm.openModal()
                                : pm.manageAreas.areaForm.closeModal()
                            }
                          >
                            Adicionar Àrea
                          </IGRPButton>
                        </div>
                      </IGRPCardHeader>
                      <IGRPCardContent className={cn('space-y-4', 'space-x-3', 'space-y-3')}>
                        <AreaTreeNodeComponent
                          nodes={pm.manageAreas.areas}
                          expandedNodes={pm.manageAreas.expandedNodes}
                          onToggle={pm.toggleNode}
                          onDelete={pm.manageAreas.handleDeleteArea}
                          onRemoveProcess={pm.manageAreas.handleRemoveProcess}
                          onEdit={(node, parentAreaId) => {
                            setOpenArea(true);
                            pm.manageAreas.areaForm.openModal(node as ExtendedArea, parentAreaId);
                          }}
                          onAddSubarea={(parentAreaId) =>
                            pm.manageAreas.areaForm.openModal(undefined, parentAreaId)
                          }
                        ></AreaTreeNodeComponent>
                      </IGRPCardContent>
                      <IGRPCardFooter></IGRPCardFooter>
                    </IGRPCard>
                  </div>
                  <div className={cn('col-span-1 flex flex-col gap-6 ')}>
                    <IGRPCard id={`card2`}>
                      <IGRPCardHeader>
                        <IGRPHeadline
                          id={`headline3`}
                          title={`Detalhes da área`}
                          description={`Visualizar processos e configurações atribuídos`}
                          variant={`h6`}
                          roleColor={`solid`}
                          color={`primary`}
                          showIcon={false}
                        ></IGRPHeadline>
                      </IGRPCardHeader>
                      <IGRPCardContent className={cn('space-y-4', 'space-x-3', 'space-y-3')}>
                        <AreaDetails
                          selectedArea={pm.manageAreas?.activeArea}
                          onEdit={(node, parentAreaId) => {
                            setOpenArea(true);
                            pm.manageAreas.areaForm.openModal(node as ExtendedArea, parentAreaId);
                          }}
                          onDelete={pm.manageAreas.handleDeleteArea}
                        ></AreaDetails>
                      </IGRPCardContent>
                    </IGRPCard>
                  </div>
                </div>
                <AreaModal
                  options={pm.manageAreas.options}
                  open={pm.manageAreas.areaForm.modalState.isOpen}
                  isEditing={!!pm.manageAreas.areaForm.modalState.editingArea}
                  formData={pm.manageAreas.areaForm.formData}
                  allProcesses={pm.allProcesses?.content}
                  setOpen={(open) =>
                    !pm.manageAreas.areaForm.modalState.isOpen
                      ? pm.manageAreas.areaForm.openModal()
                      : pm.manageAreas.areaForm.closeModal()
                  }
                  onClose={pm.manageAreas.areaForm.closeModal}
                  onSave={(data) =>
                    pm.manageAreas.areaForm.modalState.editingArea
                      ? pm.manageAreas.handleUpdateArea(
                          pm.manageAreas.areaForm.modalState.editingArea?.id,
                          data,
                        )
                      : pm.manageAreas.handleCreateArea(data)
                  }
                  onFormChange={pm.manageAreas.areaForm.setFormData}
                ></AreaModal>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
