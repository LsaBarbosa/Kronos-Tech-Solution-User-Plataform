import { useState } from "react";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import type { TimeOffApprovalsViewModel } from "../hooks/useTimeOffApprovalViewModel";
import type { TimeOffApprovalViewModel } from "../types";
import TimeOffApprovalHero from "./TimeOffApprovalHero";
import TimeOffApprovalFilters from "./TimeOffApprovalFilters";
import TimeOffApprovalQueue from "./TimeOffApprovalQueue";
import TimeOffApprovalDetailPanel from "./TimeOffApprovalDetailPanel";
import TimeOffApprovalDecisionBar from "./TimeOffApprovalDecisionBar";

interface TimeOffApprovalMobileProps {
  viewModel: TimeOffApprovalsViewModel;
  onBack: () => void;
}

const TimeOffApprovalMobile = ({ viewModel, onBack }: TimeOffApprovalMobileProps) => {
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

  const [detailOpen, setDetailOpen] = useState(false);

  const handleSelect = (request: TimeOffApprovalViewModel) => {
    selectRequest(request);
  };

  const handleOpenDetail = () => {
    if (!selectedRequest) return;
    setDetailOpen(true);
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

      <TimeOffApprovalHero
        variant="mobile"
        pending={metrics.pending}
        approved={metrics.approved}
        rejected={metrics.rejected}
        withEvidence={metrics.withEvidence}
      />

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <TimeOffApprovalFilters
            variant="mobile"
            draftEmployeeName={draftEmployeeName}
            onDraftEmployeeNameChange={setDraftEmployeeName}
            statusFilter={statusFilter}
            onStatusFilterChange={applyStatusFilter}
            onSearch={search}
            onClear={clearFilters}
            isBusy={isLoading || isMutating}
          />
        </CardContent>
      </Card>

      <TimeOffApprovalQueue
        variant="mobile"
        requests={requests}
        selectedKey={selectedRequest?.record.timeRecordId ?? null}
        isLoading={isLoading}
        onSelect={handleSelect}
        onDownload={handleDownload}
      />

      {selectedRequest ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleOpenDetail}
          className="h-11 w-full gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir detalhe / evidência
        </Button>
      ) : null}

      {totalPages > 1 ? (
        <Card className="border-border/70 px-3 py-3 shadow-sm">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setCurrentPage}
          />
        </Card>
      ) : null}

      <Drawer
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
        }}
      >
        <DrawerContent className="h-[92vh] overflow-hidden rounded-t-[24px] border-border/70 bg-background px-0">
          <div className="max-h-[calc(92vh-1rem)] overflow-y-auto px-4 pb-24 pt-2">
            <TimeOffApprovalDetailPanel
              variant="mobile"
              request={selectedRequest}
              onDecision={(action, request) => {
                setDetailOpen(false);
                openDecision(action, request);
              }}
              onDownload={handleDownload}
              isBusy={isMutating}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <TimeOffApprovalDecisionBar
        request={selectedRequest}
        isBusy={isMutating}
        onDecision={openDecision}
      />
    </div>
  );
};

export default TimeOffApprovalMobile;
