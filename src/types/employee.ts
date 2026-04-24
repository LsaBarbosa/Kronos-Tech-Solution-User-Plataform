// src/types/employee.ts

import * as z from "zod";

// --- INTERFACES DE DOMÍNIO ---

/**
 * Interface para os dados resumidos da Empresa (usado para seleção).
 */
export interface CompanyListItem {
    companyId: string; 
    name: string;
}

/**
 * Interface de dados do Colaborador para listagem e edição.
 */
export interface EmployeeData {
    id?: string;
    employeeId: string;
    fullName: string;
    maskedCpf: string;
    email: string;
    phone: string;
    salary: number;
    jobPosition: string;
    pis: string;
    username?: string;
    address: {
        street: string;
        number: string;
        postalCode: string;
        city: string;
        state: string;
        neighborhood?: string;
    };
    companyId: string;
    role?: 'PARTNER' | 'MANAGER' | 'ADMIN' | 'CTO';
    active: boolean;
    homeOffice: boolean; 
    workStartTime?: string;  
    workEndTime?: string;    
    breakStartTime?: string; 
    breakEndTime?: string;
    scheduleType?: string;
    scaleStartDate?: string;
    preferredDayOff?: string;
    weekendOffIndex?: number;
    fixedWorkDays?: string[];
}

/**
 * Interface para o payload de criação de novo Colaborador ou Manager.
 * 💡 CORREÇÃO 1: O tipo de 'homeOffice' deve ser BOOLEAN aqui, pois é o que a API espera.
 */
export interface EmployeeCreationPayload {
    name: string;
    cpf: string;
    email: string;
    phoneNumber: string;
    salary: number;
    jobTitle: string;
    pis: string;
    companyId: string;
    role: 'PARTNER' | 'MANAGER'; // O ADMIN/CTO não é criado por aqui
    username: string;
    password: string;
    confirmPassword: string; // Incluído no form, mas removido no payload final
    homeOffice: boolean; // 💡 Corrigido para boolean
}

// --- ESQUEMAS DE VALIDAÇÃO (CENTRALIZADOS) ---

// Esquema para validação rigorosa dos campos de Colaborador/Manager
export const employeeSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    cpf: z.string().length(11, "CPF deve ter 11 dígitos (apenas números)"), 
    email: z.string().email("E-mail inválido"),
    phoneNumber: z.string().min(10, "Telefone inválido"),
    salary: z.coerce.number().min(0, "Salário deve ser maior ou igual a zero"),
    jobTitle: z.string().min(2, "Cargo é obrigatório"),
   pis: z.string()
        .transform((val) => val.replace(/\D/g, '')) // Remove formatação antes de validar
        .refine((val) => val === '' || val.length === 11, {
            message: "PIS deve ter 11 dígitos ou ficar vazio"
        })
        .optional(),
    
    // Selects exigem string, convertemos depois
    companyId: z.string().min(1, "Empresa é obrigatória"),
    // O valor do campo no formulário DEVE ser string ('true'/'false') para o Select
    homeOffice: z.string(), 
    workStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    workEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    breakStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    breakEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    // Campos para o Passo 2: Acesso
    username: z.string().min(5, "Username deve ter pelo menos 5 caracteres"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de Senha é obrigatória"),
}).refine(data => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
});

export type EmployeeFormType = z.infer<typeof employeeSchema>;

// --- FUNÇÕES UTILIÁRIAS PURAS ---

// Função para formatar o CPF (do seu código)
export const formatCPF = (cpf: string): string => {
    const clean = cpf.replace(/\D/g, '').slice(0, 11);
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
};

// Função para formatar o PIS
export const formatPIS = (pis: string): string => {
    const clean = pis.replace(/\D/g, '').slice(0, 11);
    return clean.replace(/^(\d{3})(\d{5})(\d{2})(\d{1})$/, "$1.$2.$3-$4");
};

// Função para limpar strings (deixa apenas números)
export const cleanNumberString = (value: string | undefined): string => (value || '').replace(/\D/g, '');
