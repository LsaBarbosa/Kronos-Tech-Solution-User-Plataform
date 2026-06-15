import { useCallback, useMemo, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import type { Message } from "@/types/message";
import {
  canManageMessages,
  filterNoticeMessages,
  getNoticeMetrics,
  getNoticePermissionCopy,
  type NoticePriorityFilter,
} from "./notice-ui.helpers";

export const useAvisosViewModel = () => {
  const messagesState = useMessages();
  const [searchTerm, setSearchTermState] = useState("");
  const [priorityFilter, setPriorityFilterState] = useState<NoticePriorityFilter>("ALL");

  const setSearchTerm = useCallback((value: string) => {
    setSearchTermState(value);
  }, []);

  const setPriorityFilter = useCallback((value: NoticePriorityFilter) => {
    setPriorityFilterState(value);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTermState("");
    setPriorityFilterState("ALL");
  }, []);

  const visibleMessages = useMemo(
    () => filterNoticeMessages(messagesState.messages, searchTerm, priorityFilter),
    [messagesState.messages, priorityFilter, searchTerm]
  );

  const metrics = useMemo(() => getNoticeMetrics(messagesState.messages), [messagesState.messages]);
  const canCreate = canManageMessages(messagesState.userRole);
  const canDelete = canManageMessages(messagesState.userRole);
  const permissionCopy = getNoticePermissionCopy(messagesState.userRole);
  const hasActiveFilters = Boolean(searchTerm.trim()) || priorityFilter !== "ALL";

  return {
    ...messagesState,
    searchTerm,
    priorityFilter,
    visibleMessages,
    metrics,
    canCreate,
    canDelete,
    permissionCopy,
    hasActiveFilters,
    setSearchTerm,
    setPriorityFilter,
    clearFilters,
  };
};

export type AvisosViewModel = ReturnType<typeof useAvisosViewModel>;

export type AvisoMessage = Message;
