import { useCallback } from "react";
import { BarChart3, Briefcase, FileUp, MessageSquareWarning, Shield, TimerReset } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import DashboardHero from "./DashboardHero";
import DashboardMetricStrip from "./DashboardMetricStrip";
import DashboardProfilePanel from "./DashboardProfilePanel";
import DashboardNoticeList from "./DashboardNoticeList";
import DashboardPendingPanel from "./DashboardPendingPanel";
import DashboardMobileActionCard from "./DashboardMobileActionCard";
import DashboardMobileBottomNav from "./DashboardMobileBottomNav";
import DashboardTodayPanel from "./DashboardTodayPanel";
import type {
  DashboardCommandCenterActions,
  DashboardCommandCenterData,
} from "./dashboard-command-center.types";

const PENDING_PANEL_ID = "dashboard-pending-panel";
const NOTICES_ID = "dashboard-notices";

interface DashboardMobileProps {
  data: DashboardCommandCenterData;
  actions: DashboardCommandCenterActions;
}

const DashboardMobile = ({ data, actions }: DashboardMobileProps) => {
  const handleScrollToNotices = useCallback(() => {
    const target = document.getElementById(NOTICES_ID);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-24">
      <DashboardHero
        variant="mobile"
        isLoading={data.isLoading}
        profileUnavailable={data.profileUnavailable}
        fullName={data.userData?.fullName}
        roleLabel={data.roleLabel}
      />

      <DashboardMetricStrip
        variant="mobile"
        data={data}
        onDocumentosClick={actions.goToDocumentos}
        onEspelhoPontoClick={actions.goToEspelhoPonto}
        onWarningClick={handleScrollToNotices}
        onProfileClick={actions.goToPerfil}
        onAdministracaoClick={actions.goToAdministracao}
        onEnviarDocumentoClick={actions.goToEnviarDocumentoColaborador}
        onEmpresaClick={actions.goToEmpresa}
      />

      <DashboardTodayPanel
        variant="mobile"
        onOpenMirror={actions.goToEspelhoPonto}
        onOpenReport={actions.goToRelatorio}
      />

      <div className="space-y-3">
        <DashboardMobileActionCard
          icon={FileUp}
          label="Documentos"
          title="Enviar arquivo"
          description="Envie um documento para um colaborador."
          toneClass="bg-[#EFF6FF]"
          textClass="text-[#1D4ED8]"
          onClick={actions.goToEnviarDocumentoColaborador}
        />
        <DashboardMobileActionCard
          icon={BarChart3}
          label="Relatório"
          title="Abrir relatório"
          description="Acesse o relatório detalhado de horas."
          toneClass="bg-[#EFF6FF]"
          textClass="text-[#1D4ED8]"
          onClick={actions.goToRelatorio}
        />
        <DashboardMobileActionCard
          icon={TimerReset}
          label="Solicitar"
          title="Solicitar abono"
          description="Registre um esquecimento ou ajuste de ponto."
          toneClass="bg-[#EDE9FE]"
          textClass="text-[#5B21B6]"
          onClick={actions.goToSolicitarAbono}
        />
        {data.isCto ? (
          <DashboardMobileActionCard
            icon={Briefcase}
            label="Administração"
            title="Empresa"
            description="Gerencie dados institucionais"
            toneClass="bg-[#CCFBF1]"
            textClass="text-[#0F766E]"
            onClick={actions.goToEmpresa}
          />
        ) : null}
        {data.isPartner ? (
          <DashboardMobileActionCard
            icon={FileUp}
            label="Documentos"
            title="Enviar documento"
            description="Envie um documento pessoal"
            toneClass="bg-[#EDE9FE]"
            textClass="text-[#5B21B6]"
            onClick={actions.goToEnviarDocumentoColaborador}
          />
        ) : null}
        {data.isManager || data.isCto ? (
          <DashboardMobileActionCard
            icon={Shield}
            label="Administração"
            title="Painel administrativo"
            description="Colaboradores, folha, férias, abonos, auditoria e LGPD"
            toneClass="bg-[#EFF6FF]"
            textClass="text-[#1D4ED8]"
            onClick={actions.goToAdministracao}
          />
        ) : null}
      </div>

      {data.newWarnings.length > 0 ? (
        <Card
          className="overflow-hidden border-[#FCD34D]/70 bg-[#FEF3C7] shadow-sm"
          role="button"
          tabIndex={0}
          onClick={() => void data.handleWarningClick()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              void data.handleWarningClick();
            }
          }}
          aria-label={`Você possui ${data.newWarnings.length} aviso(s) para ler`}
        >
          <CardContent className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/15 text-[#92400E]"
            >
              <MessageSquareWarning className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#92400E]">Avisos pendentes de leitura</p>
              <p className="text-xs text-[#92400E]/80">
                Toque para abrir e marcar como visualizados.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}


      <div id={NOTICES_ID} className="scroll-mt-24">
        <DashboardNoticeList
          warnings={data.newWarnings}
          isManager={data.isManager}
          onOpenWarnings={() => void data.handleWarningClick()}
          onCreateWarning={actions.goToCriarAviso}
        />
      </div>

      <div id={PENDING_PANEL_ID} className="scroll-mt-24">
        <DashboardPendingPanel
          data={data}
          onApprovalClick={actions.goToApuracaoHoras}
          onVacationApprovalClick={actions.goToFerias}
          onTimeOffApprovalClick={actions.goToAprovacoesAbono}
          onMeusDocumentos={actions.goToMeusDocumentos}
          onEnviarDocumento={actions.goToEnviarDocumentoColaborador}
          onSolicitarFerias={actions.goToSolicitarFerias}
          onSolicitarAbono={actions.goToSolicitarAbono}
        />
      </div>

      <DashboardProfilePanel
        variant="mobile"
        data={data}
        onOpenProfile={actions.goToPerfil}
        onOpenEmpresa={data.isCto ? actions.goToEmpresa : undefined}
      />

      <DashboardMobileBottomNav
        activeKey="home"
        newWarnings={data.newWarnings.length}
        onHome={actions.goToDashboard}
        onPonto={actions.goToEspelhoPonto}
        onAvisos={() => void data.handleWarningClick()}
        onPerfil={actions.goToPerfil}
      />
    </div>
  );
};

export default DashboardMobile;
