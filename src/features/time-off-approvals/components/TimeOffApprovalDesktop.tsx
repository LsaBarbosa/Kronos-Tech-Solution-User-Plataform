import { Card } from "@/components/ui/card";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import type { TimeOffApprovalsViewModel } from "../hooks/useTimeOffApprovalViewModel";
import TimeOffApprovalHero from "./TimeOffApprovalHero";
import TimeOffApprovalFilters from "./TimeOffApprovalFilters";
import TimeOffApprovalQueue from "./TimeOffApprovalQueue";
import TimeOffApprovalDetailPanel from "./TimeOffApprovalDetailPanel";

interface TimeOffApprovalDesktopProps {
  viewModel: TimeOffApprovalsViewModel;
  onBack: () => void;
}

const TimeOffApprovalDesktop = ({ viewModel, onBack }: TimeOffApprovalDesktopProps) => {
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
    requests,
    selectedRequest,
    selectRequest,
    totalPages,
    totalElements,
    currentPage,
    setCurrentPage,
    openDecision,
    handleDownload,
  } = viewModel;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <TimeOffApprovalHero
        variant="desktop"
        pending={metrics.pending}
        approved={metrics.approved}
        rejected={metrics.rejected}
        withEvidence={metrics.withEvidence}
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
            <TimeOffApprovalFilters
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
            <TimeOffApprovalQueue
              variant="desktop"
              requests={requests}
              selectedKey={selectedRequest?.record.timeRecordId ?? null}
              isLoading={isLoading}
              onSelect={selectRequest}
              onDownload={handleDownload}
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

        <TimeOffApprovalDetailPanel
          variant="desktop"
          request={selectedRequest}
          onDecision={openDecision}
          onDownload={handleDownload}
          isBusy={isMutating}
        />
      </div>
    </div>
  );
};

export default TimeOffApprovalDesktop;
