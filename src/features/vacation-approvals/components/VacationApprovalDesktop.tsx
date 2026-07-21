import { Card } from "@/components/ui/card";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import type { VacationApprovalsViewModel } from "../hooks/useVacationApprovalViewModel";
import VacationApprovalHero from "./VacationApprovalHero";
import VacationApprovalFilters from "./VacationApprovalFilters";
import VacationApprovalQueue from "./VacationApprovalQueue";
import VacationApprovalDetailPanel from "./VacationApprovalDetailPanel";

interface VacationApprovalDesktopProps {
  viewModel: VacationApprovalsViewModel;
  onBack: () => void;
}

const VacationApprovalDesktop = ({ viewModel, onBack }: VacationApprovalDesktopProps) => {
  const {
    metrics,
    draftEmployeeName,
    setDraftEmployeeName,
    statusFilter,
    applyStatusFilter,
    search,
    clearFilters,
    isLoading,
    isMutating,
    isError,
    errorMessage,
    refetch,
    requests,
    selectedRequest,
    selectRequest,
    appliedEmployeeName,
    totalPages,
    totalElements,
    currentPage,
    setCurrentPage,
    openDecision,
  } = viewModel;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <VacationApprovalHero
        variant="desktop"
        pending={metrics.pending}
        approved={metrics.approved}
        rejected={metrics.rejected}
        totalDays={metrics.totalDays}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <Card className="border-border/70 shadow-sm">
          <div className="space-y-4 border-b border-border/60 bg-[#F8FAFC] px-5 py-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Fila de solicitações
              </p>
              <h2 className="text-lg font-semibold text-[#0F172A]">
                Triagem por colaborador e status
              </h2>
            </div>
            <VacationApprovalFilters
              variant="desktop"
              draftEmployeeName={draftEmployeeName}
              onDraftEmployeeNameChange={setDraftEmployeeName}
              statusFilter={statusFilter}
              onStatusFilterChange={applyStatusFilter}
              onSearch={search}
              onClear={clearFilters}
              isBusy={isLoading || isMutating}
            />
          </div>

          <div className="space-y-4 px-5 py-5">
            <VacationApprovalQueue
              variant="desktop"
              requests={requests}
              selectedKey={selectedRequest?.key ?? null}
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
              searchTerm={appliedEmployeeName}
              onSelect={selectRequest}
              onRetry={refetch}
            />

            {totalPages > 1 ? (
              <div className="rounded-xl border border-border/60 bg-white px-3 py-3 shadow-sm">
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : null}
          </div>
        </Card>

        <VacationApprovalDetailPanel
          variant="desktop"
          request={selectedRequest}
          onDecision={openDecision}
          isBusy={isMutating}
        />
      </div>
    </div>
  );
};

export default VacationApprovalDesktop;
