// src/hooks/useMessages.ts

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast"; 
import { Message } from "@/types/message";
import { fetchMessages, deleteMessage, getSessionRole } from "@/service/message.service";
import { useAuth } from "@/context/AuthContext";

type UserRole = 'MANAGER' | 'PARTNER' | 'CTO' | '';

interface UseMessagesReturn {
    // Estados de Dados
    messages: Message[];
    userRole: UserRole;
    selectedMessage: Message | null;
    // Estados de UI
    isLoading: boolean;
    isDeleting: boolean;
    isDialogOpen: boolean;
    isConfirmDeleteDialogOpen: boolean;
    error: string | null;
    // Handlers
    handleOpenMessage: (message: Message) => void;
    handleCloseDialog: () => void;
    handleConfirmDelete: () => void;
    handleCancelDelete: () => void;
    handleDeleteMessage: () => Promise<void>;
}

export const useMessages = (): UseMessagesReturn => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false); 
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(''); 

    const navigate = useNavigate();
    const { toast } = useToast();
    const { session } = useAuth();

    // --- FUNÇÕES DE LÓGICA / API ---
    
    const loadMessages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const role = getSessionRole(session?.role);
        setUserRole(role);
        
        try {
            const data = await fetchMessages();
            setMessages(data);
        } catch (err: any) {
            setError(err.message);
            if (isSessionError(err)) {
                 navigate("/login"); 
            }
            toast({
                title: "Erro ao buscar mensagens",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, navigate, session]);


    const handleDeleteMessage = useCallback(async () => {
        if (!selectedMessage) return;

        try {
            setIsDeleting(true); 
            const messageId = selectedMessage.messageId;
            
            await deleteMessage(messageId); // 💡 Chama o Serviço Único

            setMessages(prevMessages => prevMessages.filter(msg => msg.messageId !== messageId));
            
            setIsDialogOpen(false);
            setIsConfirmDeleteDialogOpen(false);
            
            toast({
                title: "Sucesso!",
                description: "Mensagem deletada com sucesso.",
            });
        } catch (err: any) {
            console.error("Erro ao deletar mensagem:", err);
            toast({
                title: "Erro ao deletar mensagem",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    }, [selectedMessage, toast]);


    // --- HANDLERS DE UI ---
    
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
    
    
    // --- EFEITOS ---
    useEffect(() => {
        loadMessages();
    }, [loadMessages]);


    return {
        messages,
        userRole,
        selectedMessage,
        isLoading,
        isDeleting,
        isDialogOpen,
        isConfirmDeleteDialogOpen,
        error,
        handleOpenMessage,
        handleCloseDialog, 
        handleConfirmDelete,
        handleCancelDelete,
        handleDeleteMessage,
    };
};
    const isSessionError = (error: any) => error?.response?.status === 401 || error?.response?.status === 403;
