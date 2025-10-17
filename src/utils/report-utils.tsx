// src/utils/report-utils.ts

import { z } from "zod";
import { API_BASE_URL } from "@/config/api"; // Mantenha a importação da API
import { format } from "date-fns"; // Importado para uso interno

// --- Interfaces ---

export interface BreakRecordResponse {
    timeRecordId: number;
    startWork: string;
    startHour: string;
    endWork: string;
    endHour: string;
    hoursBreak: string;
    statusRecord: string;
}

export interface DetailedReportItem {
    id?: string;
    timeRecordId?: number;
    startWork: string; // DD-MM-YYYY
    startHour: string; // HH:MM
    endWork: string; // DD-MM-YYYY
    endHour: string; // HH:MM
    hoursWork: string; // Horas Trabalhadas Efetivas (descontando pausas)
    balance: string;
    statusRecord: string;
    edited: boolean;
    active: boolean;
    employeeId: string;
    employeeData: {
        employeeName: string;
        companyName: string;
    };
    breaks: BreakRecordResponse[];
}

export interface ReportDay {
    startDate: string; // DD/MM/YYYY
    totalHours: string;
    totalBreakHours: string;
    balance: string;
}

export interface ReportDataSimple {
    totalHoursWorked: string;
    totalBreakHours: string;
    totalBalance: string;
    days: ReportDay[];
    employeeName?: string;
    companyName?: string;
}

export interface Employee {
    employeeId: string;
    fullName: string;
}

export interface Manager {
    id: string;
    name: string;
}

// NOVO: Interface para a solicitação pendente com os campos JSON
export interface PendingApproval {
  timeRecordId: number;
  partnerName: string;
  managerUsername: string;
  newStartWork: string;
  newEndWork: string;
  currentStartWork: string;
  currentEndWork: string;
  oldBreakRecordsJson: string; // NOVO CAMPO
  newBreakRecordsJson: string; // NOVO CAMPO
}

// NOVO: Interface para os dados de Pausa na submissão (equivalente ao BreakUpdateData em Java)
export interface BreakSubmissionData {
    breakRecordId?: number; 
    startDate: string; // Data no formato DD-MM-YYYY (para o Java)
    endDate?: string;  // Data no formato DD-MM-YYYY (para o Java)
    startHour: string; // Hora no formato HH:MM
    endHour?: string;  // Hora no formato HH:MM
    delete?: boolean; // Para marcar a pausa como inativa/deletada
}

export interface BreakEditItem {
    id: string; // Usado para keys no React
    breakRecordId?: number; // ID da pausa (Long) para rastreamento
    startDate: string; // data no formato YYYY-MM-DD
    startHour: string; // hora no formato HH:MM
    endDate: string; // data no formato YYYY-MM-DD
    endHour: string; // hora no formato HH:MM
    status: string; // BREAK ou BREAK_IN_PROGRESS
    delete?: boolean; // NOVO CAMPO
}

// --- Zod Schema e Tipos ---

export const editRecordSchema = z.object({
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de fim é obrigatória"),
    startHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    endHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    managerId: z.string().min(1, "Administrador é obrigatório"),
});

export type EditRecordFormData = z.infer<typeof editRecordSchema>;


// --- Constantes ---

export const statusOptions = [
    { value: "CREATED", label: "Criado" },
    { value: "PENDING", label: "Saída Pendente" },
    { value: "UPDATED", label: "Atualizado por ADM" },
    { value: "UPDATE_REJECTED", label: "Atualização Rejeitada Por ADM" },
    { value: "DAY_OFF", label: "Folga" },
    { value: "ABSENCE", label: "Falta" },
    { value: "PENDING_APPROVAL", label: "Aguardando Aprovação" },
    { value: "DOCTOR_APPOINTMENT", label: "Consulta Médica" },
];

// --- Funções Auxiliares ---

export const decodeToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(payload);
    } catch (error) {
        console.error("Failed to decode token", error);
        return null;
    }
};

const getEasterDate = (year: number): Date => {
    const f = Math.floor;
    const G = year % 19;
    const C = f(year / 100);
    const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
    const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
    const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
    const L = I - J;
    const month = 3 + f((L + 40) / 44);
    const day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day);
};

export const getBrazilianHolidays = (year: number): Date[] => {
    const holidays = [];

    holidays.push(new Date(year, 0, 1)); // Ano Novo
    holidays.push(new Date(year, 3, 21)); // Tiradentes
    holidays.push(new Date(year, 4, 1)); // Dia do Trabalho
    holidays.push(new Date(year, 8, 7)); // Independência
    holidays.push(new Date(year, 9, 12)); // N. Sra. Aparecida
    holidays.push(new Date(year, 10, 2)); // Finados
    holidays.push(new Date(year, 10, 15)); // Proclamação da República
    holidays.push(new Date(year, 11, 25)); // Natal

    const easter = getEasterDate(year);
    const carnival = new Date(easter);
    carnival.setDate(easter.getDate() - 47); // Carnaval
    holidays.push(carnival);

    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2); // Sexta-feira Santa
    holidays.push(goodFriday);

    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60); // Corpus Christi
    holidays.push(corpusChristi);

    return holidays;
};

const currentYear = new Date().getFullYear();
export const allHolidays = [
    ...getBrazilianHolidays(currentYear),
    ...getBrazilianHolidays(currentYear + 1)
];

export const isHoliday = (date: Date): boolean => {
    return allHolidays.some(holiday =>
        holiday.toDateString() === date.toDateString()
    );
};

export const transformBreakData = (breaks: BreakRecordResponse[]): BreakEditItem[] => {
    const transformDate = (dateString: string): string => {
        if (!dateString) return "";
        // Converte de DD-MM-YYYY para YYYY-MM-DD
        const [day, month, year] = dateString.split('-');
        if (day && month && year) return `${year}-${month}-${day}`;
        return dateString;
    };

    return breaks.map((b, index) => ({
        id: `break-${b.timeRecordId}-${index}`, // ID Único mais robusto
        breakRecordId: b.timeRecordId, // Mapeado para o ID da Pausa (Long)
        startDate: transformDate(b.startWork),
        startHour: b.startHour,
        endDate: transformDate(b.endWork),
        endHour: b.endHour,
        status: b.statusRecord,
        delete: false, // Default
    }));
};

// NOVO: Função para mapear BreakEditItem[] (usado no form) para BreakSubmissionData[] (usado no PUT)
export const mapEditBreaksToSubmission = (editBreaks: BreakEditItem[]): BreakSubmissionData[] => {
    // Função para converter YYYY-MM-DD (Input Date) para DD-MM-YYYY (Formato Java esperado)
    const formatDateForJava = (dateString: string | undefined): string | undefined => {
        if (!dateString) return undefined;
        const parts = dateString.split('-'); // [YYYY, MM, DD]
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
    };

    return editBreaks.map(b => ({
        // Novo registro (sem ID) ou registro existente (com ID)
        breakRecordId: b.breakRecordId,
        
        // Datas e horas
        startDate: formatDateForJava(b.startDate) || '',
        // Se estiver em andamento ou deletado, não enviamos endDate/endHour
        endDate: b.status !== 'BREAK_IN_PROGRESS' && !b.delete && b.endDate ? formatDateForJava(b.endDate) : undefined,
        startHour: b.startHour,
        endHour: b.status !== 'BREAK_IN_PROGRESS' && !b.delete && b.endHour ? b.endHour : undefined,

        // Flag de deleção
        delete: b.delete || false,
    }));
};


export const getStatusColor = (status: string) => {
    const baseClass = "text-white";
    switch (status) {
        case "CREATED": return `${baseClass} bg-green-600`;
        case "PENDING": return `${baseClass} bg-yellow-600`;
        case "ABSENCE": return `${baseClass} bg-red-600`;
        default: return `${baseClass} bg-primary`;
    }
};

export const getTranslatedStatus = (statusValue: string): string => {
    if (statusValue === 'BREAK') return 'Pausa Concluída';
    if (statusValue === 'BREAK_IN_PROGRESS') return 'Pausa em Andamento';
    return statusOptions.find(opt => opt.value === statusValue)?.label || statusValue;
};