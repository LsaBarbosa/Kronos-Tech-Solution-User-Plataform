import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { VacationApprovalFilters } from "./VacationApprovalFilters";
import { VacationApprovalHero } from "./VacationApprovalHero";
import { VacationApprovalMetrics } from "./VacationApprovalMetrics";
import { VacationApprovalRequestCard } from "./VacationApprovalRequestCard";
import { VacationApprovalStickyActionBar } from "./VacationApprovalStickyActionBar";
import type { VacationApprovalDeskViewModel } from "../hooks/useVacationApprovalDeskViewModel";
import type { VacationApprovalViewModel, VacationDecisionAction } from "../types";

interface VacationApprovalMobileProps {
  sessionRole: string;
  viewModel: VacationApprovalDeskViewModel;
  onOpenDecision: (action: VacationDecisionAction, request: VacationApprovalViewModel) => void;
}

export const VacationApprovalMobile = ({
  sessionRole,
  viewModel,
  onOpenDecision,
}: VacationApprovalMobileProps) => {
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
    <div className="space-y-5 pb-[calc(env(safe-area-inset-bottom)+10.5rem)]">
      <VacationApprovalHero
        variant="mobile"
        label={sessionRole}
        title="Aprovar férias"
        subtitle="Fila gerencial"
      />

      <VacationApprovalMetrics metrics={metrics} variant="mobile" />

      <VacationApprovalFilters
        variant="mobile"
        draftEmployeeName={draftEmployeeName}
        statusFilter={statusFilter}
        onDraftEmployeeNameChange={setDraftEmployeeName}
        onStatusFilterChange={applyStatusFilter}
        onSearch={search}
        onClear={clearFilters}
        isBusy={isBusy}
      />

      {isLoading ? (
        <Card className="border border-border bg-card shadow-sm">
          <LoadingState
            title="Carregando solicitações..."
            description="Buscando a fila gerencial de férias."
            className="py-16"
          />
        </Card>
      ) : isError ? (
        <ErrorState
          description={errorMessage}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={refetch}
            >
              Tentar novamente
            </Button>
          }
          className="rounded-3xl border border-border bg-card px-5 py-8 shadow-sm"
        />
      ) : requests.length === 0 ? (
        <Card className="border border-border bg-card shadow-sm">
          <EmptyState
            title="Nenhuma solicitação encontrada."
            description="Ajuste os filtros para exibir férias aguardando decisão."
            className="py-16"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <VacationApprovalRequestCard
              key={request.key}
              request={request}
              selected={selectedRequest?.key === request.key}
              onSelect={selectRequest}
            />
          ))}
        </div>
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

      <VacationApprovalStickyActionBar
        request={selectedRequest}
        onApprove={(request) => onOpenDecision("approve", request)}
        onReject={(request) => onOpenDecision("reject", request)}
        isBusy={isBusy}
      />
    </div>
  );
};
