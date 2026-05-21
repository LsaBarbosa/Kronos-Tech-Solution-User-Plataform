import { useCallback, useEffect, useState } from "react";
import { Fingerprint, Loader2, RefreshCcw, ShieldCheck, ShieldOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { checkTermsStatus, revokeBiometricTerms } from "@/service/terms.service";
import RevokeBiometricConsentDialog from "./RevokeBiometricConsentDialog";

type ConsentStatus = "loading" | "active" | "revoked" | "error";

const BiometricConsentCard = () => {
  const { checkSession } = useAuth();
  const [status, setStatus] = useState<ConsentStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const loadConsentStatus = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const accepted = await checkTermsStatus();
      setStatus(accepted ? "active" : "revoked");
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
                  : "bg-slate-500/10 text-slate-700"
              }`}
            >
              {isActive ? (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ShieldOff className="h-4 w-4" aria-hidden="true" />
              )}
              {isActive ? "Consentimento ativo" : "Consentimento revogado ou pendente"}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <p className="text-sm leading-6 text-muted-foreground">
            O consentimento biometrico controla o uso da sua imagem facial e dos templates de
            reconhecimento vinculados aos fluxos autorizados da plataforma.
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
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-foreground">
              {isActive ? (
                <p>
                  Sua conta possui um consentimento biometrico ativo. Ao revogar, os artefatos de
                  biometria serao removidos e sua sessao sera atualizada com um novo cookie.
                </p>
              ) : (
                <p>
                  Nao ha consentimento biometrico ativo para esta conta. O login facial e validacoes
                  biometricas permanecem desabilitados ate um novo aceite.
                </p>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDialogOpen(true)}
              disabled={!isActive || isRevoking || isLoading}
            >
              {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Revogar biometria
            </Button>
            <Button type="button" variant="outline" onClick={() => void loadConsentStatus()} disabled={isLoading}>
              Atualizar status
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
    </>
  );
};

export default BiometricConsentCard;
