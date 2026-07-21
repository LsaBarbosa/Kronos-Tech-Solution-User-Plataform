import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BellRing, PlusCircle } from "lucide-react";
import PageShell from "@/components/PageShell";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { DesktopMessagesView, type MessageScopeFilter } from "@/components/messages/DesktopMessagesView";
import { MobileMessagesView } from "@/components/messages/MobileMessagesView";
import { APP_PATHS } from "@/config/app-routes";
import { useAuth } from "@/context/AuthContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMessages } from "@/hooks/useMessages";
import type { Message } from "@/types/message";
import NoticeDeleteDialog from "./avisos/NoticeDeleteDialog";

const filterMessagesByScope = (messages: Message[], filter: MessageScopeFilter) => {
  if (filter === "ALL") {
    return messages;
  }

  return messages.filter((message) => (message.scope ?? "DIRECT") === filter);
};

const Avisos = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { role, user } = useAuth();
  const messagesState = useMessages();
  const [scopeFilter, setScopeFilter] = useState<MessageScopeFilter>("ALL");

  const filteredMessages = useMemo(
    () => filterMessagesByScope(messagesState.messages, scopeFilter),
    [messagesState.messages, scopeFilter]
  );

  useEffect(() => {
    if (!isDesktop || messagesState.selectedMessage || filteredMessages.length === 0) {
      return;
    }

    messagesState.handleOpenMessage(filteredMessages[0]);
  }, [filteredMessages, isDesktop, messagesState]);

  useEffect(() => {
    if (
      messagesState.selectedMessage &&
      !filteredMessages.some((message) => message.messageId === messagesState.selectedMessage?.messageId)
    ) {
      messagesState.handleCloseDialog();
    }
  }, [filteredMessages, messagesState]);

  const currentEmployeeId = user?.profile?.employeeId ?? "";
  const canCreate = role === "CTO" || role === "MANAGER";
  const canDeleteSelected = Boolean(
    messagesState.selectedMessage &&
      (role === "CTO" ||
        (role === "MANAGER" && messagesState.selectedMessage.senderEmployeeId === currentEmployeeId))
  );

  return (
    <PageShell mainClassName="pt-24 sm:pt-32 px-4 pb-12 sm:px-6 lg:px-8 bg-[#D9E2EB]">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <PageHero
          badge="Comunicados internos"
          title="Avisos"
          description="Acompanhe os comunicados e notificações enviados pela empresa."
          icon={<BellRing className="h-10 w-10 text-white/80" />}
          primaryAction={
            canCreate ? (
              <Button
                type="button"
                className="h-11 w-full gap-2 rounded-2xl bg-white text-[#102A43] hover:bg-white/90"
                onClick={() => navigate(APP_PATHS.criarAviso)}
              >
                <PlusCircle className="h-4 w-4" />
                Criar Aviso
              </Button>
            ) : undefined
          }
        />
        {isDesktop ? (
        <DesktopMessagesView
          messages={messagesState.messages}
          filteredMessages={filteredMessages}
          selectedMessage={messagesState.selectedMessage}
          scopeFilter={scopeFilter}
          isLoading={messagesState.isLoading}
          isFetching={messagesState.isFetching}
          error={messagesState.error}
          currentPage={messagesState.currentPage}
          hasPreviousPage={messagesState.hasPreviousPage}
          hasNextPage={messagesState.hasNextPage}
          canCreate={canCreate}
          canDeleteSelected={canDeleteSelected}
          onFilterChange={setScopeFilter}
          onSelectMessage={messagesState.handleOpenMessage}
          onCreate={() => navigate(APP_PATHS.criarAviso)}
          onRequestDelete={messagesState.handleConfirmDelete}
          onPreviousPage={messagesState.handlePreviousPage}
          onNextPage={messagesState.handleNextPage}
        />
      ) : (
        <MobileMessagesView
          messages={messagesState.messages}
          filteredMessages={filteredMessages}
          selectedMessage={messagesState.selectedMessage}
          scopeFilter={scopeFilter}
          isLoading={messagesState.isLoading}
          isFetching={messagesState.isFetching}
          error={messagesState.error}
          hasPreviousPage={messagesState.hasPreviousPage}
          hasNextPage={messagesState.hasNextPage}
          canCreate={canCreate}
          canDeleteSelected={canDeleteSelected}
          onFilterChange={setScopeFilter}
          onSelectMessage={messagesState.handleOpenMessage}
          onCloseDetail={messagesState.handleCloseDialog}
          onCreate={() => navigate(APP_PATHS.criarAviso)}
          onRequestDelete={messagesState.handleConfirmDelete}
          onPreviousPage={messagesState.handlePreviousPage}
          onNextPage={messagesState.handleNextPage}
        />
      )}
      </div>

      <NoticeDeleteDialog
        message={messagesState.selectedMessage}
        open={messagesState.isConfirmDeleteDialogOpen}
        isDeleting={messagesState.isDeleting}
        onCancel={messagesState.handleCancelDelete}
        onConfirm={messagesState.handleDeleteMessage}
      />
    </PageShell>
  );
};

export default Avisos;
