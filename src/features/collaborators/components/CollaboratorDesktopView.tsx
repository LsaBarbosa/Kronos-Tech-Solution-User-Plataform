import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { CollaboratorHero } from "./CollaboratorHero";
import { CollaboratorFiltersBar } from "./CollaboratorFiltersBar";
import { CollaboratorTable } from "./CollaboratorTable";
import { CollaboratorDetailPanel } from "./CollaboratorDetailPanel";
import { CollaboratorSensitiveConfirmDialog } from "./CollaboratorSensitiveConfirmDialog";
import ManagerBiometricEnrollmentModal from "@/components/ManagerBiometricEnrollmentModal";
import type { useCollaboratorsCommandCenter } from "../hooks/useCollaboratorsCommandCenter";

type CollaboratorDesktopViewProps = {
  viewModel: ReturnType<typeof useCollaboratorsCommandCenter>;
  onCreateCollaborator: () => void;
  onGoHome: () => void;
};

const LoadingState = ({ onCreateCollaborator, onRefresh }: { onCreateCollaborator: () => void; onRefresh: () => void }) => (
  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,380px)]">
    <div className="min-w-0 space-y-6">
      <Card className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-12 w-full rounded-[18px]" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-[18px]" />
          ))}
        </CardContent>
      </Card>
    </div>
    <Card className="min-w-0 rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <CardContent className="flex min-h-[520px] items-center justify-center p-6">
        <div className="space-y-3 text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[#2563EB]" />
          <div className="text-lg font-semibold text-[#0F172A]">Carregando central de pessoas</div>
          <p className="max-w-sm text-sm text-[#64748B]">Estamos consolidando colaboradores e contas para exibir a mesa de controle.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button type="button" onClick={onRefresh} variant="outline" className="rounded-full border-[#CBD5E1]">
              Recarregar
            </Button>
            <Button type="button" onClick={onCreateCollaborator} className="rounded-full bg-[#2563EB] hover:bg-[#1E3A8A]">
              Novo colaborador
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const EmptyState = ({ title, description, onClearFilters, onCreateCollaborator }: { title: string; description: string; onClearFilters: () => void; onCreateCollaborator: () => void; }) => (
  <Card className="rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
    <CardContent className="flex min-h-[420px] items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FB] text-[#2563EB]">
          <Search className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold text-[#0F172A]">{title}</h3>
          <p className="text-sm text-[#64748B]">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={onClearFilters} variant="outline" className="rounded-full border-[#CBD5E1]">
            Limpar filtros
          </Button>
          <Button type="button" onClick={onCreateCollaborator} className="rounded-full bg-[#2563EB] hover:bg-[#1E3A8A]">
            Novo colaborador
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ErrorState = ({ onRefresh }: { onRefresh: () => void }) => (
  <Card className="rounded-[28px] border border-[#FCA5A5] bg-[#FFF1F2] shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
    <CardContent className="flex min-h-[360px] items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-4">
        <AlertTriangle className="mx-auto h-10 w-10 text-[#DC2626]" />
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-[#0F172A]">Falha ao carregar colaboradores</h3>
          <p className="text-sm text-[#64748B]">Tente novamente. Se o problema persistir, valide os contratos de employees e users.</p>
        </div>
        <Button type="button" onClick={onRefresh} className="rounded-full bg-[#2563EB] hover:bg-[#1E3A8A]">
          Recarregar
        </Button>
      </div>
    </CardContent>
  </Card>
);

export const CollaboratorDesktopView = ({
  viewModel,
  onCreateCollaborator,
  onGoHome,
}: CollaboratorDesktopViewProps) => {
  const {
    sidebarOpen,
    handleToggleSidebar,
    isLoading,
    isError,
    records,
    filteredCollaborators,
    summary,
    filters,
    hasActiveFilters,
    selectedCollaborator,
    editingCollaboratorId,
    editingCollaborator,
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
    requestCreateAccess,
    refresh,
  } = viewModel;

  const showNoResults = !isLoading && filteredCollaborators.length === 0 && records.length > 0;
  const showNoData = !isLoading && records.length === 0 && !isError;

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="relative z-10 overflow-x-hidden px-4 pb-10 pt-24 lg:px-6"
    >
      <div className="mx-auto flex min-w-0 max-w-[1600px] flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.dashboard}>Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.listaColaboradores}>Pessoas</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Lista de colaboradores</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <CollaboratorHero
          variant="desktop"
          summary={summary}
          hasActiveFilters={hasActiveFilters}
          onCreateCollaborator={onCreateCollaborator}
          onClearFilters={clearFilters}
          onGoHome={onGoHome}
        />

        {isLoading && records.length === 0 ? (
          <LoadingState onCreateCollaborator={onCreateCollaborator} onRefresh={refresh} />
        ) : isError && records.length === 0 ? (
          <ErrorState onRefresh={refresh} />
        ) : showNoData ? (
          <EmptyState
            title="Nenhum colaborador cadastrado"
            description="Ainda não há pessoas registradas para esse tenant."
            onClearFilters={clearFilters}
            onCreateCollaborator={onCreateCollaborator}
          />
        ) : showNoResults ? (
          <EmptyState
            title="Nenhum colaborador encontrado"
            description="Aplique outros filtros ou limpe a busca para voltar ao quadro completo."
            onClearFilters={clearFilters}
            onCreateCollaborator={onCreateCollaborator}
          />
        ) : (
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,380px)]">
            <div className="min-w-0 space-y-6">
              <CollaboratorFiltersBar
                variant="desktop"
                filters={filters}
                onSearchChange={setSearch}
                onStatusChange={setStatusFilter}
                onGroupChange={setGroupFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />

              <CollaboratorTable
                records={filteredCollaborators}
                selectedId={selectedCollaborator?.employeeId ?? null}
                onSelect={selectCollaborator}
                onEdit={startEditing}
                onRequestToggle={requestToggle}
                onOpenBiometric={openBiometricEnrollment}
              />
            </div>

            <div className="min-w-0">
            <CollaboratorDetailPanel
              record={selectedCollaborator}
              isEditing={editingCollaboratorId === selectedCollaborator?.employeeId}
              draft={draft}
              isSaving={isSaving}
              onStartEditing={() => {
                if (selectedCollaborator) {
                  startEditing(selectedCollaborator);
                }
              }}
              onCancelEditing={cancelEditing}
              onSaveEditing={async () => {
                await saveEditing();
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
              onCreateAccess={() => {
                if (selectedCollaborator) {
                  requestCreateAccess(selectedCollaborator);
                }
              }}
            />
            </div>
          </div>
        )}
      </div>

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
    </PageShell>
  );
};

export default CollaboratorDesktopView;
