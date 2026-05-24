import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { FileText, Loader2, Lock, LogOut, Shield } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import {
  acceptBiometricTerms,
  checkTermsStatus,
  getCurrentBiometricTerm,
  type CurrentBiometricTermResponse,
} from "@/service/terms.service";

type TermsGateStatus = "checking" | "accepted" | "pending" | "error";

const SCROLL_END_TOLERANCE = 8;

const TermsAcceptanceGate = () => {
  const { checkSession, logout } = useAuth();
  const [status, setStatus] = useState<TermsGateStatus>("checking");
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTerm, setCurrentTerm] =
    useState<CurrentBiometricTermResponse | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const verifyTermsStatus = useCallback(async () => {
    setStatus("checking");
    setErrorMessage(null);
    setHasConfirmed(false);
    setHasScrolledToEnd(false);
    setCurrentTerm(null);

    try {
      const response = await checkTermsStatus();
      if (response.accepted) {
        setStatus("accepted");
        return;
      }

      const term = await getCurrentBiometricTerm();
      setCurrentTerm(term);
      setStatus("pending");
    } catch (error) {
      const serviceError = normalizeServiceError(error);
      setErrorMessage(serviceError.message);
      setStatus("error");
    }
  }, []);

  const handleTermsScroll = useCallback(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (!(viewport instanceof HTMLElement)) {
      return;
    }

    const reachedEnd =
      viewport.scrollTop + viewport.clientHeight >=
      viewport.scrollHeight - SCROLL_END_TOLERANCE;

    if (reachedEnd) {
      setHasScrolledToEnd(true);
    }
  }, []);

  useEffect(() => {
    void verifyTermsStatus();
  }, [verifyTermsStatus]);

  useEffect(() => {
    if (status !== "pending") {
      return;
    }

    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (!(viewport instanceof HTMLElement)) {
      return;
    }

    viewport.addEventListener("scroll", handleTermsScroll, { passive: true });

    return () => {
      viewport.removeEventListener("scroll", handleTermsScroll);
    };
  }, [handleTermsScroll, status]);

  const handleAcceptTerms = async () => {
    if (!hasScrolledToEnd || !hasConfirmed || isSubmitting || currentTerm === null) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await acceptBiometricTerms({
        version: currentTerm.version,
        contentHashSha256: currentTerm.contentHashSha256,
      });
      await checkSession();
      toast({
        title: "Termo aceito",
        description: "A sessão foi atualizada e o acesso foi liberado.",
      });
      setStatus("accepted");
    } catch (error) {
      const serviceError = normalizeServiceError(error);
      setErrorMessage(serviceError.message);
      toast({
        title: "Erro ao registrar aceite",
        description: serviceError.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "checking") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 text-muted-foreground"
      >
        <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
        <span>Verificando aceite do termo...</span>
      </div>
    );
  }

  if (status === "accepted") {
    return <Outlet />;
  }

  const canAccept = hasScrolledToEnd && hasConfirmed && !isSubmitting;
  const isError = status === "error";
  const termTitle = currentTerm?.title ?? "Termo de Consentimento Biométrico";

  return (
    <AlertDialog open>
      <AlertDialogContent className="max-h-[92vh] max-w-2xl overflow-hidden">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              {isError ? (
                <Lock className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Shield className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <AlertDialogTitle>
                {isError
                  ? "Não foi possível verificar o termo"
                  : termTitle}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isError
                  ? "A sessão está bloqueada até que a verificação seja concluída."
                  : "O acesso à plataforma depende do aceite do termo abaixo."}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {isError ? (
          <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage ?? "Falha ao consultar o status do termo."}
          </div>
        ) : (
          <>
            <ScrollArea
              ref={scrollAreaRef}
              data-testid="terms-scroll-area"
              onScrollCapture={handleTermsScroll}
              className="h-72 rounded-md border bg-muted/30 p-4"
            >
              <div className="space-y-4 pr-4 text-sm leading-6 text-foreground">
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                  {currentTerm?.type === "BIOMETRIC_CONSENT_TERM"
                    ? "Consentimento para uso de biometria"
                    : "Termo legal"}
                </div>
                <div className="rounded-md border bg-background/80 p-3 text-xs text-muted-foreground">
                  Versão: {currentTerm?.version ?? "indisponível"}
                </div>
                <div className="whitespace-pre-wrap">
                  {currentTerm?.content ?? "Carregando termo biométrico ativo..."}
                </div>
              </div>
            </ScrollArea>

            <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
              <Checkbox
                checked={hasConfirmed}
                onCheckedChange={(checked) => setHasConfirmed(checked === true)}
                aria-label="Confirmo que li e aceito o termo de consentimento biométrico"
              />
              <span>
                Confirmo que li integralmente e aceito o Termo de Consentimento Biométrico.
              </span>
            </label>

            {errorMessage ? (
              <div role="alert" className="text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}
          </>
        )}

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => void logout()}
            disabled={isSubmitting}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </Button>

          {isError ? (
            <Button type="button" onClick={() => void verifyTermsStatus()}>
              Tentar novamente
            </Button>
          ) : (
            <Button type="button" onClick={() => void handleAcceptTerms()} disabled={!canAccept}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Lock className="h-4 w-4" aria-hidden="true" />
              )}
              Confirmar aceite
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TermsAcceptanceGate;
