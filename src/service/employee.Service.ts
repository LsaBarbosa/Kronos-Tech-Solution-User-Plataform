// Legacy collaborator service. Prefer collaborator-management.service.ts for
// the new collaborator creation flow.

// 💡 CORREÇÃO 2: Importa o EmployeeCreationPayload corrigido
import { EmployeeCreationPayload, CompanyListItem, EmployeeData, cleanNumberString } from "@/types/employee";
import { api } from "@/config/api";
import { extractArray, mapArrayPayload } from "@/service/helpers/response-normalizer.helper";

// --- Serviços de Criação (CriarColaborador.tsx / CriarManager.tsx) ---

/**
 * Checa a disponibilidade de um username.
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (username.length < 5) return false;
    // Endpoint simulado
    try {
        const response = await api.get<{ available: boolean }>("/auth/username-availability", {
            params: { username },
        });
        return response.data.available;
    } catch {
        return false;
    }
};

/**
 * Busca a lista de todas as empresas (para o Select).
 */
export const fetchCompanyList = async (): Promise<CompanyListItem[]> => {
    const response = await api.get<any[]>("/companies/list-basic");
    return mapArrayPayload<any, CompanyListItem>(
        response.data,
        (item) => ({ companyId: item.id, name: item.name }),
        ["companies", "data"]
    );
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
    
    await api.post("/employees/create-partner", finalPayload);
};

/**
 * Cria um novo Gestor (MANAGER).
 */
export const createManager = async (formData: EmployeeCreationPayload): Promise<void> => {
    const finalPayload = createApiPayload(formData);
    (finalPayload as any).role = 'MANAGER'; // Define o papel no payload

    await api.post("/employees/create-manager", finalPayload);
};

// --- Serviços de Listagem e Ação (ListaColaboradores.tsx) ---

/**
 * Busca a lista completa de colaboradores (PARTNERs e MANAGERs).
 */
export const fetchEmployeeList = async (): Promise<EmployeeData[]> => {
    const response = await api.get<{ employees: EmployeeData[] }>("/employee");
    return extractArray<EmployeeData>(response.data, ["employees"]); 
};

/**
 * Alterna o status (Ativo/Inativo) de um colaborador.
 */
export const toggleEmployeeStatus = async (employeeId: string, currentStatus: boolean): Promise<void> => {
    await api.patch(`/employees/${employeeId}/toggle-status`, { active: !currentStatus });
};

/**
 * Deleta um colaborador.
 */
export const deleteEmployee = async (employeeId: string): Promise<void> => {
    await api.delete(`/employees/${employeeId}`);
};
