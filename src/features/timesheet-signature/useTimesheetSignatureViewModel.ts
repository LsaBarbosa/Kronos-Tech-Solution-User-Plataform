import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TimesheetSignatureService } from "@/service/timesheetSignature.service";
import type {
  PreviousMonthSignatureStatus,
  SignPreviousMonthResponse,
} from "@/types/timesheet-signature";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";

interface BackendErrorPayload {
  code?: string;
  message?: string;
  detail?: string;
}

const extractBackendCode = (error: unknown): string | undefined => {
  const normalized = normalizeServiceError(error);
  const data = normalized.data as BackendErrorPayload | undefined;
  return data?.code;
};

const extractBackendMessage = (error: unknown): string | undefined => {
  const normalized = normalizeServiceError(error);
  const data = normalized.data as BackendErrorPayload | undefined;
  return data?.message ?? data?.detail ?? normalized.message;
};

export interface SelectedPeriod {
  year: number;
  month: number;
}

export interface TimesheetSignatureViewModel {
  isLoading: boolean;
  isSubmitting: boolean;
  isPreviewLoading: boolean;
  status: PreviousMonthSignatureStatus | null;
  lastSignature: SignPreviousMonthResponse | null;
  selectedPeriod: SelectedPeriod | null;
  setSelectedPeriod: (period: SelectedPeriod | null) => void;
  refresh: () => Promise<void>;
  preview: () => Promise<void>;
  sign: (password: string) => Promise<boolean>;
  downloadSigned: (signatureId: string) => Promise<void>;
}

const triggerBrowserDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const openBlobInNewTab = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const useTimesheetSignatureViewModel = (): TimesheetSignatureViewModel => {
  const { toast } = useToast();
  const [status, setStatus] = useState<PreviousMonthSignatureStatus | null>(null);
  const [lastSignature, setLastSignature] = useState<SignPreviousMonthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const [selectedPeriod, setSelectedPeriodState] = useState<SelectedPeriod | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await TimesheetSignatureService.getMonthStatus(
        selectedPeriod?.year,
        selectedPeriod?.month
      );
      setStatus(data);
      setHasPreviewed(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível carregar o status da assinatura",
        description: extractBackendMessage(error) ?? "Tente novamente em instantes.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setSelectedPeriod = useCallback((period: SelectedPeriod | null) => {
    setSelectedPeriodState(period);
    setHasPreviewed(false);
    setStatus(null);
  }, []);

  const preview = useCallback(async () => {
    setIsPreviewLoading(true);
    try {
      const { blob } = await TimesheetSignatureService.fetchMonthPreviewPdf(
        selectedPeriod?.year,
        selectedPeriod?.month
      );
      setHasPreviewed(true);
      openBlobInNewTab(blob);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível abrir o espelho do período selecionado",
        description: extractBackendMessage(error) ?? "Tente novamente em instantes.",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  }, [selectedPeriod, toast]);

  const sign = useCallback(
    async (password: string): Promise<boolean> => {
      if (!status || !status.eligible) {
        toast({
          variant: "destructive",
          title: "Assinatura indisponível",
          description: "O período não está elegível para assinatura.",
        });
        return false;
      }

      if (!hasPreviewed) {
        toast({
          variant: "destructive",
          title: "Visualize o espelho antes de assinar",
          description: "Você precisa visualizar o espelho de ponto antes de assinar.",
        });
        return false;
      }

      if (!status.recordsSnapshotHashSha256) {
        toast({
          variant: "destructive",
          title: "Não foi possível assinar",
          description: "O resumo criptográfico dos registros não foi resolvido. Recarregue a tela.",
        });
        return false;
      }

      setIsSubmitting(true);
      try {
        const response = await TimesheetSignatureService.sign({
          referenceYear: status.referenceYear,
          referenceMonth: status.referenceMonth,
          confirmed: true,
          declarationVersion: status.declarationVersion,
          declarationHashSha256: status.declarationHashSha256,
          recordsSnapshotHashSha256: status.recordsSnapshotHashSha256,
          password,
        });
        setLastSignature(response);
        toast({
          title: "Assinatura registrada",
          description: `Resumo SHA-256: ${response.pointMirrorHashSha256.slice(0, 16)}…`,
        });
        await refresh();
        return true;
      } catch (error) {
        const code = extractBackendCode(error);
        const description = (() => {
          switch (code) {
            case "BAD_REQUEST":
              return extractBackendMessage(error) ?? "Dados inválidos. Recarregue a tela.";
            case "FORBIDDEN":
              return "Senha inválida.";
            case "CONFLICT":
              return extractBackendMessage(error) ?? "Não foi possível assinar.";
            default:
              return extractBackendMessage(error) ?? "Não foi possível registrar a assinatura.";
          }
        })();
        toast({
          variant: "destructive",
          title: "Erro ao assinar",
          description,
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [hasPreviewed, refresh, status, toast]
  );

  const downloadSigned = useCallback(
    async (signatureId: string) => {
      try {
        const { blob, fileName } = await TimesheetSignatureService.downloadSignedDocument(signatureId);
        triggerBrowserDownload(blob, fileName);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Falha ao baixar documento assinado",
          description: extractBackendMessage(error) ?? "Tente novamente em instantes.",
        });
      }
    },
    [toast]
  );

  return useMemo(
    () => ({
      isLoading,
      isSubmitting,
      isPreviewLoading,
      status,
      lastSignature,
      selectedPeriod,
      setSelectedPeriod,
      refresh,
      preview,
      sign,
      downloadSigned,
    }),
    [
      downloadSigned,
      isLoading,
      isPreviewLoading,
      isSubmitting,
      lastSignature,
      preview,
      refresh,
      selectedPeriod,
      setSelectedPeriod,
      sign,
      status,
    ]
  );
};
