import { useCallback, useEffect, useState } from "react";
import { Fingerprint, Loader2, RefreshCcw, ShieldCheck, ShieldOff, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { checkTermsStatus, revokeBiometricTerms } from "@/service/terms.service";
import RevokeBiometricConsentDialog from "./RevokeBiometricConsentDialog";
import BiometricEnrollmentModal from "./BiometricEnrollmentModal";

type ConsentStatus = "loading" | "active" | "revoked" | "error";

const BiometricConsentCard = () => {
  const { checkSession } = useAuth();
  const [status, setStatus] = useState<ConsentStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const loadConsentStatus = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await checkTermsStatus();
      setStatus(response.accepted ? "active" : "revoked");
    } catch (error) {
      const serviceError = normalizeServiceError(error);
      setErrorMessage(serviceError.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadConsentStatus();
  }, [loadConsentStatus]);

  const handleConfirmRevocation = async () => {
    if (isRevoking) {
      return;
    }

    setIsRevoking(true);
    setErrorMessage(null);

    try {
      await revokeBiometricTerms();
      setStatus("revoked");
      setDialogOpen(false);
      toast({
        title: "Consentimento revogado",
        description: "A biometria foi removida e a sessao sera atualizada.",
      });
      setIsRevoking(false);
      await checkSession();
    } catch (error) {
      const serviceError = normalizeServiceError(error);
      setErrorMessage(serviceError.message);
      toast({
        title: "Erro ao revogar biometria",
        description: serviceError.message,
        variant: "destructive",
      });
      setIsRevoking(false);
    }
  };

  const isActive = status === "active";
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <>
      <Card className="overflow-hidden border-primary/20 shadow-card" data-testid="biometric-consent-card">
        <CardHeader className="border-b border-primary/10 bg-primary/5 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Fingerprint className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-lg">Privacidade biometrica</CardTitle>
                  <CardDescription>
                    Consulte o estado do consentimento e revogue a biometria quando necessario.
                  </CardDescription>
                </div>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-amber-500/10 text-amber-700"
              }`}
            >
              {isActive ? (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ShieldOff className="h-4 w-4" aria-hidden="true" />
              )}
              {isActive ? "✓ Consentimento Ativo" : "⚠ Consentimento Pendente"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <p className="text-sm leading-6 text-muted-foreground">
            O consentimento biométrico autoriza o uso de sua imagem facial para fins de autenticação e validação de identidade na plataforma. Este consentimento é separado e independente de outros dados pessoais que você tenha compartilhado.
          </p>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Verificando status do consentimento...
            </div>
          ) : null}

          {isError ? (
            <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p role="alert" className="text-sm text-destructive">
                {errorMessage ?? "Nao foi possivel consultar o status do consentimento biometrico."}
              </p>
              <Button type="button" variant="outline" onClick={() => void loadConsentStatus()}>
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Tentar novamente
              </Button>
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-foreground">
                {isActive ? (
                  <div className="space-y-2">
                    <p className="font-medium text-emerald-700">✓ Seu consentimento está ativo</p>
                    <p>
                      Você autorizou o uso de sua biometria facial. Pode realizar login facial e validações biométricas na plataforma.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-amber-700">⚠ Seu consentimento está pendente</p>
                    <p>
                      Você ainda não autorizou o uso de sua biometria. O cadastro e login facial estão desabilitados. Para usar esses recursos, você deve aceitar o termo de consentimento biométrico.
                    </p>
                  </div>
                )}
              </div>

              {isActive && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-3">
                  <div>
                    <p className="font-medium">O que acontece ao revogar seu consentimento?</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800">
                      <li>Seu arquivo biométrico será removido de nossos sistemas operacionais</li>
                      <li>Você não poderá mais usar login facial</li>
                      <li>Sua sessão será atualizada imediatamente</li>
                      <li>Para usar biometria novamente, será necessário aceitar o consentimento novamente</li>
                    </ul>
                  </div>
                  <div className="border-t border-amber-200 pt-3">
                    <p className="text-xs font-medium text-amber-700">Observação sobre registros legais:</p>
                    <p className="text-xs text-amber-700 mt-1">
                      A evidência de seu consentimento pode ser preservada para fins de conformidade jurídica e validação de direitos, conforme necessário.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {isActive ? (
              <>
                <Button
                  type="button"
                  onClick={() => setEnrollmentModalOpen(true)}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Cadastrar Minha Biometria
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDialogOpen(true)}
                  disabled={isRevoking || isLoading}
                >
                  {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  Revogar Consentimento
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setEnrollmentModalOpen(true)}
                disabled={isLoading}
                className="gap-2"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Aceitar e Cadastrar Biometria
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => void loadConsentStatus()} disabled={isLoading}>
              Atualizar Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <RevokeBiometricConsentDialog
        open={dialogOpen}
        isSubmitting={isRevoking}
        onConfirm={handleConfirmRevocation}
        onOpenChange={setDialogOpen}
      />

      <BiometricEnrollmentModal
        open={enrollmentModalOpen}
        onOpenChange={setEnrollmentModalOpen}
        hasConsent={isActive}
        onEnrollmentSuccess={() => void loadConsentStatus()}
      />
    </>
  );
};

export default BiometricConsentCard;
