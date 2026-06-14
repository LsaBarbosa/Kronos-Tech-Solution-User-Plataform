import { FileDown, Loader2, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeBR, formatShortHash } from "@/features/user-profile/utils/usuario-profile-formatters";
import type { LgpdExportManifest } from "@/types/legal";

interface LgpdExportActionProps {
  isExportingData: boolean;
  lastExportManifest: LgpdExportManifest | null;
  onExport: () => Promise<void>;
  onClearExportManifest: () => void;
}

const LgpdExportAction = ({
  isExportingData,
  lastExportManifest,
  onExport,
  onClearExportManifest,
}: LgpdExportActionProps) => {
  return (
    <Card className="rounded-[24px] border border-[#D8E2EC] shadow-[0_12px_30px_rgba(31,78,95,0.08)]">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg text-[#102A43]">Exportação LGPD própria</CardTitle>
            <CardDescription className="max-w-2xl text-[#627D98]">
              Baixe um arquivo com seus dados pessoais. O JSON completo não é exibido na tela principal.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-[#D8E2EC] bg-[#F5F8FB] text-[#635BFF]">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Rastreabilidade
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="download"
            className="h-11"
            onClick={() => void onExport()}
            disabled={isExportingData}
          >
            {isExportingData ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileDown className="h-4 w-4" aria-hidden="true" />}
            Baixar meus dados
          </Button>
          {lastExportManifest ? (
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={onClearExportManifest}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Limpar resumo
            </Button>
          ) : null}
        </div>

        {lastExportManifest ? (
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#102A43]">Última exportação concluída</p>
                <p className="text-xs text-[#627D98]">
                  Arquivo baixado localmente. Mantenha-o seguro fora da tela principal.
                </p>
              </div>
              <Badge variant="outline" className="border-[#D8E2EC] bg-white text-[#635BFF]">
                {formatShortHash(lastExportManifest.exportId)}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Exportado em</p>
                <p className="mt-1 text-sm font-medium text-[#102A43]">{formatDateTimeBR(lastExportManifest.exportedAt)}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Seções</p>
                <p className="mt-1 text-sm font-medium text-[#102A43]">{lastExportManifest.sections.length}</p>
              </div>
              <div className="rounded-2xl border border-white bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Geolocalização</p>
                <p className="mt-1 text-sm font-medium text-[#102A43]">
                  {lastExportManifest.includePreciseGeolocation ? "Precisa incluída" : "Não incluída"}
                </p>
              </div>
              <div className="rounded-2xl border border-white bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#627D98]">Avisos</p>
                <p className="mt-1 text-sm font-medium text-[#102A43]">{lastExportManifest.warnings?.length ?? 0}</p>
              </div>
            </div>

            {lastExportManifest.warnings?.length ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-medium">Observações de segurança</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800">
                  {lastExportManifest.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#D8E2EC] bg-[#F5F8FB] p-4 text-sm text-[#627D98]">
            Nenhuma exportação foi realizada nesta sessão.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LgpdExportAction;
