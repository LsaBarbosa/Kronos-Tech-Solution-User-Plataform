// src/services/documentService.ts

import { API_BASE_URL } from "@/config/api"; 
import { Document, EmployeeListItem, MAX_UPLOAD_SIZE_BYTES } from "@/types/document";
import { getAuthToken } from "./company.Service";

// --- Funções Auxiliares de Requisição ---

const getAuthHeaders = (contentType: 'json' | 'multipart' = 'json') => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error("Token de autenticação não encontrado."); 
    }
    const headers: HeadersInit = {
        "Authorization": `Bearer ${token}`,
    };
    if (contentType === 'json') {
        headers["Content-Type"] = "application/json";
    }
    // Para 'multipart', o navegador define o Content-Type (boundary)
    return headers;
};

const handleResponse = async (response: Response): Promise<any> => {
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.message || `Erro de API (${response.status})`;
        throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return {};
};

// --- Serviços de Documentos do Usuário Logado (Documentos.tsx) ---

/**
 * Busca a lista de documentos do usuário logado.
 */
export const fetchUserDocuments = async (): Promise<Document[]> => {
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}documents/me`, { headers });
    const data = await handleResponse(response);
    return data; // Assumindo que a API retorna o array de documentos
};

/**
 * Deleta um documento pelo ID.
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}documents/${documentId}`, {
        method: "DELETE",
        headers: headers,
    });
    await handleResponse(response);
};

/**
 * Gera a URL de download para um documento específico.
 */
export const generateDownloadUrl = (documentId: string): string => {
    const token = getAuthHeaders('json').Authorization;
    // URL simulada que precisa de autenticação (usado no href do Documentos.tsx)
    return `${API_BASE_URL}documents/${documentId}/download?token=${token}`; 
};


// --- Serviços para Gestores (DocumentoColaborador.tsx) ---

/**
 * Busca a lista de colaboradores ativos (compartilhado com EnviarDocumentos).
 */
export const fetchEmployeesForSelection = async (): Promise<EmployeeListItem[]> => {
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}employees?active=true`, { headers });
    const data = await handleResponse(response);
    // Adapte o mapeamento conforme sua API retorna a lista
    return data.employees.map((emp: any) => ({
        employeeId: emp.id,
        fullName: emp.name,
    })) as EmployeeListItem[]; 
};

/**
 * Busca documentos de um colaborador específico (para DocumentoColaborador).
 */
export const fetchEmployeeDocuments = async (employeeId: string): Promise<Document[]> => {
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}documents/employee/${employeeId}`, { headers });
    const data = await handleResponse(response);
    return data; 
};

// --- Serviços de Upload (EnviarDocumentos.tsx) ---

/**
 * Realiza o upload do arquivo para o colaborador selecionado (pode ser o próprio usuário logado).
 * @param file O arquivo a ser enviado.
 * @param employeeId O ID do colaborador destinatário.
 */
export const uploadDocument = async (file: File, employeeId: string): Promise<void> => {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error("O arquivo excede o limite de 5MB.");
    }
    
    // Configuração do FormData para envio de arquivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', employeeId);
    
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}documents/upload`, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            // Não defina Content-Type; o navegador o fará para FormData, incluindo o boundary
        },
        body: formData,
    });
    
    await handleResponse(response);
};