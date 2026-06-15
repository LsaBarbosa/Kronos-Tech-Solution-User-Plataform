import { useEffect, useState } from "react";
import { Check, ChevronLeft, ExternalLink, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import { cn } from "@/lib/utils";
import ApprovalHero from "./ApprovalHero";
import ApprovalMetrics from "./ApprovalMetrics";
import ApprovalSearch from "./ApprovalSearch";
import ApprovalState from "./ApprovalState";
import ApprovalMobileCards from "./ApprovalMobileCards";
import ApprovalDecisionPanel from "./ApprovalDecisionPanel";
import { formatDateTime, getInitials } from "../utils/approval-formatters";
import type { PendingApprovalsViewModel } from "../hooks/usePendingApprovalsViewModel";

interface ApprovalMobileProps {
  viewModel: PendingApprovalsViewModel;
  onBack: () => void;
}

const ApprovalMobile = ({ viewModel, onBack }: ApprovalMobileProps) => {
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

  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!selectedRequest) {
      setDetailOpen(false);
    }
  }, [selectedRequest]);

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
        <ApprovalMobileCards
          approvals={approvals}
          selectedKey={selectedRequest?.timeRecordId ?? null}
          onSelect={(item) => {
            selectRequest(item);
            setDetailOpen(true);
          }}
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

  const handleApprove = () => {
    if (!selectedRequest) return;
    approve(selectedRequest.timeRecordId);
  };
  const handleReject = () => {
    if (!selectedRequest) return;
    reject(selectedRequest.timeRecordId);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-36">
      <div className="flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Início
        </Button>
      </div>

      <ApprovalHero variant="mobile" pendingTotal={pendingTotal} />

      <ApprovalMetrics
        variant="mobile"
        pendingTotal={pendingTotal}
        uniqueEmployees={uniqueEmployees}
        pendingClosure={pendingClosureCount}
      />

      <Card className="border-border/70 shadow-sm">
        <CardContent className="px-4 py-4">
          <ApprovalSearch
            variant="mobile"
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

      {selectedRequest ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setDetailOpen(true)}
          className="h-11 w-full gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir detalhe e comparativo
        </Button>
      ) : null}

      <Drawer open={detailOpen} onOpenChange={setDetailOpen}>
        <DrawerContent className="h-[92vh] overflow-hidden rounded-t-[24px] border-border/70 bg-background px-0">
          <div className="max-h-[calc(92vh-1rem)] overflow-y-auto px-4 pb-24 pt-2">
            <ApprovalDecisionPanel
              variant="mobile"
              request={selectedRequest}
              isMutating={isMutating}
              onApprove={(id) => {
                setDetailOpen(false);
                approve(id);
              }}
              onReject={(id) => {
                setDetailOpen(false);
                reject(id);
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          {selectedRequest ? (
            <>
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B1220] text-xs font-semibold text-white"
              >
                {getInitials(selectedRequest.partnerName)}
              </span>
              <div className="min-w-0 flex-1 text-[11px] leading-4 text-[#475569]">
                <p className="truncate text-sm font-semibold text-[#0F172A]" title={selectedRequest.partnerName}>
                  {selectedRequest.partnerName}
                </p>
                <p className="truncate">
                  {formatDateTime(selectedRequest.newStartWork)} → {formatDateTime(selectedRequest.newEndWork)}
                </p>
              </div>
            </>
          ) : (
            <p className={cn("flex-1 text-xs text-[#94A3B8]")}>Selecione um registro para decidir.</p>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Rejeitar ajuste"
              disabled={!selectedRequest || isMutating}
              onClick={handleReject}
              className="h-11 gap-1 border-[#FECACA] bg-white text-[#B91C1C] hover:bg-[#FEE2E2]"
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Rejeitar
            </Button>
            <Button
              type="button"
              size="sm"
              aria-label="Aprovar ajuste"
              disabled={!selectedRequest || isMutating}
              onClick={handleApprove}
              className="h-11 gap-1 bg-[#16A34A] text-white hover:bg-[#15803D]"
            >
              {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Aprovar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalMobile;
