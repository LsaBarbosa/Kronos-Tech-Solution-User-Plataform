import { Card, CardContent } from "@/components/ui/card";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import ApprovalHero from "./ApprovalHero";
import ApprovalMetrics from "./ApprovalMetrics";
import ApprovalSearch from "./ApprovalSearch";
import ApprovalState from "./ApprovalState";
import ApprovalDesktopList from "./ApprovalDesktopList";
import ApprovalDecisionPanel from "./ApprovalDecisionPanel";
import type { PendingApprovalsViewModel } from "../hooks/usePendingApprovalsViewModel";

interface ApprovalDesktopProps {
  viewModel: PendingApprovalsViewModel;
  onBack: () => void;
}

const ApprovalDesktop = ({ viewModel, onBack }: ApprovalDesktopProps) => {
  const {
    approvals,
    isLoading,
    isMutating,
    hasError,
    errorMessage,
    appliedEmployeeName,
    draftEmployeeName,
    hasActiveFilter,
    setDraftEmployeeName,
    search,
    clearSearch,
    pendingTotal,
    uniqueEmployees,
    pendingClosureCount,
    selectedRequest,
    selectRequest,
    currentPage,
    totalPages,
    totalElements,
    setCurrentPage,
    approve,
    reject,
  } = viewModel;

  const renderQueue = () => {
    if (isLoading && approvals.length === 0) {
      return <ApprovalState variant="loading" />;
    }
    if (hasError) {
      return <ApprovalState variant="error" errorMessage={errorMessage} />;
    }
    if (approvals.length === 0 && appliedEmployeeName) {
      return <ApprovalState variant="no-results" searchTerm={appliedEmployeeName} />;
    }
    if (approvals.length === 0) {
      return <ApprovalState variant="empty" />;
    }
    return (
      <>
        <ApprovalDesktopList
          approvals={approvals}
          selectedKey={selectedRequest?.timeRecordId ?? null}
          onSelect={selectRequest}
        />
        {totalPages > 1 ? (
          <Card className="border-border/70 shadow-sm">
            <CardContent className="px-3 py-3">
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        ) : null}
      </>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <ApprovalHero variant="desktop" pendingTotal={pendingTotal} />

      <ApprovalMetrics
        variant="desktop"
        pendingTotal={pendingTotal}
        uniqueEmployees={uniqueEmployees}
        pendingClosure={pendingClosureCount}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="px-5 py-5">
              <ApprovalSearch
                variant="desktop"
                draftValue={draftEmployeeName}
                appliedValue={appliedEmployeeName}
                hasActiveFilter={hasActiveFilter}
                isBusy={isMutating}
                onDraftChange={setDraftEmployeeName}
                onSubmit={search}
                onClear={clearSearch}
              />
            </CardContent>
          </Card>

          {renderQueue()}
        </div>

        <ApprovalDecisionPanel
          variant="desktop"
          request={selectedRequest}
          isMutating={isMutating}
          onApprove={approve}
          onReject={reject}
        />
      </div>
    </div>
  );
};

export default ApprovalDesktop;
