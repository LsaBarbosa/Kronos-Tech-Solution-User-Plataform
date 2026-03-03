// src/services/employeeService.ts

// 💡 CORREÇÃO 2: Importa o EmployeeCreationPayload corrigido
import { EmployeeCreationPayload, CompanyListItem, EmployeeData, cleanNumberString } from "@/types/employee";
import { API_BASE_URL } from "@/config/api"; 
import { string } from "zod";

// --- Funções Auxiliares de Requisição ---

const getAuthHeaders = (contentType: 'json' | 'form' = 'json') => {
    const headers: HeadersInit = {};
    if (contentType === 'json') {
        headers["Content-Type"] = "application/json";
    }
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

// --- Serviços de Criação (CriarColaborador.tsx / CriarManager.tsx) ---

/**
 * Checa a disponibilidade de um username.
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (username.length < 5) return false;
    const headers = getAuthHeaders('json');
    // Endpoint simulado
    const response = await fetch(`${API_BASE_URL}auth/username-availability?username=${username}`, { headers });
    
    if (response.ok) {
        const data = await response.json();
        return data.available; 
    }
    return false;
};

/**
 * Busca a lista de todas as empresas (para o Select).
 */
export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}companies/list-basic`, { headers });
    const data = await handleResponse(response);
    return data.map((item: any) => ({ companyId: item.id, name: item.name }));
};

// 💡 FUNÇÃO DE ADAPTAÇÃO CENTRALIZADA DE DADOS DO FORM PARA O PAYLOAD DA API
const createApiPayload = (formData: EmployeeCreationPayload): Omit<EmployeeCreationPayload, 'confirmPassword'> => {
    return {
        ...formData,
        // 💡 CORREÇÃO 3: Conversão explícita de 'homeOffice' (boolean) para a API
        homeOffice: formData.homeOffice, 
        
        // Limpeza e tipagem de strings numéricas
        cpf: cleanNumberString(formData.cpf),
        pis: cleanNumberString(formData.pis),
        phoneNumber: cleanNumberString(formData.phoneNumber),
        salary: Number(formData.salary),
       
    };
};

/**
 * Cria um novo Colaborador (PARTNER).
 */
export const createPartner = async (formData: EmployeeCreationPayload): Promise<void> => {
    const finalPayload = createApiPayload(formData);
    (finalPayload as any).role = 'PARTNER'; // Define o papel no payload
    
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}employees/create-partner`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(finalPayload),
    });
    await handleResponse(response);
};

/**
 * Cria um novo Gestor (MANAGER).
 */
export const createManager = async (formData: EmployeeCreationPayload): Promise<void> => {
    const finalPayload = createApiPayload(formData);
    (finalPayload as any).role = 'MANAGER'; // Define o papel no payload

    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}employees/create-manager`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(finalPayload),
    });
    await handleResponse(response);
};

// --- Serviços de Listagem e Ação (ListaColaboradores.tsx) ---

/**
 * Busca a lista completa de colaboradores (PARTNERs e MANAGERs).
 */
export const fetchEmployeeList = async (): Promise<EmployeeData[]> => {
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}employee`, { headers });
    const data = await handleResponse(response);
    return data.employees as EmployeeData[]; 
};

/**
 * Alterna o status (Ativo/Inativo) de um colaborador.
 */
export const toggleEmployeeStatus = async (employeeId: string, currentStatus: boolean): Promise<void> => {
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}employees/${employeeId}/toggle-status`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ active: !currentStatus })
    });
    await handleResponse(response);
};

/**
 * Deleta um colaborador.
 */
export const deleteEmployee = async (employeeId: string): Promise<void> => {
    const headers = getAuthHeaders('json');
    const response = await fetch(`${API_BASE_URL}employees/${employeeId}`, {
        method: 'DELETE',
        headers: headers,
    });
    await handleResponse(response);
};
