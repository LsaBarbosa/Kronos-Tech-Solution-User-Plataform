import { Badge } from "@/components/ui/badge";
import type { LgpdRequestStatus, LgpdRequestType } from "@/service/lgpd.service";
import {
  getSlaTone,
  getStatusTone,
  getTypeTone,
} from "@/features/lgpd-admin-requests/utils/lgpd-formatters";
import { cn } from "@/lib/utils";
import { isExportableType } from "../utils/lgpdCaseFormatters";

interface LgpdCaseHeroProps {
  variant: "desktop" | "mobile";
  status: LgpdRequestStatus | string;
  type: LgpdRequestType | string;
  createdAt: string;
  isOverdue?: boolean;
  requestShortCode: string;
  titularName: string;
}

const STATUS_SHORT_LABEL: Record<string, string> = {
  OPEN: "Aberta",
  IN_ANALYSIS: "Em análise",
  WAITING_CONTROLLER: "Controlador",
  WAITING_LEGAL_REVIEW: "Revisão legal",
  APPROVED_FOR_EXPORT: "Aprovada",
  WAITING_DATA_SUBJECT: "Titular",
  COMPLETED: "Concluída",
  REJECTED: "Rejeitada",
  PARTIALLY_COMPLETED: "Parcial",
  CANCELLED: "Cancelada",
};

const TYPE_SHORT_LABEL: Record<string, string> = {
  CONFIRM_PROCESSING: "Confirmação",
  ACCESS: "Acesso",
  CORRECTION: "Correção",
  ANONYMIZATION: "Anonimização",
  BLOCKING: "Bloqueio",
  DELETION: "Exclusão",
  PORTABILITY: "Portabilidade",
  CONSENT_REVOCATION: "Revogação",
  SHARING_INFORMATION: "Compartilhamento",
  CONSENT_INFORMATION: "Consentimento",
  OPPOSITION: "Oposição",
  AUTOMATED_DECISION_REVIEW: "Revisão auto.",
};

const getStatusShortLabel = (status: string): string =>
  STATUS_SHORT_LABEL[status] ?? "—";

const getTypeShortLabel = (type: string): string => TYPE_SHORT_LABEL[type] ?? "—";

const HeroKpi = ({
  label,
  value,
  helper,
  toneClass,
  title,
}: {
  label: string;
  value: string;
  helper: string;
  toneClass?: string;
  title?: string;
}) => (
  <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-white">
    <p
      className={cn(
        "text-lg font-bold leading-tight sm:text-xl",
        "break-words [overflow-wrap:anywhere]",
        toneClass
      )}
      title={title ?? value}
    >
      {value}
    </p>
    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
      {label}
    </p>
    <p className="mt-1 text-[10px] leading-4 text-white/55 break-words">{helper}</p>
  </div>
);

export const LgpdCaseHero = ({
  variant,
  status,
  type,
  createdAt,
  isOverdue = false,
  requestShortCode,
  titularName,
}: LgpdCaseHeroProps) => {
  const statusTone = getStatusTone(status);
  const typeTone = getTypeTone(type);
  const sla = getSlaTone(createdAt, isOverdue);
  const exportable = isExportableType(type);
  const statusShort = getStatusShortLabel(String(status));
  const typeShort = getTypeShortLabel(String(type));

  if (variant === "mobile") {
    return (
      <section className="overflow-hidden rounded-[28px] border border-[#101A33] bg-gradient-to-br from-[#0B1220] via-[#101A33] to-[#1E3A8A] p-5 text-white shadow-[0_18px_50px_rgba(11,18,32,0.32)]">
        <div className="space-y-2">
          <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Detalhe LGPD
          </Badge>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
              Solicitação #{requestShortCode}
            </p>
            <h1 className="text-2xl font-bold leading-tight">Caso do titular</h1>
            <p className="text-sm leading-6 text-white/80">
              Análise e próxima decisão para {titularName || "—"}.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#101A33] bg-gradient-to-br from-[#0B1220] via-[#101A33] to-[#1E3A8A] p-6 text-white shadow-[0_18px_50px_rgba(11,18,32,0.32)]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 max-w-3xl space-y-4">
          <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            Detalhes da Solicitação
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Tratamento completo do caso LGPD
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/80">
              Análise, linha do tempo, decisões, exportação revisada, anonimização e notas de auditoria.
            </p>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
            Caso #{requestShortCode}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 xl:w-[520px]">
          <HeroKpi
            label="status"
            value={statusShort}
            helper={statusTone.label.toLowerCase()}
            title={statusTone.label}
            toneClass={sla.isOverdue ? "text-[#FCA5A5]" : undefined}
          />
          <HeroKpi
            label={sla.isOverdue ? "SLA crítico" : "SLA"}
            value={sla.label}
            helper={sla.isOverdue ? "atrasado" : "no prazo"}
            toneClass={sla.isOverdue ? "text-[#FCA5A5]" : "text-[#86EFAC]"}
          />
          <HeroKpi
            label="tipo"
            value={typeShort}
            helper={typeTone.kind === "sensitive" ? "dados sensíveis" : "direito do titular"}
            title={String(type)}
            toneClass={typeTone.kind === "sensitive" ? "text-[#D8B4FE]" : undefined}
          />
          <HeroKpi
            label={exportable ? "exportável" : "fluxo"}
            value={exportable ? "JSON" : "STD"}
            helper={exportable ? "pacote revisado" : "sem exportação"}
            toneClass={exportable ? "text-[#86EFAC]" : undefined}
          />
        </div>
      </div>
    </section>
  );
};

export default LgpdCaseHero;
