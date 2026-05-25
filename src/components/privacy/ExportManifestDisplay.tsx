import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LgpdExportManifest } from "@/types/legal";

export type ExportManifest = LgpdExportManifest;

interface ExportManifestDisplayProps {
  manifest: ExportManifest;
  onDismiss: () => void;
}

const ExportManifestDisplay = ({
  manifest,
  onDismiss,
}: ExportManifestDisplayProps) => {
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("pt-BR");
    } catch {
      return isoString;
    }
  };

  const sectionLabels: Record<string, string> = {
    CPF: "CPF e documentos",
    CONTACT: "Contato e endereço",
    SALARY: "Informações salariais",
    DOCUMENTS: "Documentos e anexos",
    TIME_RECORDS: "Histórico de ponto",
    MESSAGES: "Mensagens",
    AUDIT_LOGS: "Logs de atividade",
    CONSENTS: "Registros de consentimento",
    GEOLOCATION: "Geolocalização",
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle className="text-green-900">Exportação Concluída</CardTitle>
              <CardDescription className="text-green-700">
                Seus dados foram exportados com sucesso
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Export ID and Metadata */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">ID da Exportação</p>
              <p className="font-mono text-sm text-slate-900 break-all">{manifest.exportId}</p>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Data e Hora</p>
              <p className="text-sm text-slate-900">{formatDateTime(manifest.exportedAt)}</p>
            </div>
          </div>
        </div>

        {/* Geolocation Highlight */}
        {manifest.includedGeolocation && (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">
                  Geolocalização Precisa Incluída
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Este arquivo contém as coordenadas geográficas precisas dos seus registros de localização. Armazene com cuidado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Seções Incluídas:</p>
            <div className="grid grid-cols-2 gap-2">
              {manifest.sections.map((section) => (
                <div
                  key={section}
                  className="rounded-lg bg-white p-3 text-sm border border-green-200 text-green-900 flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs">{sectionLabels[section] || section}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warnings if any */}
        {manifest.warnings && manifest.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900 mb-2">⚠️ Avisos</p>
            <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
              {manifest.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Security Notice */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">🔒 Proteja Seus Dados</p>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Armazene em local seguro e protegido</li>
            <li>Não compartilhe o arquivo com terceiros</li>
            <li>Considere usar criptografia</li>
            <li>Guarde o ID da exportação para referência</li>
          </ul>
        </div>

        {/* Dismiss Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onDismiss}
          className="w-full"
        >
          Fechar
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportManifestDisplay;
