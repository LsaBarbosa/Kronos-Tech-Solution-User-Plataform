// src/hooks/useDocumentUpload.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EmployeeListItem, MAX_UPLOAD_SIZE_BYTES, ALLOWED_MIME_TYPES } from "@/types/document";
import { fetchEmployeesForSelection, uploadDocument } from "@/service/document.Service";

const DEFAULT_DOCUMENT_TYPE = "EMPLOYEE_DOCUMENTS";

// ===========================================
// FUNÇÕES DE COMPRESSÃO E CONVERSÃO (NOVAS)
// ===========================================

// Helper para converter Blob (resultado da compressão) para File.
const blobToFile = (blob: Blob, fileName: string): File => {
    // Cria um novo objeto File a partir do Blob, usando o nome de arquivo original.
    return new File([blob], fileName, { type: blob.type, lastModified: Date.now() });
};

/**
 * Comprime um arquivo de imagem (JPEG ou PNG) usando a API Canvas.
 * Força a conversão para JPEG (qualidade 0.7) para maior otimização.
 */
const compressImage = (file: File, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve) => {
        // Ignora arquivos que não são imagens ou que são vetoriais/gifs
        if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type.startsWith('image/svg')) {
            return resolve(file);
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event: ProgressEvent<FileReader>) => {
            const img = document.createElement('img');
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Mantém as dimensões originais
                canvas.width = img.width;
                canvas.height = img.height;

                ctx?.drawImage(img, 0, 0, img.width, img.height);
                
                // Força a saída para 'image/jpeg'
                const outputMimeType = 'image/jpeg';

                canvas.toBlob((blob) => {
                    // Verifica se a compressão foi bem-sucedida e se o arquivo é menor que o original
                    if (blob && blob.size < file.size) { 
                        const compressedFile = blobToFile(blob, file.name);
                        resolve(compressedFile);
                    } else {
                        // Retorna o original se a compressão falhar ou não for útil
                        resolve(file);
                    }
                }, outputMimeType, quality);
            };
            img.onerror = () => resolve(file); // Retorna o original em caso de erro
        };
        reader.onerror = () => resolve(file); // Retorna o original em caso de erro de leitura
    });
};

// ===========================================
// DEFINIÇÃO DO HOOK
// ===========================================

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

    // 1. Busca a lista de colaboradores (inalterada)
    useEffect(() => {
        const loadEmployees = async () => {
            setIsFetchingEmployees(true);
            try {
                const data = await fetchEmployeesForSelection();
                setEmployees(data);
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


    // 2. Handler para seleção de arquivo com COMPRESSÃO e VALIDAÇÃO (CORRIGIDO)
    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files?.[0] || null;
        setFileError(null);
        setSelectedFile(null);

        if (!file) {
            return;
        }

        // 1. Validação do tipo de arquivo (extensão/MIME)
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const isAllowedType = ALLOWED_MIME_TYPES.some(type => fileExtension && fileExtension.includes(type.slice(1)));
        
        if (!fileExtension || !isAllowedType) {
            setFileError("Tipo de arquivo não permitido.");
            // 💡 Limpa o input file para evitar o reuso de um arquivo inválido
            if (fileInputRef.current) fileInputRef.current.value = ""; 
            return;
        }

        // 2. Compressão de imagem (se aplicável)
        if (file.type.startsWith('image/')) {
            // 💡 Feedback visual enquanto comprime
            setFileError("Otimizando imagem..."); 
            file = await compressImage(file);
            setFileError(null);
        }

        // 3. Validação do tamanho do arquivo (APÓS potencial compressão)
        if (file.size > MAX_UPLOAD_SIZE_BYTES) {
            const maxSizeMB = (MAX_UPLOAD_SIZE_BYTES / 1024 / 1024).toFixed(0);
            setFileError(`Arquivo muito grande. O limite é de ${maxSizeMB}MB.`);
            // 💡 Limpa o input file para evitar o reuso de um arquivo inválido
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        
        // 4. Arquivo selecionado com sucesso
        setSelectedFile(file);
    }, []); 

    // 3. Handler para envio do arquivo (inalterado)
    const handleUpload = useCallback(async () => {
        if (!selectedFile || !selectedEmployeeId) {
            setFileError("Selecione um arquivo e um colaborador.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            await uploadDocument(selectedFile, selectedEmployeeId, DEFAULT_DOCUMENT_TYPE);

            toast({ title: "Sucesso", description: `Documento "${selectedFile.name}" enviado com sucesso!` });
            
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
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
