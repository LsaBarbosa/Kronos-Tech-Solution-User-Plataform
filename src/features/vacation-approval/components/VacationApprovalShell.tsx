import { useState } from "react";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/context/AuthContext";
import { useVacationApprovalDeskViewModel } from "../hooks/useVacationApprovalDeskViewModel";
import type { VacationDecisionAction, VacationDecisionDraft } from "../types";
import { VacationDecisionDialog } from "./VacationDecisionDialog";
import { VacationApprovalDesktop } from "./VacationApprovalDesktop";
import { VacationApprovalMobile } from "./VacationApprovalMobile";

export const VacationApprovalShell = () => {
  const viewModel = useVacationApprovalDeskViewModel();
  const { user, role } = useAuth();
  const sessionName = user?.profile?.fullName ?? user?.account?.username ?? "Gestor";
  const sessionRole = role || "MANAGER";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draftDecision, setDraftDecision] = useState<VacationDecisionDraft | null>(null);

  const approvalInProgress = viewModel.isMutating;

  const handleOpenDecision = (action: VacationDecisionAction, request: NonNullable<typeof viewModel.selectedRequest>) => {
    setDraftDecision({ action, request });
  };

  const handleCloseDecision = (open: boolean) => {
    if (!open) {
      setDraftDecision(null);
    }
  };

  const handleConfirmDecision = async () => {
    if (!draftDecision) {
      return;
    }

    const ids = draftDecision.request.raw.timeRecordIdsForApproval;

    try {
      if (draftDecision.action === "approve") {
        await viewModel.approveAsync(ids);
      } else {
        await viewModel.rejectAsync(ids);
      }
      setDraftDecision(null);
    } catch {
      // Toast and error handling already happen in the hook.
    }
  };

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={() => setSidebarOpen((current) => !current)}
      mainClassName="pt-24 sm:pt-28 mobile-container py-4 sm:py-8 space-y-6 sm:space-y-8 relative z-10"
      contentClassName="flex-1 flex flex-col overflow-hidden"
    >
      {viewModel.isDesktop ? (
        <VacationApprovalDesktop
          sessionName={sessionName}
          sessionRole={sessionRole}
          viewModel={viewModel}
          onOpenDecision={handleOpenDecision}
        />
      ) : (
        <VacationApprovalMobile
          sessionRole={sessionRole}
          viewModel={viewModel}
          onOpenDecision={handleOpenDecision}
        />
      )}

      <VacationDecisionDialog
        open={Boolean(draftDecision)}
        action={draftDecision?.action ?? null}
        request={draftDecision?.request ?? null}
        isLoading={approvalInProgress}
        onOpenChange={handleCloseDecision}
        onConfirm={handleConfirmDecision}
      />
    </PageShell>
  );
};
