import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "@/components/PageShell";
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
