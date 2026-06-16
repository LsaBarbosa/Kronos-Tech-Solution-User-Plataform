import type { DetailedReportItem } from "@/utils/report-utils";

/**
 * Categorias contábeis usadas no resumo do PDF e nas colunas auxiliares do CSV.
 */
export type EventCategory =
  | "work"
  | "absence"
  | "day_off"
  | "vacation"
  | "time_off"
  | "pending"
  | "implicit_break"
  | "other";

export interface ReportTotals {
  /** Soma de horas trabalhadas (exclui PENDING e IMPLICIT_BREAK). */
  totalWorkedMinutes: number;
  /** Saldo do período (créditos − débitos). */
  totalBalanceMinutes: number;
  /** Apenas saldos positivos somados. */
  positiveMinutes: number;
  /** Apenas saldos negativos somados em valor absoluto. */
  negativeMinutes: number;
  /** Conta por categoria contábil. */
  countsByCategory: Record<EventCategory, number>;
  /** Conta de itens com status PENDING. */
  pendingCount: number;
  /** Conta de itens com geolocalização capturada (lat/lng). */
  geoCount: number;
  /** Conta de itens com documento anexado. */
  documentCount: number;
  /** Total de registros considerados. */
  totalRecords: number;
}

export interface ReportIdentity {
  /** Nome da empresa. */
  companyName: string;
  /** CNPJ da empresa (se disponível no perfil do usuário autenticado e o relatório for self). */
  companyCnpj?: string | null;
  /** Nome do colaborador (do `employeeData`). */
  employeeName: string;
  /** CPF mascarado do colaborador — só quando o relatório é do próprio usuário autenticado. */
  employeeMaskedCpf?: string | null;
  /** Cargo do colaborador — só quando o relatório é do próprio usuário autenticado. */
  employeeJobPosition?: string | null;
  /** Carga horária diária de referência (HH:mm). */
  referenceTime: string;
  /** Identificador interno do colaborador (vem dos registros). */
  employeeId?: string | null;
  /** Indica se a identidade corresponde ao próprio usuário autenticado. */
  isSelfReport: boolean;
}

export interface ReportContext {
  /** Datas selecionadas no filtro (já ordenadas pelo caller, mas o exportador não confia). */
  selectedDates: Date[];
  /** Status filtrados (códigos). */
  selectedStatuses: string[];
  /** Indica `reportActive` enviado para o backend (aprovado/reprovado). */
  reportActive: boolean;
  /** Papel do usuário autenticado. */
  role?: string | null;
  /** Username do gerador do relatório (opcional). */
  generatedByUsername?: string | null;
  /** Data/hora de geração; permite injeção em testes. */
  generatedAt: Date;
}

export interface ReportExportPayload {
  identity: ReportIdentity;
  context: ReportContext;
  records: DetailedReportItem[];
}
