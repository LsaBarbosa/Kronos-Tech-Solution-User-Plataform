import { BadgeCheck, FileCode, FileSignature, type LucideIcon } from "lucide-react";

export type FiscalReportType = "AEJ" | "AFD" | "ATESTADO";

export interface FiscalReportDescriptor {
  type: FiscalReportType;
  shortLabel: string;
  title: string;
  subtitle: string;
  description: string;
  format: ".p7s" | ".txt";
  scope: string;
  rule: string;
  buttonLabel: string;
  buttonLoadingLabel: string;
  toneClass: string;
  cardAccent: string;
  badgeClass: string;
  icon: LucideIcon;
  requiresMonth: boolean;
}

export const FISCAL_REPORTS: Record<FiscalReportType, FiscalReportDescriptor> = {
  AEJ: {
    type: "AEJ",
    shortLabel: "AEJ",
    title: "Arquivo Eletrônico de Jornada",
    subtitle: "AEJ · Portaria 671 · assinado",
    description:
      "Exporta os registros de jornada do período selecionado, em formato AEJ assinado para fiscalização.",
    format: ".p7s",
    scope: "Período mensal de referência",
    rule: "Selecione o mês desejado. O backend devolve o arquivo assinado em .p7s.",
    buttonLabel: "Baixar AEJ",
    buttonLoadingLabel: "Gerando AEJ...",
    toneClass: "from-[#1E3A8A] to-[#2563EB]",
    cardAccent: "border-[#2563EB]",
    badgeClass: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    icon: FileSignature,
    requiresMonth: true,
  },
  AFD: {
    type: "AFD",
    shortLabel: "AFD",
    title: "Arquivo Fonte de Dados",
    subtitle: "AFD · Portaria 671 · texto",
    description:
      "Exporta o AFD com os registros oficiais do ponto. Não depende de filtro mensal nesta tela.",
    format: ".txt",
    scope: "Acumulado vigente",
    rule: "Sem filtro mensal obrigatório. O backend devolve o AFD em .txt.",
    buttonLabel: "Baixar AFD",
    buttonLoadingLabel: "Gerando AFD...",
    toneClass: "from-[#0D9488] to-[#22D3EE]",
    cardAccent: "border-[#0D9488]",
    badgeClass: "border-[#99F6E4] bg-[#CCFBF1] text-[#0F766E]",
    icon: FileCode,
    requiresMonth: false,
  },
  ATESTADO: {
    type: "ATESTADO",
    shortLabel: "Atestado",
    title: "Atestado Técnico",
    subtitle: "Documento estático · assinado",
    description:
      "Atestado técnico institucional, válido para fiscalização. Documento estático, sem filtros.",
    format: ".p7s",
    scope: "Documento institucional",
    rule: "Arquivo estático: não depende de mês de referência. Devolvido em .p7s.",
    buttonLabel: "Baixar Atestado",
    buttonLoadingLabel: "Gerando atestado...",
    toneClass: "from-[#7C3AED] to-[#A855F7]",
    cardAccent: "border-[#7C3AED]",
    badgeClass: "border-[#DDD6FE] bg-[#EDE9FE] text-[#5B21B6]",
    icon: BadgeCheck,
    requiresMonth: false,
  },
};

export const FISCAL_REPORT_ORDER: FiscalReportType[] = ["AEJ", "AFD", "ATESTADO"];

export const previewFileName = (type: FiscalReportType, monthRef?: Date): string => {
  if (type === "ATESTADO") return "Atestado_Tecnico.p7s";
  if (type === "AFD") return "AFD.txt";
  if (!monthRef) return "AEJ_<período>.p7s";
  const year = monthRef.getFullYear();
  const month = String(monthRef.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, monthRef.getMonth() + 1, 0).getDate();
  return `AEJ_${year}-${month}-01_${year}-${month}-${String(lastDay).padStart(2, "0")}.p7s`;
};
