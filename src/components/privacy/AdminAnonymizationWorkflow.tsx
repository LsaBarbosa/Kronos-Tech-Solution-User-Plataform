import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2, Clock, User, FileText, Lock, Building2, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  dryRunAnonymizationForRequest,
  applyAnonymizationForRequest,
  type AnonymizationDryRunWithTokenResponse,
  type AnonymizationConsolidatedResultResponse,
} from "@/service/lgpd.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { ANONYMIZATION_RESOURCE_TYPE_LABELS, ANONYMIZATION_ACTION_DESCRIPTIONS } from "@/constants/lgpd.constants";

interface AdminAnonymizationWorkflowProps {
  requestId: string;
  requestType: string;
  requestStatus: string;
  employeeFullName: string;
  onAnonymizationComplete?: (result: AnonymizationConsolidatedResultResponse) => void;
}

export const AdminAnonymizationWorkflow = ({
  requestId,
  requestType,
  requestStatus,
  employeeFullName,
  onAnonymizationComplete,
}: AdminAnonymizationWorkflowProps) => {
  const [stage, setStage] = useState<"initial" | "dry-run-preview" | "apply">("initial");
  const [dryRunData, setDryRunData] = useState<AnonymizationDryRunWithTokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [justification, setJustification] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [applyResult, setApplyResult] = useState<AnonymizationConsolidatedResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canExecuteDryRun = ["APPROVED_FOR_EXPORT", "WAITING_LEGAL_REVIEW", "WAITING_CONTROLLER"].includes(
    requestStatus
  );

  const getIconForResourceType = (resourceType: string) => {
    switch (resourceType) {
      case "TIME_RECORD":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "USER":
        return <User className="h-5 w-5 text-purple-600" />;
      case "DOCUMENT":
        return <FileText className="h-5 w-5 text-amber-600" />;
      case "BIOMETRIC_ARTIFACT":
        return <Lock className="h-5 w-5 text-red-600" />;
      case "EMPLOYEE":
        return <Building2 className="h-5 w-5 text-green-600" />;
      case "MESSAGE":
        return <MessageSquare className="h-5 w-5 text-cyan-600" />;
      case "AUDIT_LOG":
        return <LogOut className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleDryRun = async () => {
    if (!canExecuteDryRun) {
      setError("Status da solicitação não permite execução de anonimização");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await dryRunAnonymizationForRequest(requestId);
      setDryRunData(result);
      setStage("dry-run-preview");
      toast.success("Análise prévia concluída com sucesso");
    } catch (err) {
      const errorMsg = getServiceErrorMessage(err, "Erro ao executar análise prévia");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!dryRunData) {
      setError("Token de análise prévia não encontrado");
      return;
    }

    if (!confirmed) {
      setError("Você deve confirmar a anonimização");
      return;
    }

    if (!justification.trim()) {
      setError("Justificativa é obrigatória");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await applyAnonymizationForRequest(requestId, {
        justification: justification.trim(),
        confirmed: true,
        dryRunToken: dryRunData.dryRunToken,
      });

      setApplyResult(result);
      setStage("apply");
      toast.success("Anonimização aplicada com sucesso!");

      if (onAnonymizationComplete) {
        onAnonymizationComplete(result);
      }
    } catch (err) {
      const errorMsg = getServiceErrorMessage(err, "Erro ao aplicar anonimização");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (stage === "initial") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Anonimização de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-yellow-700">
            Colaborador: <strong>{employeeFullName}</strong>
          </p>
          <p className="text-sm text-yellow-700">
            Tipo de Solicitação: <strong>{requestType}</strong>
          </p>

          {!canExecuteDryRun && (
            <div className="flex gap-2 rounded bg-yellow-100 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                Status "{requestStatus}" não permite execução de anonimização. Estatuses permitidos: APPROVED_FOR_EXPORT,
                WAITING_LEGAL_REVIEW, WAITING_CONTROLLER
              </p>
            </div>
          )}

          <Button
            onClick={handleDryRun}
            disabled={isLoading || !canExecuteDryRun}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Executando análise prévia...
              </>
            ) : (
              "Executar Análise Prévia (Dry Run)"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (stage === "dry-run-preview" && dryRunData) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Resultado da Análise Prévia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg bg-white p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{dryRunData.summary.totalScanned}</div>
              <div className="text-xs text-gray-600">Registros Verificados</div>
            </div>
            <div className="rounded-lg bg-white p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{dryRunData.summary.totalAffected}</div>
              <div className="text-xs text-gray-600">Serão Afetados</div>
            </div>
            <div className="rounded-lg bg-white p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{dryRunData.summary.totalSkipped}</div>
              <div className="text-xs text-gray-600">Serão Preservados</div>
            </div>
            <div className="rounded-lg bg-white p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{dryRunData.summary.totalErrors}</div>
              <div className="text-xs text-gray-600">Erros Esperados</div>
            </div>
          </div>

          <Separator />

          {/* Domains */}
          {dryRunData.domains.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-blue-900">Detalhes por Tipo de Dado</h3>
              <div className="space-y-3">
                {dryRunData.domains.map((domain, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-1">
                        {getIconForResourceType(domain.resourceType)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p className="font-medium text-gray-900">
                            {ANONYMIZATION_RESOURCE_TYPE_LABELS[domain.resourceType] || domain.resourceType}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          <span className="font-medium">Ação:</span> {ANONYMIZATION_ACTION_DESCRIPTIONS[domain.action] || domain.action}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">{domain.warning}</p>
                        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                          <div className="rounded bg-blue-50 p-2 text-center">
                            <div className="font-bold text-blue-700">{domain.scanned}</div>
                            <div className="text-xs text-gray-600">Verificados</div>
                          </div>
                          <div className="rounded bg-orange-50 p-2 text-center">
                            <div className="font-bold text-orange-700">{domain.affected}</div>
                            <div className="text-xs text-gray-600">Serão Afetados</div>
                          </div>
                          <div className="rounded bg-green-50 p-2 text-center">
                            <div className="font-bold text-green-700">{domain.skipped}</div>
                            <div className="text-xs text-gray-600">Preservados</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {dryRunData.warnings.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-blue-900">Avisos</h3>
              <div className="space-y-1">
                {dryRunData.warnings.map((warning, idx) => (
                  <div key={idx} className="flex gap-2 text-sm text-yellow-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Justification & Confirmation */}
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Justificativa da Anonimização *
              </label>
              <textarea
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value);
                  setError(null);
                }}
                placeholder="Descreva o motivo administrativo para executar esta anonimização..."
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
                rows={4}
              />
              <p className="mt-1 text-xs text-gray-500">Obrigatório para auditoria</p>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="confirm-anonymization"
                checked={confirmed}
                onChange={(e) => {
                  setConfirmed(e.target.checked);
                  setError(null);
                }}
                className="mt-1"
              />
              <label htmlFor="confirm-anonymization" className="text-sm text-gray-700">
                Tenho certeza de que desejo <strong>anonimizar permanentemente</strong> os dados deste colaborador.
                Esta ação <strong>não pode ser desfeita</strong>.
              </label>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg bg-red-100 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStage("initial");
                setDryRunData(null);
                setJustification("");
                setConfirmed(false);
                setError(null);
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Executar Novo Dry-Run
            </Button>
            <Button
              onClick={handleApply}
              disabled={isLoading || !confirmed || !justification.trim()}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                "Aplicar Anonimização"
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-600">
            Token válido por: <strong>{dryRunData.tokenExpiresAtSeconds / 60} minutos</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (stage === "apply" && applyResult) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-green-800">Anonimização Concluída</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-white p-4">
            <p className="mb-3 font-semibold text-gray-800">Status da Execução</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-600">Status Consolidado: </span>
                <span className={`font-semibold ${applyResult.consolidatedStatus === "SUCCESS" ? "text-green-600" : "text-yellow-600"}`}>
                  {applyResult.consolidatedStatus}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-600">Duração: </span>
                <span className="font-semibold text-gray-800">
                  {((applyResult.finishedAt.getTime() - applyResult.startedAt.getTime()) / 1000).toFixed(2)}s
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-600">Registros Verificados: </span>
                <span className="font-semibold text-gray-800">{applyResult.summary.totalScanned}</span>
              </div>
              <div>
                <span className="text-xs text-gray-600">Registros Afetados: </span>
                <span className="font-semibold text-gray-800">{applyResult.summary.totalAffected}</span>
              </div>
            </div>
          </div>

          {applyResult.failedDomains.length > 0 && (
            <div className="rounded-lg bg-red-100 p-3">
              <p className="mb-2 text-sm font-semibold text-red-800">Domínios com Erro</p>
              <ul className="list-inside list-disc text-sm text-red-700">
                {applyResult.failedDomains.map((domain) => (
                  <li key={domain}>{domain}</li>
                ))}
              </ul>
            </div>
          )}

          {applyResult.warnings.length > 0 && (
            <div className="rounded-lg bg-yellow-100 p-3">
              <p className="mb-2 text-sm font-semibold text-yellow-800">Avisos</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-yellow-700">
                {applyResult.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-600">
            A solicitação LGPD pode agora ser concluída com o status apropriado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};
