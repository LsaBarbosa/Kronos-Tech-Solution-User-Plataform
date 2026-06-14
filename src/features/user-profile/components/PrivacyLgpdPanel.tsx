import {
  AlertTriangle,
  FileText,
  Layers3,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import type { UsuarioPrivacySummary } from "@/features/user-profile/mappers/usuario-profile.mapper";
import type { LgpdExportManifest } from "@/types/legal";
import LgpdExportAction from "./LgpdExportAction";
import ConsentEvidenceList from "./ConsentEvidenceList";

interface PrivacyLgpdPanelProps {
  privacy: UsuarioPrivacySummary;
  loading?: boolean;
  isExportingData: boolean;
  isRevokingBiometric: boolean;
  lastExportManifest: LgpdExportManifest | null;
  biometricError?: string | null;
  currentTermError?: string | null;
  consentHistoryError?: string | null;
  processingCatalogError?: string | null;
  onExport: () => Promise<void>;
  onClearExportManifest: () => void;
  onRequestBiometricRevocation: () => void;
}

const SummaryMetric = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-[#D8E2EC] bg-white p-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">{label}</p>
    <p className="mt-1 text-sm font-medium text-[#102A43]">{value}</p>
  </div>
);

const PrivacyLgpdPanel = ({
  privacy,
  loading = false,
  isExportingData,
  isRevokingBiometric,
  lastExportManifest,
  biometricError,
  currentTermError,
  consentHistoryError,
  processingCatalogError,
  onExport,
  onClearExportManifest,
  onRequestBiometricRevocation,
}: PrivacyLgpdPanelProps) => {
  const biometricActive = privacy.biometric.tone === "active";

  return (
    <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg text-[#102A43]">Privacidade, LGPD e biometria</CardTitle>
            <CardDescription className="max-w-2xl text-[#627D98]">
              Central de rastreabilidade com consentimentos, termo atual, catálogo de tratamento e exportação própria.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-[#D8E2EC] bg-[#D9E2EB] text-[#635BFF]">
            <Layers3 className="mr-1 h-3.5 w-3.5" />
            LGPD
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryMetric label="Consentimento biométrico" value={privacy.biometric.label} />
          <SummaryMetric label="Termo atual" value={privacy.currentTerm?.versionLabel ?? "Nao informado"} />
          <SummaryMetric label="Consentimentos" value={`${privacy.consentHistory.length} registros`} />
          <SummaryMetric label="Catálogo ativo" value={`${privacy.processingCatalog.active}/${privacy.processingCatalog.total}`} />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4 text-sm text-[#627D98]">
            Carregando dados de privacidade e LGPD...
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[22px] border border-[#D8E2EC] bg-[#D9E2EB] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#102A43]">Biometria e termo atual</p>
                <p className="text-xs text-[#627D98]">
                  {biometricActive
                    ? "A biometria facial está ativa e pode ser revogada a qualquer momento."
                    : "A biometria está inativa ou aguarda nova aceitação."}
                </p>
              </div>
              <StatusPill variant={privacy.biometric.tone}>{privacy.biometric.label}</StatusPill>
            </div>

            {biometricError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-red-700" aria-hidden="true" />
                  <p>{biometricError}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SummaryMetric label="Aceite registrado" value={privacy.biometric.acceptedVersionLabel} />
              <SummaryMetric label="Versão corrente" value={privacy.biometric.currentVersionLabel} />
              <SummaryMetric label="Hash aceito" value={privacy.biometric.acceptedHashSummary} />
              <SummaryMetric label="Hash corrente" value={privacy.biometric.currentHashSummary} />
            </div>

            <div className="mt-4 rounded-2xl border border-white bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Situação</p>
              <p className="mt-1 text-sm font-medium text-[#102A43]">{privacy.biometric.requiresNewAcceptanceLabel}</p>
              <p className="mt-2 text-sm text-[#627D98]">
                {biometricActive
                  ? "Revogação disponível com confirmação e encerramento de sessão."
                  : "Nenhuma revogação pode ser executada enquanto o consentimento estiver inativo."}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {biometricActive ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11"
                  onClick={onRequestBiometricRevocation}
                  disabled={isRevokingBiometric}
                >
                  <ShieldX className="h-4 w-4" aria-hidden="true" />
                  Revogar biometria
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D8E2EC] bg-white px-3 py-2 text-sm text-[#627D98]">
                  <ShieldCheck className="h-4 w-4 text-[#1C8C7C]" aria-hidden="true" />
                  Biometria sem revogação pendente
                </div>
              )}
            </div>

            {currentTermError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-red-700" aria-hidden="true" />
                  <p>{currentTermError}</p>
                </div>
              </div>
            ) : null}

            {privacy.currentTerm ? (
              <div className="mt-4 rounded-2xl border border-white bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#102A43]">{privacy.currentTerm.title}</p>
                    <p className="text-xs text-[#627D98]">{privacy.currentTerm.documentType}</p>
                  </div>
                  <StatusPill variant={privacy.currentTerm.activeLabel === "Versao ativa" ? "active" : "inactive"}>
                    {privacy.currentTerm.activeLabel}
                  </StatusPill>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <SummaryMetric label="Versão" value={privacy.currentTerm.versionLabel} />
                  <SummaryMetric label="Hash resumido" value={privacy.currentTerm.hashSummary} />
                </div>
                <div className="mt-4 rounded-2xl border border-[#D8E2EC] bg-[#D9E2EB] p-4 text-sm text-[#627D98]">
                  <p className="font-medium text-[#102A43]">Prévia do conteúdo</p>
                  <p className="mt-2 leading-6">{privacy.currentTerm.contentPreview}</p>
                </div>
              </div>
            ) : !loading && !currentTermError ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[#D8E2EC] bg-white p-4">
                <EmptyState
                  compact
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Termo biométrico indisponivel"
                  description="Nenhuma versao atual do termo foi retornada para exibição."
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] border border-[#D8E2EC] bg-[#D9E2EB] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#102A43]">Catálogo de tratamento</p>
                  <p className="text-xs text-[#627D98]">
                    Inventário resumido com ênfase em categorias sensíveis e processos ativos.
                  </p>
                </div>
                <Badge variant="outline" className="border-[#D8E2EC] bg-white text-[#102A43]">
                  <FileText className="mr-1 h-3.5 w-3.5" />
                  {privacy.processingCatalog.total} processos
                </Badge>
              </div>

              {processingCatalogError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-red-700" aria-hidden="true" />
                    <p>{processingCatalogError}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <SummaryMetric label="Ativos" value={`${privacy.processingCatalog.active}`} />
                <SummaryMetric label="Sensíveis" value={`${privacy.processingCatalog.sensitive}`} />
                <SummaryMetric label="Total" value={`${privacy.processingCatalog.total}`} />
              </div>

              {!loading ? (
                privacy.processingCatalog.highlights.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#D8E2EC] bg-white p-4">
                    <EmptyState
                      compact
                      icon={<FileText className="h-5 w-5" />}
                      title="Catálogo sem itens"
                      description="Nenhum processo de tratamento foi carregado para esta conta."
                    />
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {privacy.processingCatalog.highlights.map((item) => (
                      <div key={item.code} className="rounded-2xl border border-[#D8E2EC] bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-[#102A43]">{item.purposeLabel}</p>
                            <p className="text-xs text-[#627D98]">
                              {item.dataCategoryLabel} • {item.retentionPolicyCode}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <StatusPill variant={item.active ? "active" : "inactive"}>
                              {item.active ? "Ativo" : "Inativo"}
                            </StatusPill>
                            <StatusPill variant={item.sensitive ? "warning" : "info"}>
                              {item.sensitive ? "Sensível" : "Não sensível"}
                            </StatusPill>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : null}
            </div>

            <LgpdExportAction
              isExportingData={isExportingData}
              lastExportManifest={lastExportManifest}
              onExport={onExport}
              onClearExportManifest={onClearExportManifest}
            />
          </div>
        </div>

        <ConsentEvidenceList
          items={privacy.consentHistory}
          loading={loading && privacy.consentHistory.length === 0}
          error={consentHistoryError}
        />
      </CardContent>
    </Card>
  );
};

export default PrivacyLgpdPanel;
