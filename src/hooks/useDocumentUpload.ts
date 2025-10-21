// src/hooks/useDocumentUpload.ts

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EmployeeListItem, MAX_UPLOAD_SIZE_BYTES, ALLOWED_MIME_TYPES } from "@/types/document";
import { fetchEmployeesForSelection, uploadDocument } from "@/service/document.Service";

interface UseDocumentUploadReturn {
    employees: EmployeeListItem[];
    selectedEmployeeId: string;
    selectedFile: File | null;
    isUploading: boolean;
    isFetchingEmployees: boolean;
    error: string | null;
    fileInputRef: React.RefObject<HTMLInputElement>;
    fileError: string | null;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectEmployee: (employeeId: string) => void;
    handleUpload: () => Promise<void>;
    handleClearFile: () => void;
}

export const useDocumentUpload = (): UseDocumentUploadReturn => {
    const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isFetchingEmployees, setIsFetchingEmployees] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    // 1. Busca a lista de colaboradores (compartilhado com DocumentoColaborador)
    useEffect(() => {
        const loadEmployees = async () => {
            setIsFetchingEmployees(true);
            try {
                const data = await fetchEmployeesForSelection(); // 💡 Chama o Serviço
                setEmployees(data);
                // Não seleciona automaticamente o primeiro
            } catch (err: any) {
                setError(err.message);
                if (err.message.includes("Token")) navigate("/login");
                toast({ title: "Erro", description: err.message, variant: "destructive" });
            } finally {
                setIsFetchingEmployees(false);
            }
        };
        loadEmployees();
    }, [toast, navigate]);


    // 2. Handler para seleção de arquivo com validação
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setFileError(null);
        setSelectedFile(null);

        if (file) {
            if (file.size > MAX_UPLOAD_SIZE_BYTES) {
                setFileError("Arquivo muito grande. O limite é de 5MB.");
                return;
            }
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (!fileExtension || !ALLOWED_MIME_TYPES.some(type => fileExtension.includes(type.slice(1)))) {
                setFileError("Tipo de arquivo não permitido.");
                return;
            }
            setSelectedFile(file);
        }
    }, []);

    // 3. Handler para envio do arquivo
    const handleUpload = useCallback(async () => {
        if (!selectedFile || !selectedEmployeeId) {
            setFileError("Selecione um arquivo e um colaborador.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // 💡 Chama o Serviço de Upload
            await uploadDocument(selectedFile, selectedEmployeeId); 

            toast({ title: "Sucesso", description: `Documento "${selectedFile.name}" enviado com sucesso!` });
            
            // Limpa o estado após o sucesso
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Limpa o input file
            }
        } catch (err: any) {
            console.error("Erro no upload:", err);
            toast({ 
                title: "Erro no Envio", 
                description: err.message || "Falha ao enviar o documento. Verifique o tamanho e formato.", 
                variant: "destructive" 
            });
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, selectedEmployeeId, toast]);
    
    const handleClearFile = useCallback(() => {
        setSelectedFile(null);
        setFileError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);


    return {
        employees,
        selectedEmployeeId,
        selectedFile,
        isUploading,
        isFetchingEmployees,
        error,
        fileInputRef,
        fileError,
        handleFileChange,
        handleSelectEmployee: setSelectedEmployeeId,
        handleUpload,
        handleClearFile,
    };
};