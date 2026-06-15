import { useCallback, type ReactNode } from "react";
import { ChevronLeft, Download, Fingerprint, FilePlus2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import BiometricConsentCard from "@/components/privacy/BiometricConsentCard";
import ConsentHistoryCard from "@/components/privacy/ConsentHistoryCard";
import LgpdRequestForm from "@/components/privacy/LgpdRequestForm";
import PrivacyHero from "./PrivacyHero";
import PrivacyMetricStrip from "./PrivacyMetricStrip";
import PrivacyActionCard from "./PrivacyActionCard";
import PrivacyRecentRequests from "./PrivacyRecentRequests";
import PrivacyGovernancePanel from "./PrivacyGovernancePanel";

interface PrivacyDesktopProps {
  userName?: string;
  totalRights: number;
  totalRequests: number;
  isLoadingRequests: boolean;
  refreshKey: number;
  isExporting: boolean;
  onExport: () => void;
  onRequestSuccess: () => void;
  onBack: () => void;
  exportManifestSlot?: ReactNode;
}

const REQUEST_CARD_ID = "nova-solicitacao-lgpd";

const PrivacyDesktop = ({
  userName,
  totalRights,
  totalRequests,
  isLoadingRequests,
  refreshKey,
  isExporting,
  onExport,
  onRequestSuccess,
  onBack,
  exportManifestSlot,
}: PrivacyDesktopProps) => {
  const handleScrollToRequest = useCallback(() => {
    const target = document.getElementById(REQUEST_CARD_ID);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 lg:space-y-8">
      <div className="flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="h-10 gap-1 border-[#D8E2EC] bg-white text-[#102A43] hover:bg-[#F4F6F9]"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao início
        </Button>
      </div>

      <PrivacyHero
        variant="desktop"
        userName={userName}
        onExport={onExport}
        onNewRequest={handleScrollToRequest}
        isExporting={isExporting}
      />

      <PrivacyMetricStrip
        variant="desktop"
        totalRights={totalRights}
        totalRequests={totalRequests}
        isLoadingRequests={isLoadingRequests}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Painel do titular
              </p>
              <h2 className="text-xl font-semibold text-[#0F172A]">
                Ações principais sobre seus dados
              </h2>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <PrivacyActionCard
                icon={Fingerprint}
                label="Consentimento"
                title="Consentimento biométrico"
                description="Aceite, revise ou revogue o uso da sua biometria para ponto e identidade."
                tone="from-[#0D9488] to-[#22D3EE]"
              >
                <BiometricConsentCard />
              </PrivacyActionCard>

              <PrivacyActionCard
                icon={Download}
                label="Portabilidade"
                title="Exportar meus dados"
                description="Baixe uma cópia completa dos seus dados pessoais em formato JSON com manifesto."
                tone="from-[#1E3A8A] to-[#2563EB]"
              >
                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={onExport}
                    disabled={isExporting}
                    className="h-11 w-full gap-1 bg-[#1E3A8A] text-white hover:bg-[#1E40AF]"
                  >
                    <Download className="h-4 w-4" />
                    {isExporting ? "Preparando JSON..." : "Exportar JSON"}
                  </Button>
                  <p className="text-[11px] leading-5 text-[#64748B]">
                    A exportação exige confirmação para evitar downloads acidentais. O arquivo respeita o
                    manifesto retornado pelo backend.
                  </p>
                  {exportManifestSlot ? <div>{exportManifestSlot}</div> : null}
                </div>
              </PrivacyActionCard>

              <PrivacyActionCard
                id={REQUEST_CARD_ID}
                icon={FilePlus2}
                label="Direitos LGPD"
                title="Nova solicitação LGPD"
                description="Acesse, retifique, anonimize ou solicite portabilidade dos seus dados."
                tone="from-[#7C3AED] to-[#A855F7]"
              >
                <LgpdRequestForm onSuccess={onRequestSuccess} />
              </PrivacyActionCard>

              <PrivacyActionCard
                icon={History}
                label="Histórico"
                title="Histórico de termos"
                description="Veja todos os consentimentos que você concedeu ou revogou ao longo do tempo."
                tone="from-[#F59E0B] to-[#FB923C]"
              >
                <ConsentHistoryCard />
              </PrivacyActionCard>
            </div>
          </section>

          <PrivacyRecentRequests refreshKey={refreshKey} />
        </div>

        <PrivacyGovernancePanel className="lg:sticky lg:top-24" />
      </div>
    </div>
  );
};

export default PrivacyDesktop;
