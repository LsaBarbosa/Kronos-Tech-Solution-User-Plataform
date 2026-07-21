import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { PaginationComponent } from "@/components/ui/PaginationComponent";
import type { VacationApprovalsViewModel } from "../hooks/useVacationApprovalViewModel";
import type { VacationApprovalViewModel } from "../types";
import VacationApprovalHero from "./VacationApprovalHero";
import VacationApprovalFilters from "./VacationApprovalFilters";
import VacationApprovalQueue from "./VacationApprovalQueue";
import VacationApprovalDetailPanel from "./VacationApprovalDetailPanel";
import VacationApprovalDecisionBar from "./VacationApprovalDecisionBar";

interface VacationApprovalMobileProps {
  viewModel: VacationApprovalsViewModel;
  onBack: () => void;
}

const VacationApprovalMobile = ({ viewModel, onBack }: VacationApprovalMobileProps) => {
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

  const [detailOpen, setDetailOpen] = useState(false);

  const handleSelect = (request: VacationApprovalViewModel) => {
    selectRequest(request);
  };

  const handleOpenDetail = () => {
    if (!selectedRequest) return;
    setDetailOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-36">
      <VacationApprovalHero
        variant="mobile"
        pending={metrics.pending}
        approved={metrics.approved}
        rejected={metrics.rejected}
        totalDays={metrics.totalDays}
      />

      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 px-4 py-4">
          <VacationApprovalFilters
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

      <VacationApprovalQueue
        variant="mobile"
        requests={requests}
        selectedKey={selectedRequest?.key ?? null}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        searchTerm={appliedEmployeeName}
        onSelect={handleSelect}
        onRetry={refetch}
      />

      {selectedRequest ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleOpenDetail}
          className="h-11 w-full gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir detalhe / impacto
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

      <Drawer open={detailOpen} onOpenChange={setDetailOpen}>
        <DrawerContent className="h-[92vh] overflow-hidden rounded-t-[24px] border-border/70 bg-background px-0">
          <div className="max-h-[calc(92vh-1rem)] overflow-y-auto px-4 pb-24 pt-2">
            <VacationApprovalDetailPanel
              variant="mobile"
              request={selectedRequest}
              onDecision={(action, request) => {
                setDetailOpen(false);
                openDecision(action, request);
              }}
              isBusy={isMutating}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <VacationApprovalDecisionBar
        request={selectedRequest}
        isBusy={isMutating}
        onDecision={openDecision}
      />
    </div>
  );
};

export default VacationApprovalMobile;
