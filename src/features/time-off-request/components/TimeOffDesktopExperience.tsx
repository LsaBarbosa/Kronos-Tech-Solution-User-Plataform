import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Home, UserRound, TimerReset, TreePalm, Shield } from "lucide-react";
import { APP_PATHS } from "@/config/app-routes";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { timeOffRequestTokens } from "../styles/timeOffRequest.tokens";
import type { TimeOffRequestViewModel } from "../types";
import TimeOffHero from "./TimeOffHero";
import TimeOffTypeSelector from "./TimeOffTypeSelector";
import TimeOffDateTimeFields from "./TimeOffDateTimeFields";
import TimeOffManagerSelector from "./TimeOffManagerSelector";
import TimeOffEvidenceUploader from "./TimeOffEvidenceUploader";
import TimeOffApprovalSummary from "./TimeOffApprovalSummary";
import TimeOffOperationalChecklist from "./TimeOffOperationalChecklist";
import { formatTimeOffTypeLabel } from "../utils/timeOffFormatting";

interface TimeOffDesktopExperienceProps {
  viewModel: TimeOffRequestViewModel;
}

const railItems = [
  { label: "Início", icon: Home, path: APP_PATHS.dashboard },
  { label: "Usuário", icon: UserRound, path: APP_PATHS.usuario },
  { label: "Solicitar férias", icon: TreePalm, path: APP_PATHS.solicitarFerias },
  { label: "Solicitar abono", icon: TimerReset, path: APP_PATHS.solicitarAbono, active: true },
  { label: "Privacidade", icon: Shield, path: APP_PATHS.privacidade },
] as const;

const TimeOffDesktopExperience = ({ viewModel }: TimeOffDesktopExperienceProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [policyOpen, setPolicyOpen] = useState(false);

  const sessionName = user?.profile?.fullName ?? user?.account.username ?? "Sessão ativa";
  const sessionRole = user?.role ?? "Usuário";
  const initials = useMemo(
    () =>
      sessionName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase() || "K",
    [sessionName]
  );

  const metrics = [
    {
      label: "Tipo",
      value: viewModel.selectedTypeOption?.label ?? "Selecione",
      helper: viewModel.selectedTypeOption?.description ?? "Escolha o tipo de solicitação.",
    },
    {
      label: "Destino",
      value: viewModel.selectedManager?.username ? viewModel.selectedManager.username : "Gestor responsável",
      helper: "Manager responsável pela aprovação.",
    },
    {
      label: "Anexo",
      value: viewModel.documentSummary ? viewModel.documentSummary.statusLabel : "Opcional",
      helper: "Evidência protegida e validada.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-[#102A43]" style={{ background: timeOffRequestTokens.gradients.screen }}>
      <div className="absolute inset-0">
        <div className="absolute left-[-5rem] top-[-4rem] h-72 w-72 rounded-full bg-[#22B8CF]/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-32 h-96 w-96 rounded-full bg-[#1F4E5F]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#635BFF]/8 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[96px] shrink-0 flex-col border-r border-white/40 bg-[#102A43] py-4 text-white shadow-[0_24px_72px_rgba(16,42,67,0.26)] xl:flex">
          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#22B8CF] text-lg font-semibold text-[#102A43] shadow-[0_16px_40px_rgba(34,184,207,0.28)]">
              K
            </div>
          </div>

          <div className="mt-8 flex flex-1 flex-col items-center gap-3 px-2">
            {railItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-[18px] border transition-colors",
                    item.active
                      ? "border-[#22B8CF] bg-[#1F4E5F] text-white shadow-[0_12px_30px_rgba(31,78,95,0.36)]"
                      : "border-white/10 bg-white/5 text-[#D9E2EB] hover:border-white/20 hover:bg-white/10 hover:text-white"
                  )}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center pb-4">
            <button
              type="button"
              onClick={() => navigate(APP_PATHS.dashboard)}
              className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-white/5 text-[#D9E2EB] transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
              title="Voltar ao início"
              aria-label="Voltar ao início"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-[#B3C2D0]/70 bg-white/88 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#627D98]">Kronos / Jornada / Solicitar abono</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102A43] text-sm font-semibold text-white">
                    K
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-[#102A43]">Formalize uma justificativa de jornada</p>
                    <p className="text-sm text-[#627D98]">Fluxo corporativo com evidência protegida e revisão gerencial</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="border-[#B8E4D2] bg-[#EAF9F3] text-[#166534]">
                  <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                  Evidência protegida
                </Badge>
                <div className="flex items-center gap-3 rounded-full border border-[#D8E2EC] bg-white px-3 py-2 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F4E5F] text-sm font-semibold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#102A43]">{sessionName}</p>
                    <p className="truncate text-xs uppercase tracking-[0.18em] text-[#627D98]">{sessionRole}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 border-[#D8E2EC] bg-white text-[#102A43]"
                  onClick={() => navigate(APP_PATHS.dashboard)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao início
                </Button>
              </div>
            </div>
          </header>

          <main className="relative mx-auto max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8">
            <TimeOffHero
              badgeLabel="Solicitação de abono / esquecimento"
              title="Formalize uma justificativa de jornada"
              subtitle="Escolha o tipo, preencha período e gestor, anexe uma evidência opcional e envie para aprovação."
              metrics={metrics}
              primaryActionLabel="Ver política de anexo"
              secondaryActionLabel="Ir para revisão"
              onPrimaryAction={() => setPolicyOpen(true)}
              onSecondaryAction={() => document.getElementById("timeoff-review-panel")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />

            {viewModel.successTimeRecordId ? (
              <div className="mt-6 rounded-[24px] border border-[#B8E4D2] bg-[#EAF9F3] p-4 text-sm leading-6 text-[#166534] shadow-[0_16px_40px_rgba(22,163,74,0.12)]">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4" />
                  <p>
                    Solicitação enviada para análise. Cada dia do período será registrado para aprovação.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr),minmax(360px,0.95fr)]">
              <div className="space-y-6">
                <TimeOffTypeSelector
                  value={viewModel.requestType}
                  onChange={viewModel.setRequestType}
                  validationMessage={viewModel.validationResult.fieldErrors.requestType}
                />
                <TimeOffDateTimeFields
                  startDate={viewModel.startDate}
                  endDate={viewModel.endDate}
                  startHour={viewModel.startHour}
                  endHour={viewModel.endHour}
                  periodSummary={viewModel.periodSummary}
                  validationMessage={viewModel.validationMessage}
                  onStartDateChange={viewModel.setStartDate}
                  onEndDateChange={viewModel.setEndDate}
                  onStartHourChange={viewModel.setStartHour}
                  onEndHourChange={viewModel.setEndHour}
                />
                <TimeOffManagerSelector
                  managerOptions={viewModel.managerOptions}
                  managerId={viewModel.managerId}
                  selectedManager={viewModel.selectedManager}
                  isLoadingManagers={viewModel.isLoadingManagers}
                  managerErrorMessage={viewModel.managerErrorMessage}
                  onManagerChange={viewModel.setManagerId}
                />
                <TimeOffEvidenceUploader
                  document={viewModel.document}
                  documentSummary={viewModel.documentSummary}
                  documentError={viewModel.documentError}
                  isPreparingDocument={viewModel.isPreparingDocument}
                  isSubmitting={viewModel.isSubmitting}
                  onDocumentChange={viewModel.setDocument}
                  onClearDocument={viewModel.clearDocument}
                  onOpenPolicy={() => setPolicyOpen(true)}
                />
                <TimeOffOperationalChecklist
                  onOpenAttachmentPolicy={() => setPolicyOpen(true)}
                />
              </div>

              <div id="timeoff-review-panel" className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                <TimeOffApprovalSummary
                  periodSummary={viewModel.periodSummary}
                  requestTypeLabel={formatTimeOffTypeLabel(viewModel.requestType)}
                  manager={viewModel.selectedManager}
                  documentSummary={viewModel.documentSummary}
                  validationMessage={viewModel.validationMessage}
                  submitErrorMessage={viewModel.submitErrorMessage}
                  successTimeRecordId={viewModel.successTimeRecordId}
                  canSubmit={viewModel.canSubmit}
                  isSubmitting={viewModel.isSubmitting}
                  onSubmit={viewModel.submit}
                  onReset={viewModel.reset}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="max-w-lg rounded-[28px] border-[#D8E2EC] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#102A43]">Política de anexo</DialogTitle>
            <DialogDescription className="text-[#627D98]">
              O anexo complementa a justificativa e permanece restrito ao fluxo de análise.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-[#627D98]">
            <p>• Formatos aceitos: PDF, JPG, JPEG ou PNG.</p>
            <p>• Tamanho máximo: 5 MB.</p>
            <p>• Evidência protegida: o arquivo é processado apenas para análise gerencial.</p>
            <p>• Não anexar biometria facial, senha ou dados desnecessários.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeOffDesktopExperience;
