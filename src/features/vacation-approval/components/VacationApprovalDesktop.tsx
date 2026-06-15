import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { getInitials } from "../utils/vacation-approval-formatters";
import { VacationApprovalDetailPanel } from "./VacationApprovalDetailPanel";
import { VacationApprovalFilters } from "./VacationApprovalFilters";
import { VacationApprovalHero } from "./VacationApprovalHero";
import { VacationApprovalInboxTable } from "./VacationApprovalInboxTable";
import { VacationApprovalRail } from "./VacationApprovalRail";
import type { VacationApprovalDeskViewModel } from "../hooks/useVacationApprovalDeskViewModel";
import type { VacationApprovalViewModel, VacationDecisionAction } from "../types";

interface VacationApprovalDesktopProps {
  sessionName: string;
  sessionRole: string;
  viewModel: VacationApprovalDeskViewModel;
  onOpenDecision: (action: VacationDecisionAction, request: VacationApprovalViewModel) => void;
}

export const VacationApprovalDesktop = ({
  sessionName,
  sessionRole,
  viewModel,
  onOpenDecision,
}: VacationApprovalDesktopProps) => {
  const isBusy = viewModel.isMutating;
  const {
    draftEmployeeName,
    setDraftEmployeeName,
    statusFilter,
    applyStatusFilter,
    search,
    clearFilters,
    isLoading,
    isError,
    errorMessage,
    refetch,
    requests,
    selectedRequest,
    selectRequest,
    totalPages,
    totalElements,
    currentPage,
    metrics,
  } = viewModel;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            <span className="font-semibold text-slate-900">Kronos</span>
            <span className="mx-2 text-slate-400">/</span>
            Jornada / Aprovação de férias
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Mesa de aprovação gerencial
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            Decisão gerencial
          </Badge>
          <div className="flex items-center gap-3 rounded-full border border-border bg-white px-3 py-2 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {getInitials(sessionName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{sessionName}</p>
              <p className="truncate text-xs uppercase tracking-[0.18em] text-slate-500">{sessionRole}</p>
            </div>
          </div>
        </div>
      </div>

      <section id="summary" className="space-y-6">
        <VacationApprovalHero
          variant="desktop"
          label="Fila de aprovação"
          title="Aprovação de férias com contexto operacional"
          subtitle="Analise solicitações por status, período e impacto na equipe antes de aprovar ou rejeitar em lote."
          metrics={metrics}
        />
      </section>

      <div className="grid items-start gap-10 xl:gap-12 lg:grid-cols-[88px_minmax(0,1fr)]">
        <VacationApprovalRail />

        <div className="min-w-0 space-y-6">
          <div className="mx-auto w-full max-w-6xl">
            <VacationApprovalFilters
              variant="desktop"
              draftEmployeeName={draftEmployeeName}
              statusFilter={statusFilter}
              onDraftEmployeeNameChange={setDraftEmployeeName}
              onStatusFilterChange={applyStatusFilter}
              onSearch={search}
              onClear={clearFilters}
              isBusy={isBusy}
            />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
            <div className="space-y-6">
              {isLoading ? (
                <Card className="border border-border bg-card shadow-sm">
                  <LoadingState
                    title="Carregando fila de aprovação..."
                    description="Buscando solicitações, métricas e impacto do lote."
                    className="py-16"
                  />
                </Card>
              ) : isError ? (
                <ErrorState
                  description={errorMessage}
                  action={
                    <Button type="button" variant="outline" onClick={refetch}>
                      Tentar novamente
                    </Button>
                  }
                  className="rounded-3xl border border-border bg-card px-6 py-10 shadow-sm"
                />
              ) : requests.length === 0 ? (
                <Card className="border border-border bg-card shadow-sm">
                  <EmptyState
                    title="Nenhuma solicitação encontrada."
                    description="Ajuste o colaborador ou o status para localizar férias aguardando decisão."
                    className="py-16"
                  />
                </Card>
              ) : (
                <VacationApprovalInboxTable
                  requests={requests}
                  selectedKey={selectedRequest?.key ?? null}
                  onSelect={selectRequest}
                  onApprove={(request) => onOpenDecision("approve", request)}
                  onReject={(request) => onOpenDecision("reject", request)}
                  isBusy={isBusy}
                />
              )}

              {totalPages > 1 && (
                <Card className="border border-border bg-card px-4 py-4 shadow-sm">
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPageChange={viewModel.setCurrentPage}
                  />
                </Card>
              )}
            </div>

            <VacationApprovalDetailPanel
              request={selectedRequest}
              onApprove={(request) => onOpenDecision("approve", request)}
              onReject={(request) => onOpenDecision("reject", request)}
              isBusy={isBusy}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
