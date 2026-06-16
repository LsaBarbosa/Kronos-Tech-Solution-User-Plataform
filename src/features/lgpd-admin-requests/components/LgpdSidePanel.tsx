import { Building2, CalendarClock, Inbox, ShieldCheck, User, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LgpdRequestAdminListResponse, LgpdRequestStatus } from "@/service/lgpd.service";
import {
  formatLgpdDate,
  getStatusTone,
  getTypeLabel,
  isSensitiveType,
} from "../utils/lgpd-formatters";
import { LgpdSlaBadge } from "./LgpdSlaBadge";
import { LgpdStatusBadge } from "./LgpdStatusBadge";
import { LgpdTypeBadge } from "./LgpdTypeBadge";

interface LgpdSidePanelProps {
  request: LgpdRequestAdminListResponse | null;
  onOpenDetails: (requestId: string) => void;
  variant: "desktop" | "mobile";
}

const TREATMENT_STAGES: { label: string; statuses: LgpdRequestStatus[]; toneActive: string }[] = [
  {
    label: "Aberto",
    statuses: ["OPEN"],
    toneActive: "bg-[#F59E0B] text-white",
  },
  {
    label: "Em análise",
    statuses: ["IN_ANALYSIS"],
    toneActive: "bg-[#2563EB] text-white",
  },
  {
    label: "Controlador",
    statuses: ["WAITING_CONTROLLER"],
    toneActive: "bg-[#1E3A8A] text-white",
  },
  {
    label: "Legal",
    statuses: ["WAITING_LEGAL_REVIEW"],
    toneActive: "bg-[#F59E0B] text-white",
  },
  {
    label: "Resposta",
    statuses: [
      "APPROVED_FOR_EXPORT",
      "WAITING_DATA_SUBJECT",
      "COMPLETED",
      "PARTIALLY_COMPLETED",
      "REJECTED",
      "CANCELLED",
    ],
    toneActive: "bg-[#16A34A] text-white",
  },
];

const getStageIndex = (status: LgpdRequestStatus | null | undefined): number => {
  if (!status) return -1;
  return TREATMENT_STAGES.findIndex((stage) => stage.statuses.includes(status));
};

const NEXT_DECISION_HINT: Partial<Record<LgpdRequestStatus, string>> = {
  OPEN: "Atribuir responsável e iniciar análise.",
  IN_ANALYSIS: "Validar dados e encaminhar ao controlador, se necessário.",
  WAITING_CONTROLLER: "Aguardar resposta do controlador e registrar parecer.",
  WAITING_LEGAL_REVIEW:
    "Validar base legal, solicitar complemento ou avançar para exportação/anonimização.",
  APPROVED_FOR_EXPORT: "Coordenar exportação e registrar entrega ao titular.",
  WAITING_DATA_SUBJECT: "Aguardar manifestação do titular ou encerrar conforme prazo.",
  COMPLETED: "Caso encerrado — manter histórico para auditoria.",
  PARTIALLY_COMPLETED: "Avaliar pendências remanescentes e fechar a operação.",
  REJECTED: "Documentar a justificativa e arquivar.",
  CANCELLED: "Documentar o cancelamento e arquivar.",
};

const EmptyState = ({ variant }: { variant: "desktop" | "mobile" }) => (
  <Card
    className={cn(
      "border border-dashed border-[#E2E8F0] bg-white shadow-none",
      variant === "desktop" && "min-h-[420px]"
    )}
  >
    <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <Inbox className="h-10 w-10 text-[#94A3B8]" />
      <p className="text-sm font-semibold text-[#0F172A]">Nenhuma solicitação selecionada</p>
      <p className="text-xs text-[#64748B]">
        Escolha uma requisição na lista ao lado para visualizar o caso, a linha de tratamento e
        próxima ação.
      </p>
    </CardContent>
  </Card>
);

export const LgpdSidePanel = ({ request, onOpenDetails, variant }: LgpdSidePanelProps) => {
  if (!request) {
    return <EmptyState variant={variant} />;
  }

  const sensitive = isSensitiveType(request.type);
  const tone = getStatusTone(request.status);
  const stageIndex = getStageIndex(request.status as LgpdRequestStatus);
  const nextDecision = NEXT_DECISION_HINT[request.status as LgpdRequestStatus] ?? "—";

  const headerToneClass = request.isOverdue
    ? "border border-[#FECACA] bg-[#FEE2E2]"
    : sensitive
      ? "border border-[#DDD6FE] bg-[#EDE9FE]"
      : "border border-[#E2E8F0] bg-[#F8FAFC]";

  return (
    <Card className="border border-[#E2E8F0] bg-white shadow-[0_10px_30px_rgba(11,18,32,0.08)]">
      <CardContent className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Caso selecionado
          </p>
          <p className="text-lg font-semibold text-[#0F172A]">
            Análise, histórico e próxima transição.
          </p>
        </div>

        <div className={cn("space-y-3 rounded-2xl p-4", headerToneClass)}>
          <div className="space-y-1">
            <p className="text-lg font-bold text-[#0F172A]">
              {request.employeeFullName || "—"}
            </p>
            <p className="text-sm text-[#334155]">
              {getTypeLabel(request.type)} · {tone.label.toLowerCase()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LgpdSlaBadge createdAt={request.createdAt} isOverdue={request.isOverdue} />
            {sensitive ? (
              <Badge className="rounded-full border border-[#DDD6FE] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#5B21B6]">
                <ShieldCheck className="mr-1 h-3 w-3" />
                dados sensíveis
              </Badge>
            ) : null}
            {request.assignedToName ? null : (
              <Badge className="rounded-full border border-[#FCD34D] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#92400E]">
                sem responsável
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3 text-sm text-[#334155]">
          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0F766E]" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Empresa
              </p>
              <p className="text-sm font-medium text-[#0F172A]">
                {request.companyName || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <UserCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Responsável
              </p>
              <p className="text-sm font-medium text-[#0F172A]">
                {request.assignedToName || "Não atribuído"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Criada em
              </p>
              <p className="text-sm font-medium text-[#0F172A]">
                {formatLgpdDate(request.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <User className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E5F]" />
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                Status atual
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <LgpdStatusBadge status={request.status} />
                <LgpdTypeBadge type={request.type} display="label" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
            Linha de tratamento
          </p>
          <div className="grid grid-cols-5 gap-2">
            {TREATMENT_STAGES.map((stage, index) => {
              const isActive = stageIndex === index;
              const isCompleted = stageIndex > index;
              return (
                <div key={stage.label} className="flex flex-col items-center gap-1">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold",
                      isActive && stage.toneActive,
                      !isActive && isCompleted
                        ? "border-[#16A34A] bg-[#DCFCE7] text-[#15803D]"
                        : !isActive && "border-[#E2E8F0] bg-white text-[#94A3B8]"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "text-center text-[10px] uppercase tracking-[0.08em]",
                      isActive ? "font-semibold text-[#0F172A]" : "text-[#64748B]"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-[#FCD34D] bg-[#FEF3C7] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#92400E]">
            Próxima decisão
          </p>
          <p className="text-sm text-[#92400E]">{nextDecision}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            onClick={() => onOpenDetails(request.requestId)}
            className="h-11 gap-2 rounded-2xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8]"
          >
            Abrir detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LgpdSidePanel;
