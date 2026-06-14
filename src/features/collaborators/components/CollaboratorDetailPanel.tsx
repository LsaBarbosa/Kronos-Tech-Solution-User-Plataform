import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Fingerprint, Power, ShieldCheck, User, UserCircle, BriefcaseBusiness } from "lucide-react";
import type { CollaboratorEditorDraft, CollaboratorRecord } from "../types/collaborator-view.types";
import { CollaboratorEditForm } from "./CollaboratorEditForm";
import { collaboratorTokens } from "../styles/collaborator.tokens";
import { formatAddress, formatCurrency, formatPhone, getToneClass } from "../utils/collaborator-formatters";

type CollaboratorDetailPanelProps = {
  record: CollaboratorRecord | null;
  isEditing: boolean;
  draft: CollaboratorEditorDraft | null;
  isSaving: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
  onChangeDraft: <K extends keyof CollaboratorEditorDraft>(field: K, value: CollaboratorEditorDraft[K]) => void;
  onRequestToggle: () => void;
  onOpenBiometric: () => void;
  compact?: boolean;
};

const LabelValue = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="min-w-0 rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
    <div className="text-xs uppercase tracking-[0.16em] text-[#64748B]">{label}</div>
    <div className="mt-1 break-words text-sm font-medium leading-5 text-[#0F172A]">{value}</div>
  </div>
);

export const CollaboratorDetailPanel = ({
  record,
  isEditing,
  draft,
  isSaving,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onChangeDraft,
  onRequestToggle,
  onOpenBiometric,
  compact,
}: CollaboratorDetailPanelProps) => {
  if (!record) {
    return (
      <Card className={cn(compact ? "" : "sticky top-6", "rounded-[28px] border border-[#E2E8F0] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]")}>
        <CardContent className="flex min-h-[520px] items-center justify-center px-6 py-10 text-center">
          <div className="max-w-sm space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FB] text-[#2563EB]">
              <UserCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-[#0F172A]">Selecione um colaborador</h3>
            <p className="text-sm text-[#64748B]">
              Escolha uma linha da tabela para ver detalhes, editar dados e acessar ações sensíveis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEditing && draft) {
    return (
      <Card className={cn(compact ? "" : "sticky top-6", "rounded-[28px] border border-[#CBD5E1] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]")}>
        <CardContent className={cn("p-5", compact ? "p-4" : "p-6")}>
          <CollaboratorEditForm
            record={record}
            draft={draft}
            isSaving={isSaving}
            onChange={onChangeDraft}
            onSave={onSaveEditing}
            onCancel={onCancelEditing}
          />
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className={cn(compact ? "" : "sticky top-6", "w-full min-w-0 overflow-hidden rounded-[28px] border border-[#CBD5E1] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]")}>
      <div
        className="px-5 py-5 text-white"
        style={{ background: collaboratorTokens.gradients.hero }}
      >
        <div className="flex min-w-0 items-start gap-4">
          <Avatar className="h-12 w-12 border border-white/20 bg-white/10">
            <AvatarFallback className="bg-white/10 text-base font-semibold text-white">
              {record.initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/20 bg-white/12 text-white hover:bg-white/12">{record.roleLabel}</Badge>
              <Badge className={cn("border", record.active ? "border-emerald-300/30 bg-emerald-500/18 text-white" : "border-rose-300/30 bg-rose-500/18 text-white")}>
                {record.active ? "Ativo" : "Inativo"}
              </Badge>
              <Badge className={cn("border", record.homeOffice ? "border-cyan-300/30 bg-cyan-500/15 text-white" : "border-white/20 bg-white/10 text-white")}>
                {record.homeOffice ? "Home office" : "Presencial"}
              </Badge>
              <Badge className={cn("border", getToneClass(record.biometricTone))}>
                {record.biometricLabel}
              </Badge>
            </div>

            <h2 className="mt-3 break-words text-xl font-semibold leading-tight">{record.fullName}</h2>
            <p className="break-words text-sm text-white/80">{record.jobPosition}</p>
            <p className="mt-2 break-words text-sm text-white/70">{record.detailSummary}</p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <LabelValue label="Conta" value={record.hasAccount ? record.username : "Conta sem usuário"} />
          <LabelValue label="Local" value={record.companyName || "Empresa não informada"} />
          <LabelValue label="Jornada" value={record.scheduleLabel} />
          <LabelValue label="Biometria" value={record.biometricLabel} />
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <LabelValue label="CPF" value={record.maskedCpf} />
          <LabelValue label="PIS" value={record.pis || "—"} />
          <LabelValue label="Salário" value={formatCurrency(record.salary)} />
          <LabelValue label="E-mail" value={record.email} />
          <LabelValue label="Telefone" value={formatPhone(record.phone)} />
          <LabelValue label="Endereço" value={formatAddress(record.address)} />
        </div>

        <div className="rounded-[22px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1E3A8A]">
            <BriefcaseBusiness className="h-4 w-4" />
            Jornada e escala
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <LabelValue label="Entrada" value={record.workStartTime ?? "—"} />
            <LabelValue label="Saída" value={record.workEndTime ?? "—"} />
            <LabelValue label="Intervalo" value={`${record.breakStartTime ?? "—"} até ${record.breakEndTime ?? "—"}`} />
            <LabelValue label="Folga" value={record.preferredDayOff ?? "—"} />
          </div>
        </div>

        <div className="rounded-[22px] border border-[#CBD5E1] bg-[#EEF4FB] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1E3A8A]">
            <ShieldCheck className="h-4 w-4" />
            Ações sensíveis
          </div>
          <p className="break-words text-sm text-[#64748B]">
            Edição de dados, troca de status e biometria precisam manter rastreabilidade e confirmação.
          </p>
          <div className="mt-4 grid gap-3">
            <Button
              type="button"
              onClick={onStartEditing}
              className="h-auto min-h-11 w-full justify-start rounded-full bg-[#2563EB] px-4 py-3 text-left leading-5 hover:bg-[#1E3A8A]"
            >
              <User className="mr-2 h-4 w-4" />
              <span className="min-w-0 whitespace-normal break-words">Editar cadastro</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onRequestToggle}
              className={cn(
                "h-auto min-h-11 w-full justify-start rounded-full border-[#CBD5E1] px-4 py-3 text-left leading-5",
                record.active ? "text-[#DC2626]" : "text-[#16A34A]"
              )}
            >
              <Power className="mr-2 h-4 w-4" />
              <span className="min-w-0 whitespace-normal break-words">
                {record.active ? "Desativar acesso" : "Reativar acesso"}
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onOpenBiometric}
              className="h-auto min-h-11 w-full justify-start rounded-full border-[#CBD5E1] px-4 py-3 text-left leading-5 text-[#1E3A8A]"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              <span className="min-w-0 whitespace-normal break-words">Biometria</span>
            </Button>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <LabelValue label="Usuário" value={record.hasAccount ? record.username : "Conta sem usuário"} />
          <LabelValue label="Perfil" value={record.roleLabel} />
        </div>
      </CardContent>
    </Card>
  );
};
