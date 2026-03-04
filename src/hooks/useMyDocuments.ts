// src/hooks/useMyDocuments.ts

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@/types/document";
import { fetchUserDocuments, deleteDocument, downloadDocument } from "@/service/document.Service";

interface UseMyDocumentsReturn {
    documents: Document[];
    isLoading: boolean;
    isDeleting: boolean;
    error: string | null;
    handleDeleteDocument: (documentId: string, documentName: string) => Promise<void>;
    downloadDocument: (documentId: string, filename?: string) => Promise<void>;
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
            const data = await fetchUserDocuments(); // 💡 Chama o Serviço
            setDocuments(data);
        } catch (err: any) {
            setError(err.message);
            if (err.message.includes("Token")) navigate("/login");
            toast({ title: "Erro", description: err.message, variant: "destructive" });
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
        } catch (err: any) {
            console.error("Erro ao deletar:", err);
            toast({ title: "Erro", description: err.message || "Falha ao excluir o documento.", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    }, [isDeleting, toast]);


    const handleDownloadDocument = useCallback(async (documentId: string, filename?: string) => {
        await downloadDocument(documentId, undefined, filename);
    }, []);
    return {
        documents,
        isLoading,
        isDeleting,
        error,
        handleDeleteDocument,
        downloadDocument: handleDownloadDocument,
        refetchDocuments: loadDocuments,
    };
};