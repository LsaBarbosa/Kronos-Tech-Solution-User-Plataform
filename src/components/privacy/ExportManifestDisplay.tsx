import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LgpdExportManifest } from "@/types/legal";

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
        {/* Export Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Data/Hora da Exportação:</span>
            <span className="font-medium">{formatDateTime(manifest.exportedAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Geolocalização Precisa:</span>
            <span className={`font-medium ${manifest.includedGeolocation ? "text-amber-600" : "text-green-600"}`}>
              {manifest.includedGeolocation ? "Incluída ⚠️" : "Não incluída ✓"}
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground uppercase">Seções Exportadas:</p>
          <div className="grid grid-cols-2 gap-2">
            {manifest.sections.map((section) => (
              <div
                key={section}
                className="rounded bg-white p-2 text-xs border border-green-200 text-green-900"
              >
                ✓ {sectionLabels[section] || section}
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <strong>Importante:</strong> Guarde este arquivo em local seguro. Ele contém informações pessoais que identificam você. Não compartilhe com terceiros.
          </p>
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
