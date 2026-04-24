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
    fullName: string;
    cpf: string;
    email: string;
    phone: string;
    salary: number;
    jobPosition: string;
    homeOffice: boolean;
    address: {
        postalCode: string;
        number: string;
    };
    workStartTime: string;
    workEndTime: string;
    breakStartTime: string;
    breakEndTime: string;
    scheduleType: string;
    scaleStartDate: string | null;
    preferredDayOff: string | null;
    weekendOffIndex: number | null;
    fixedWorkDays: string[];
}

// --- ESQUEMAS DE VALIDAÇÃO (CENTRALIZADOS) ---

// Esquema para validação rigorosa dos campos de Colaborador/Manager
export const employeeSchema = z.object({
    fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    cpf: z.string().length(11, "CPF deve ter 11 dígitos (apenas números)"), 
    email: z.string().email("E-mail inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    salary: z.coerce.number().min(0, "Salário deve ser maior ou igual a zero"),
    jobPosition: z.string().min(2, "Cargo é obrigatório"),
    homeOffice: z.boolean(),
    address: z.object({
        postalCode: z.string().length(8, "CEP deve ter 8 dígitos"),
        number: z.string().min(1, "Número é obrigatório"),
    }),
    workStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    workEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    breakStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    breakEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
    scheduleType: z.string().min(1, "Tipo de escala é obrigatório"),
    scaleStartDate: z.string().nullable(),
    preferredDayOff: z.string().nullable(),
    weekendOffIndex: z.number().nullable(),
    fixedWorkDays: z.array(z.string()),
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
