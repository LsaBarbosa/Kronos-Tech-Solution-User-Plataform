import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import NoticeDeleteDialog from "./NoticeDeleteDialog";
import AvisosDesktopView from "./AvisosDesktopView";
import AvisosMobileView from "./AvisosMobileView";
import { useAvisosResponsiveMode } from "./useAvisosResponsiveMode";
import { useAvisosViewModel } from "./useAvisosViewModel";

const AvisosPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isDesktop } = useAvisosResponsiveMode();
  const model = useAvisosViewModel();

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((current) => !current);
  }, []);

  const handleCreate = useCallback(() => {
    navigate(APP_PATHS.criarAviso);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(APP_PATHS.dashboard);
  }, [navigate]);

  useEffect(() => {
    if (model.messages.length === 0) {
      if (model.selectedMessage) {
        model.handleCloseDialog();
      }
      return;
    }

    if (isDesktop) {
      const selectedVisible = model.visibleMessages.some(
        (message) => message.messageId === model.selectedMessage?.messageId
      );

      if (!selectedVisible && model.visibleMessages.length > 0) {
        model.handleOpenMessage(model.visibleMessages[0]);
      }
      return;
    }

    if (
      model.selectedMessage &&
      !model.visibleMessages.some((message) => message.messageId === model.selectedMessage?.messageId)
    ) {
      model.handleCloseDialog();
    }
  }, [
    isDesktop,
    model.handleCloseDialog,
    model.handleOpenMessage,
    model.messages.length,
    model.selectedMessage,
    model.visibleMessages,
  ]);

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      toggleSidebar={handleToggleSidebar}
      mainClassName="pt-24 sm:pt-32 mobile-container pb-36 sm:pb-12 space-y-6 sm:space-y-8 relative z-10 overflow-x-hidden"
    >
      {isDesktop ? (
        <AvisosDesktopView model={model} onCreate={handleCreate} onBack={handleBack} />
      ) : (
        <AvisosMobileView model={model} onCreate={handleCreate} onBack={handleBack} />
      )}

      <NoticeDeleteDialog
        message={model.selectedMessage}
        open={model.isConfirmDeleteDialogOpen}
        isDeleting={model.isDeleting}
        onCancel={model.handleCancelDelete}
        onConfirm={model.handleDeleteMessage}
      />
    </PageShell>
  );
};

export default AvisosPage;
