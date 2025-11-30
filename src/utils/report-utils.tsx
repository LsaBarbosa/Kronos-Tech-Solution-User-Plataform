// src/utils/report-utils.ts

import { z } from "zod";
import { API_BASE_URL } from "@/config/api";
import { format, parse, isValid } from "date-fns"; // Adicionado 'parse' e 'isValid'
import { ptBR } from 'date-fns/locale'; //
// --- Interfaces ---

// Interface DetailedReportItem simplificada (sem a lista 'breaks')
export interface DetailedReportItem {
    documentDownloadPath: string;
    id?: string;
    timeRecordId?: number;
    startWork: string; // DD-MM-YYYY
    startHour: string; // HH:MM
    endWork: string; // DD-MM-YYYY
    endHour: string; // HH:MM
    hoursWork: string; // Duração (Trabalho ou Pausa)
    balance: string; // Saldo (Apenas para registros de trabalho)
    statusRecord: string;
    edited: boolean;
    active: boolean;
    employeeId: string;
    employeeData: {
        employeeName: string;
        companyName: string;
    };
    latitude?: number;
    longitude?: number;
    endLatitude?: number;
    endLongitude?: number;
}

export interface ReportDay {
    endHour: string;
    startHour: string;
    startDate: string; // DD/MM/YYYY
    totalHours: string;
    totalBreakHours: string;
    balance: string;
}

export interface ReportDataSimple {
    employeeName?: string;
    companyName?: string;
    totalHoursWorked: string;
    totalBreakHours: string;
    totalBalance: string;
    days: ReportDay[];
}

export interface Employee {
    employeeId: string;
    fullName: string;
}

export interface Manager {
    id: string;
    name: string;
}

// Interface simplificada (sem campos de break)
export interface PendingApproval {
  timeRecordId: number;
  partnerName: string;
  managerUsername: string;
  newStartWork: string;
  newEndWork: string;
  currentStartWork: string;
  currentEndWork: string;
  // Campos de Break JSON removidos
}

// Tipo BreakEditItem removido, substituído por um alias que não pode ser instanciado
export type BreakEditItem = never;

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
    { value: "UPDATED", label: "Atualizado por ADM" },
    { value: "DAY_OFF", label: "Folga" },
    { value: "ABSENCE", label: "Falta" },
    { value: "PENDING", label: "Saída Pendente" },
    { value: "TIME_OFF", label: "Horas Abonadas" },
    { value: "VACATION", label: "Férias" },
    { value: "PENDING_APPROVAL", label: "Aguardando Aprovação" },
    { value: "REQUEST_VACATION", label: "Férias Solicitadas" },
    { value: "TIME_OFF_REQUEST", label: "Horas Abonadas Solicitadas" },
    { value: "UPDATE_REJECTED", label: "Atualização Rejeitada Por ADM" },
    { value: "TIME_OFF_REJECTED", label: "Horas Abonadas Rejeitadas" },
    { value: "VACATION_REJECTED", label: "Férias Rejeitadas" },
    { value: "IMPLICIT_BREAK", label: "Pausa (Automática)" }, 
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

const parseDateString = (dateString: string): Date => {
    // Tenta parsear DD/MM/YYYY (Formato de ReportDay)
    let parsedDate = parse(dateString, "dd/MM/yyyy", new Date());
    if (isValid(parsedDate)) return parsedDate;

    // Tenta parsear DD-MM-YYYY (Formato de DetailedReportItem)
    parsedDate = parse(dateString, "dd-MM-yyyy", new Date());
    if (isValid(parsedDate)) return parsedDate;

    return new Date('Invalid Date'); // Retorna data inválida se falhar
};

// NOVO: Função para formatar a data, incluindo o dia da semana por extenso
export const formatDateWithDayOfWeek = (dateString: string): string => {
    const date = parseDateString(dateString);

    if (!isValid(date)) {
        return dateString; // Retorna a string original se for inválida
    }

    // Formato desejado: "Segunda-feira, 01/01/2024"
    // EEEE: dia da semana por extenso.
    return format(date, "EEEE, dd/MM/yyyy", { locale: ptBR });
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

// Funções de Break removidas

export const getStatusColor = (status: string) => {
    const baseClass = "text-white";
    switch (status) {
        case "CREATED": return `${baseClass} bg-green-600`;
        case "PENDING": return `${baseClass} bg-yellow-600`;
        case "ABSENCE": return `${baseClass} bg-red-600`;
        case "IMPLICIT_BREAK": return `${baseClass} bg-gray-500`; // NOVO
        default: return `${baseClass} bg-primary`;
    }
};

export const getTranslatedStatus = (statusValue: string): string => {
    // Traduções antigas de pausa removidas
    return statusOptions.find(opt => opt.value === statusValue)?.label || statusValue;
};