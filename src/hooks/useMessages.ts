import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import type { Message } from "@/types/message";
import { fetchMessages, deleteMessage } from "@/service/message.service";
import { getServiceErrorMessage, isAuthServiceError } from "@/service/helpers/service-error.helper";

type UserRole = "MANAGER" | "PARTNER" | "CTO" | "";

interface UseMessagesReturn {
  messages: Message[];
  userRole: UserRole;
  currentPage: number;
  size: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  selectedMessage: Message | null;
  isLoading: boolean;
  isDeleting: boolean;
  isDialogOpen: boolean;
  isConfirmDeleteDialogOpen: boolean;
  error: string | null;
  handleOpenMessage: (message: Message) => void;
  handleCloseDialog: () => void;
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
  handleDeleteMessage: () => Promise<void>;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  setCurrentPage: (page: number) => void;
  setSize: (size: number) => void;
}

export const useMessages = (): UseMessagesReturn => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSizeState] = useState(10);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, logout } = useAuth();
  const queryClient = useQueryClient();
  const messagesQueryKey = ["messages", currentPage, size] as const;

  const messagesQuery = useQuery({
    queryKey: messagesQueryKey,
    queryFn: () => fetchMessages({ page: currentPage, size }),
  });

  const messages = messagesQuery.data ?? [];
  const hasPreviousPage = currentPage > 0;
  const hasNextPage = messages.length >= size;

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: async () => {
      queryClient.setQueryData<Message[]>(messagesQueryKey, (current = []) =>
        current.filter((message) => message.messageId !== selectedMessage?.messageId)
      );
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      setIsDialogOpen(false);
      setIsConfirmDeleteDialogOpen(false);
      setSelectedMessage(null);
      toast({
        title: "Sucesso!",
        description: "Mensagem deletada com sucesso.",
      });
    },
    onError: (err) => {
      console.error("Erro ao deletar mensagem:", err);
      toast({
        title: "Erro ao deletar mensagem",
        description: getServiceErrorMessage(err, "Falha ao deletar a mensagem."),
        variant: "destructive",
      });
    },
  });

  const handleOpenMessage = useCallback((message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedMessage(null);
    setIsConfirmDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedMessage) {
      setIsConfirmDeleteDialogOpen(true);
      setIsDialogOpen(false);
    }
  }, [selectedMessage]);

  const handleCancelDelete = useCallback(() => {
    setIsConfirmDeleteDialogOpen(false);
    if (selectedMessage) setIsDialogOpen(true);
  }, [selectedMessage]);

  const handleDeleteMessage = useCallback(async () => {
    if (!selectedMessage) return;

    try {
      await deleteMutation.mutateAsync(selectedMessage.messageId);
    } catch (err) {
      if (isAuthServiceError(err)) {
        logout();
        navigate("/login");
      }
    }
  }, [deleteMutation, logout, navigate, selectedMessage]);

  const handlePreviousPage = useCallback(() => {
    if (!hasPreviousPage || messagesQuery.isFetching) return;
    setCurrentPage((page) => Math.max(page - 1, 0));
  }, [hasPreviousPage, messagesQuery.isFetching]);

  const handleNextPage = useCallback(() => {
    if (!hasNextPage || messagesQuery.isFetching) return;
    setCurrentPage((page) => page + 1);
  }, [hasNextPage, messagesQuery.isFetching]);

  const setSize = useCallback((nextSize: number) => {
    setSizeState(nextSize);
    setCurrentPage(0);
  }, []);

  const error = messagesQuery.error
    ? getServiceErrorMessage(messagesQuery.error, "Não foi possível carregar as mensagens.")
    : null;

  useEffect(() => {
    if (!messagesQuery.error || !isAuthServiceError(messagesQuery.error)) return;
    logout();
    navigate("/login");
  }, [messagesQuery.error, logout, navigate]);

  return {
    messages,
    userRole: (role as UserRole) || "",
    currentPage,
    size,
    hasPreviousPage,
    hasNextPage,
    selectedMessage,
    isLoading: messagesQuery.isLoading,
    isDeleting: deleteMutation.isPending,
    isDialogOpen,
    isConfirmDeleteDialogOpen,
    error,
    handleOpenMessage,
    handleCloseDialog,
    handleConfirmDelete,
    handleCancelDelete,
    handleDeleteMessage,
    handlePreviousPage,
    handleNextPage,
    setCurrentPage,
    setSize,
  };
};
