import {
  Briefcase,
  ClipboardList,
  Clock,
  FileSignature,
  FileText,
  Fingerprint,
  IdCard,
  Receipt,
  ShieldCheck,
  UserCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { DocumentType } from "@/types/document";

export type DocumentRole = "CTO" | "MANAGER" | "PARTNER" | string;

export interface DocumentScopeCopy {
  badge: string;
  title: string;
  description: string;
  scope: string;
  restriction: string;
  badgeClass: string;
  cardClass: string;
  icon: LucideIcon;
}

export const getDocumentRoleCopy = (role: DocumentRole): DocumentScopeCopy => {
  switch (role) {
    case "CTO":
      return {
        badge: "CTO",
        title: "Visão administrativa",
        description:
          "Escopo amplo: visualize, baixe e remova documentos de qualquer colaborador autorizado.",
        scope: "Todos os colaboradores ativos do tenant.",
        restriction: "Ações destrutivas ficam registradas para auditoria.",
        badgeClass: "bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE]",
        cardClass: "border-[#DDD6FE] bg-[#F5F3FF]",
        icon: ShieldCheck,
      };
    case "MANAGER":
      return {
        badge: "ADM",
        title: "Gestão documental",
        description:
          "Busque documentos do seu time, acompanhe envios e gerencie pendências com controle de escopo.",
        scope: "Colaboradores da equipe / tenant que você administra.",
        restriction: "Exclusão exige confirmação explícita.",
        badgeClass: "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]",
        cardClass: "border-[#BFDBFE] bg-[#EFF6FF]",
        icon: UserCog,
      };
    case "PARTNER":
      return {
        badge: "Colaborador",
        title: "Acervo próprio",
        description:
          "Acesse os documentos vinculados à sua conta: contracheques, comprovantes e termos legais.",
        scope: "Apenas a sua sessão. A seleção de colaborador fica bloqueada.",
        restriction: "Sem permissão para remover documentos.",
        badgeClass: "bg-[#CCFBF1] text-[#115E59] border-[#99F6E4]",
        cardClass: "border-[#99F6E4] bg-[#F0FDFA]",
        icon: IdCard,
      };
    default:
      return {
        badge: role || "Visualização",
        title: "Acesso documental",
        description:
          "Selecione o tipo documental e os filtros disponíveis para consultar o acervo permitido.",
        scope: "Escopo definido pela sua sessão.",
        restriction: "As ações disponíveis dependem da sua permissão.",
        badgeClass: "bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]",
        cardClass: "border-[#E2E8F0] bg-[#F8FAFC]",
        icon: ShieldCheck,
      };
  }
};

export const canManageEmployeeSelection = (role: DocumentRole) =>
  role === "CTO" || role === "MANAGER";

export const canDeleteDocuments = (role: DocumentRole) =>
  role === "CTO" || role === "MANAGER";

export interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}

export const DOCUMENT_TYPE_OPTIONS: DocumentTypeOption[] = [
  {
    value: "PAYSLIP",
    label: "Contracheque",
    shortLabel: "Contracheque",
    description: "Holerites e demonstrativos de pagamento.",
    icon: Receipt,
    tone: "from-[#1E3A8A] to-[#2563EB]",
  },
  {
    value: "TIME_OFF",
    label: "Abono de Horas",
    shortLabel: "Abono",
    description: "Comprovantes e justificativas de abono.",
    icon: Clock,
    tone: "from-[#0D9488] to-[#22D3EE]",
  },
  {
    value: "DOCUMENTS",
    label: "Documentos",
    shortLabel: "Gerais",
    description: "Documentos institucionais e comunicados.",
    icon: FileText,
    tone: "from-[#1E3A8A] to-[#22D3EE]",
  },
  {
    value: "EMPLOYEE_DOCUMENTS",
    label: "Documentos Pessoais",
    shortLabel: "Pessoais",
    description: "Documentação pessoal do colaborador.",
    icon: Briefcase,
    tone: "from-[#7C3AED] to-[#A855F7]",
  },
  {
    value: "POINT_RECORD_RECEIPT",
    label: "Comprovante de Ponto",
    shortLabel: "Ponto",
    description: "Comprovantes oficiais de jornada e ponto.",
    icon: ClipboardList,
    tone: "from-[#1E3A8A] to-[#0D9488]",
  },
  {
    value: "BIOMETRIC_CONSENT_TERM",
    label: "Termo de Consentimento Biométrico",
    shortLabel: "Biometria",
    description: "Consentimentos LGPD para dados biométricos.",
    icon: Fingerprint,
    tone: "from-[#F59E0B] to-[#EF4444]",
  },
  {
    value: "SERVICE_CONTRACT_TERMS",
    label: "Termo de Contrato de Serviço",
    shortLabel: "Contrato",
    description: "Termos contratuais e adendos formais.",
    icon: FileSignature,
    tone: "from-[#7C3AED] to-[#2563EB]",
  },
];

export const findDocumentTypeOption = (
  value: DocumentType | ""
): DocumentTypeOption | undefined =>
  value ? DOCUMENT_TYPE_OPTIONS.find((option) => option.value === value) : undefined;

export const SCOPE_ICON_MAP: Record<"CTO" | "MANAGER" | "PARTNER", LucideIcon> = {
  CTO: ShieldCheck,
  MANAGER: UsersRound,
  PARTNER: IdCard,
};
