import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { APP_PATHS } from "@/config/app-routes";
import NoticeDeleteDialog from "./NoticeDeleteDialog";
import AvisosDesktopView from "./AvisosDesktopView";
import AvisosMobileView from "./AvisosMobileView";
import { useAvisosResponsiveMode } from "./useAvisosResponsiveMode";
import { useAvisosViewModel } from "./useAvisosViewModel";
import { FaqContextualBlock } from "@/components/faq/FaqContextualBlock";
import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

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

  const {
    messages,
    visibleMessages,
    selectedMessage,
    handleCloseDialog,
    handleOpenMessage,
  } = model;

  useEffect(() => {
    if (messages.length === 0) {
      if (selectedMessage) {
        handleCloseDialog();
      }
      return;
    }

    if (isDesktop) {
      const selectedVisible = visibleMessages.some(
        (message) => message.messageId === selectedMessage?.messageId
      );

      if (!selectedVisible && visibleMessages.length > 0) {
        handleOpenMessage(visibleMessages[0]);
      }
      return;
    }

    if (
      selectedMessage &&
      !visibleMessages.some((message) => message.messageId === selectedMessage?.messageId)
    ) {
      handleCloseDialog();
    }
  }, [
    isDesktop,
    handleCloseDialog,
    handleOpenMessage,
    messages.length,
    selectedMessage,
    visibleMessages,
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

      <FaqContextualBlock screenKey={FAQ_SCREEN_KEYS.MESSAGES} className="mt-6" />
    </PageShell>
  );
};

export default AvisosPage;
