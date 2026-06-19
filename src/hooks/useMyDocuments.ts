// src/hooks/useMyDocuments.ts

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Document, DocumentType } from "@/types/document";
import {
    deleteDocument,
    downloadDocument,
    fetchUserDocuments,
} from "@/service/document.service";
import { isAuthServiceError, normalizeServiceError } from "@/service/helpers/service-error.helper";
import { safeLogger } from "@/utils/security/safeLogger";

const DEFAULT_MY_DOCUMENTS_TYPE: DocumentType = "EMPLOYEE_DOCUMENTS";

interface UseMyDocumentsReturn {
    documents: Document[];
    isLoading: boolean;
    isDeleting: boolean;
    error: string | null;
    handleDeleteDocument: (documentId: string, documentName: string) => Promise<void>;
    handleDownloadDocument: (documentId: string, documentName: string) => Promise<void>;
    refetchDocuments: () => void;
}

export const useMyDocuments = (): UseMyDocumentsReturn => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { toast } = useToast();
    const navigate = useNavigate();

    const loadDocuments = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchUserDocuments(DEFAULT_MY_DOCUMENTS_TYPE); // 💡 Chama o Serviço
            setDocuments(data);
        } catch (err) {
            const normalized = normalizeServiceError(err);
            setError(normalized.message);
            if (isAuthServiceError(normalized)) navigate("/login");
            toast({ title: "Erro", description: normalized.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast, navigate]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);
    
    // Função de exclusão com atualização otimista (parcialmente otimista)
    const handleDeleteDocument = useCallback(async (documentId: string, documentName: string) => {
        if (isDeleting) return;
        
        // Simulação de confirmação (DEVE SER SUBSTITUÍDA POR MODAL/DIALOG REAL)
        // No seu código original, isso era feito diretamente. Mantenha a confirmação via UI.
        if (!window.confirm(`Tem certeza que deseja excluir o documento "${documentName}"?`)) {
            return;
        }

        setIsDeleting(true);

        try {
            await deleteDocument(documentId); // 💡 Chama o Serviço
            
            // Atualização otimista: remove da lista localmente
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));

            toast({ title: "Sucesso", description: `Documento "${documentName}" excluído.` });
        } catch (err) {
            const normalized = normalizeServiceError(err);
            safeLogger.error("Erro ao deletar:", normalized);
            toast({ title: "Erro", description: normalized.message || "Falha ao excluir o documento.", variant: "destructive" });
            if (isAuthServiceError(normalized)) navigate("/login");
        } finally {
            setIsDeleting(false);
        }
    }, [isDeleting, navigate, toast]);

    const handleDownloadDocument = useCallback(async (documentId: string, documentName: string) => {
        try {
            await downloadDocument(documentId, documentName);
            toast({ title: "Sucesso", description: `Download de "${documentName}" iniciado.` });
        } catch (err) {
            const normalized = normalizeServiceError(err);
            toast({
                title: "Erro",
                description: normalized.message || "Falha ao iniciar o download do documento.",
                variant: "destructive",
            });
            if (isAuthServiceError(normalized)) navigate("/login");
        }
    }, [navigate, toast]);

    return {
        documents,
        isLoading,
        isDeleting,
        error,
        handleDeleteDocument,
        handleDownloadDocument,
        refetchDocuments: loadDocuments,
    };
};
