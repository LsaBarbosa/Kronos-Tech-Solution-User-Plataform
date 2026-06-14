import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CollaboratorHero } from "./CollaboratorHero";
import { CollaboratorFiltersBar } from "./CollaboratorFiltersBar";
import { CollaboratorMobileCard } from "./CollaboratorMobileCard";
import { CollaboratorDetailPanel } from "./CollaboratorDetailPanel";
import { CollaboratorSensitiveConfirmDialog } from "./CollaboratorSensitiveConfirmDialog";
import { RefreshCw, Search, UserPlus } from "lucide-react";
import ManagerBiometricEnrollmentModal from "@/components/ManagerBiometricEnrollmentModal";
import type { useCollaboratorsCommandCenter } from "../hooks/useCollaboratorsCommandCenter";
import type { CollaboratorRecord } from "../types/collaborator-view.types";

type CollaboratorMobileViewProps = {
  viewModel: ReturnType<typeof useCollaboratorsCommandCenter>;
  onCreateCollaborator: () => void;
  onGoHome: () => void;
};

export const CollaboratorMobileView = ({
  viewModel,
  onCreateCollaborator,
  onGoHome,
}: CollaboratorMobileViewProps) => {
  const {
    isLoading,
    isError,
    records,
    filteredCollaborators,
    summary,
    filters,
    hasActiveFilters,
    selectedCollaborator,
    editingCollaboratorId,
    draft,
    isSaving,
    mutationTarget,
    biometricTarget,
    setSearch,
    setStatusFilter,
    setGroupFilter,
    clearFilters,
    selectCollaborator,
    startEditing,
    cancelEditing,
    updateDraftField,
    saveEditing,
    requestToggle,
    clearToggleTarget,
    confirmToggle,
    openBiometricEnrollment,
    closeBiometricEnrollment,
    refresh,
  } = viewModel;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"detail" | "edit">("detail");

  const openDetailSheet = (record: CollaboratorRecord) => {
    selectCollaborator(record.employeeId);
    setSheetMode("detail");
    setSheetOpen(true);
  };

  const openEditSheet = (record: CollaboratorRecord) => {
    startEditing(record);
    selectCollaborator(record.employeeId);
    setSheetMode("edit");
    setSheetOpen(true);
  };

  const showNoResults = !isLoading && filteredCollaborators.length === 0 && records.length > 0;
  const showNoData = !isLoading && records.length === 0 && !isError;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <CollaboratorHero
        variant="mobile"
        summary={summary}
        hasActiveFilters={hasActiveFilters}
        onCreateCollaborator={onCreateCollaborator}
        onClearFilters={clearFilters}
        onGoHome={onGoHome}
      />

      <div className="space-y-4 px-4 pt-4">
        {isLoading && records.length === 0 ? (
          <div className="space-y-3">
            <Card className="rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-12 w-full rounded-[18px]" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-20 rounded-[18px]" />
                  <Skeleton className="h-20 rounded-[18px]" />
                </div>
                <Skeleton className="h-24 w-full rounded-[18px]" />
              </CardContent>
            </Card>
            <Card className="rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <CardContent className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 w-full rounded-[18px]" />
                ))}
              </CardContent>
            </Card>
          </div>
        ) : isError && records.length === 0 ? (
          <Card className="rounded-[24px] border border-[#FCA5A5] bg-[#FFF1F2]">
            <CardContent className="space-y-4 p-5 text-center">
              <RefreshCw className="mx-auto h-10 w-10 text-[#DC2626]" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-[#0F172A]">Falha ao carregar a central</h3>
                <p className="text-sm text-[#64748B]">Recarregue a tela para tentar novamente.</p>
              </div>
              <Button type="button" onClick={refresh} className="h-11 w-full rounded-full bg-[#2563EB] hover:bg-[#1E3A8A]">
                Recarregar
              </Button>
            </CardContent>
          </Card>
        ) : showNoData ? (
          <Card className="rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-4 p-5 text-center">
              <UserPlus className="mx-auto h-10 w-10 text-[#2563EB]" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-[#0F172A]">Nenhum colaborador cadastrado</h3>
                <p className="text-sm text-[#64748B]">Cadastre a primeira pessoa para iniciar a central operacional.</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" onClick={onCreateCollaborator} className="h-11 flex-1 rounded-full bg-[#2563EB] hover:bg-[#1E3A8A]">
                  Novo colaborador
                </Button>
                <Button type="button" onClick={refresh} variant="outline" className="h-11 flex-1 rounded-full border-[#CBD5E1]">
                  Recarregar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <CollaboratorFiltersBar
              variant="mobile"
              filters={filters}
              onSearchChange={setSearch}
              onStatusChange={setStatusFilter}
              onGroupChange={setGroupFilter}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {showNoResults ? (
              <Card className="rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <CardContent className="space-y-4 p-5 text-center">
                  <Search className="mx-auto h-10 w-10 text-[#2563EB]" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[#0F172A]">Sem resultado para os filtros</h3>
                    <p className="text-sm text-[#64748B]">Limpe os filtros para voltar à lista operacional.</p>
                  </div>
                  <Button type="button" onClick={clearFilters} className="h-11 w-full rounded-full bg-[#2563EB] hover:bg-[#1E3A8A]">
                    Limpar filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredCollaborators.map((record) => (
                  <CollaboratorMobileCard
                    key={record.employeeId}
                    record={record}
                    selected={selectedCollaborator?.employeeId === record.employeeId}
                    onSelect={selectCollaborator}
                    onOpenDetails={openDetailSheet}
                    onEdit={openEditSheet}
                    onRequestToggle={requestToggle}
                    onOpenBiometric={openBiometricEnrollment}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Button
            type="button"
            onClick={onCreateCollaborator}
            className="h-11 flex-1 rounded-full bg-[#2563EB] hover:bg-[#1E3A8A]"
          >
            Novo colaborador
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="h-11 flex-1 rounded-full border-[#CBD5E1]"
          >
            Limpar filtros
          </Button>
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            cancelEditing();
            setSheetMode("detail");
          }
        }}
      >
        <SheetContent side="bottom" className="h-[92vh] rounded-t-[28px] border-[#E2E8F0] bg-white p-0">
          <SheetHeader className="border-b border-[#E2E8F0] px-4 py-4 text-left">
            <SheetTitle className="text-[#0F172A]">
              {sheetMode === "edit" ? "Editar cadastro" : "Detalhes do colaborador"}
            </SheetTitle>
            <SheetDescription className="text-[#64748B]">
              {selectedCollaborator?.fullName ?? "Selecione um colaborador"}
            </SheetDescription>
          </SheetHeader>

          <div className="h-[calc(92vh-5.5rem)] overflow-y-auto px-4 py-4">
            <CollaboratorDetailPanel
              record={selectedCollaborator}
              isEditing={sheetMode === "edit" && editingCollaboratorId === selectedCollaborator?.employeeId}
              draft={draft}
              isSaving={isSaving}
              onStartEditing={() => {
                if (selectedCollaborator) {
                  startEditing(selectedCollaborator);
                  setSheetMode("edit");
                }
              }}
              onCancelEditing={() => {
                cancelEditing();
                setSheetMode("detail");
              }}
              onSaveEditing={async () => {
                const saved = await saveEditing();
                if (saved) {
                  setSheetOpen(false);
                  setSheetMode("detail");
                }
              }}
              onChangeDraft={updateDraftField}
              onRequestToggle={() => {
                if (selectedCollaborator) {
                  requestToggle(selectedCollaborator);
                }
              }}
              onOpenBiometric={() => {
                if (selectedCollaborator) {
                  openBiometricEnrollment(selectedCollaborator);
                }
              }}
              compact
            />
          </div>
        </SheetContent>
      </Sheet>

      <CollaboratorSensitiveConfirmDialog
        open={!!mutationTarget}
        target={mutationTarget}
        isLoading={isSaving}
        onOpenChange={(open) => {
          if (!open) {
            clearToggleTarget();
          }
        }}
        onConfirm={async () => {
          const ok = await confirmToggle();
          if (ok) {
            clearToggleTarget();
          }
        }}
      />

      <ManagerBiometricEnrollmentModal
        open={!!biometricTarget}
        onOpenChange={(open) => {
          if (!open) {
            closeBiometricEnrollment();
          }
        }}
        employeeId={biometricTarget?.employeeId ?? ""}
        employeeName={biometricTarget?.fullName ?? ""}
        onSuccess={() => {
          closeBiometricEnrollment();
          void refresh();
        }}
      />
    </div>
  );
};

export default CollaboratorMobileView;
