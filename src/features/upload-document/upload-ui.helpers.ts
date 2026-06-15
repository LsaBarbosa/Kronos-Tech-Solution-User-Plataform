import { IdCard, ShieldCheck, UserCog, type LucideIcon } from "lucide-react";

export type UploadRole = "CTO" | "MANAGER" | "PARTNER" | string;

export interface UploadScopeCopy {
  badge: string;
  title: string;
  description: string;
  scope: string;
  restriction: string;
  badgeClass: string;
  cardClass: string;
  icon: LucideIcon;
  accent: string;
}

export const getUploadRoleCopy = (role: UploadRole): UploadScopeCopy => {
  switch (role) {
    case "CTO":
      return {
        badge: "CTO",
        title: "Envio administrativo",
        description:
          "Envie documentos para qualquer colaborador autorizado pelo seu escopo administrativo.",
        scope: "Todos os colaboradores ativos do tenant.",
        restriction: "Cada envio é registrado para auditoria.",
        badgeClass: "bg-[#EDE9FE] text-[#5B21B6] border-[#DDD6FE]",
        cardClass: "border-[#DDD6FE] bg-[#F5F3FF]",
        icon: ShieldCheck,
        accent: "#7C3AED",
      };
    case "MANAGER":
      return {
        badge: "ADM",
        title: "Envio operacional",
        description:
          "Envie documentos pessoais para colaboradores da sua equipe/tenant.",
        scope: "Colaboradores ativos sob sua gestão.",
        restriction: "Exige seleção explícita do destinatário.",
        badgeClass: "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]",
        cardClass: "border-[#BFDBFE] bg-[#EFF6FF]",
        icon: UserCog,
        accent: "#2563EB",
      };
    case "PARTNER":
      return {
        badge: "Colaborador",
        title: "Envio para o próprio perfil",
        description:
          "Você envia documentos pessoais vinculados à sua sessão. O destinatário fica bloqueado.",
        scope: "Apenas a sua conta. Sem seleção de outro colaborador.",
        restriction: "Destino travado: seu próprio perfil.",
        badgeClass: "bg-[#CCFBF1] text-[#115E59] border-[#99F6E4]",
        cardClass: "border-[#99F6E4] bg-[#F0FDFA]",
        icon: IdCard,
        accent: "#0D9488",
      };
    default:
      return {
        badge: role || "Envio",
        title: "Envio documental",
        description:
          "Envie documentos respeitando o seu escopo de permissão.",
        scope: "Escopo definido pela sua sessão.",
        restriction: "As ações disponíveis dependem da sua permissão.",
        badgeClass: "bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]",
        cardClass: "border-[#E2E8F0] bg-[#F8FAFC]",
        icon: ShieldCheck,
        accent: "#2563EB",
      };
  }
};

export const canManageRecipientSelection = (role: UploadRole) =>
  role === "CTO" || role === "MANAGER";

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

export const UPLOAD_LIMIT_BYTES = 5 * 1024 * 1024;
