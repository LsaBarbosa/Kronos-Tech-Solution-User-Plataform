import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ServiceContractSignatureService } from "@/service/serviceContractSignature.service";
import type {
  PendingServiceContract,
  SignServiceContractResponse,
} from "@/types/service-contract-signature";
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

export interface ServiceContractSignatureViewModel {
  isLoading: boolean;
  isPreviewLoading: boolean;
  isSubmitting: boolean;
  pendingContracts: PendingServiceContract[];
  selectedContract: PendingServiceContract | null;
  selectContract: (contract: PendingServiceContract | null) => void;
  lastSignature: SignServiceContractResponse | null;
  refresh: () => Promise<void>;
  preview: () => Promise<void>;
  sign: (faceImageBase64: string) => Promise<boolean>;
  downloadSigned: (signatureId: string) => Promise<void>;
}

export const useServiceContractSignatureViewModel = (): ServiceContractSignatureViewModel => {
  const { toast } = useToast();
  const [pendingContracts, setPendingContracts] = useState<PendingServiceContract[]>([]);
  const [selectedContract, setSelectedContractState] = useState<PendingServiceContract | null>(null);
  const [lastSignature, setLastSignature] = useState<SignServiceContractResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ServiceContractSignatureService.getPendingContracts();
      const contracts = Array.isArray(data?.contracts) ? data.contracts : [];
      setPendingContracts(contracts);
      // mantém seleção apenas se ainda estiver pendente
      setSelectedContractState((current) =>
        current && contracts.some((c) => c.contractId === current.contractId)
          ? contracts.find((c) => c.contractId === current.contractId) ?? null
          : null
      );
      setHasPreviewed(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível carregar os contratos pendentes",
        description: extractBackendMessage(error) ?? "Tente novamente em instantes.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectContract = useCallback((contract: PendingServiceContract | null) => {
    setSelectedContractState(contract);
    setHasPreviewed(false);
  }, []);

  const preview = useCallback(async () => {
    if (!selectedContract) {
      toast({
        variant: "destructive",
        title: "Selecione um contrato",
        description: "Escolha um contrato pendente para visualizar.",
      });
      return;
    }
    setIsPreviewLoading(true);
    try {
      const { blob } = await ServiceContractSignatureService.fetchContractPreviewPdf(
        selectedContract.contractId
      );
      setHasPreviewed(true);
      openBlobInNewTab(blob);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível abrir o contrato",
        description: extractBackendMessage(error) ?? "Tente novamente em instantes.",
      });
    } finally {
      setIsPreviewLoading(false);
    }
  }, [selectedContract, toast]);

  const sign = useCallback(
    async (faceImageBase64: string): Promise<boolean> => {
      if (!selectedContract) {
        toast({
          variant: "destructive",
          title: "Selecione um contrato",
          description: "Escolha um contrato pendente para assinar.",
        });
        return false;
      }
      if (!hasPreviewed) {
        toast({
          variant: "destructive",
          title: "Visualize o contrato antes de assinar",
          description: "Você precisa abrir e conferir o contrato antes de assinar.",
        });
        return false;
      }
      setIsSubmitting(true);
      try {
        const response = await ServiceContractSignatureService.sign(selectedContract.contractId, {
          confirmed: true,
          declarationVersion: selectedContract.declarationVersion,
          declarationHashSha256: selectedContract.declarationHashSha256,
          contractDocumentHashSha256: selectedContract.documentHashSha256,
          faceImageBase64,
        });
        setLastSignature(response);
        toast({
          title: "Contrato assinado",
          description: `Resumo SHA-256: ${response.signedPdfHashSha256.slice(0, 16)}…`,
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
              return extractBackendMessage(error) ?? "Reconhecimento facial não confirmado.";
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
    [hasPreviewed, refresh, selectedContract, toast]
  );

  const downloadSigned = useCallback(
    async (signatureId: string) => {
      try {
        const { blob, fileName } = await ServiceContractSignatureService.downloadSignedDocument(signatureId);
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
      isPreviewLoading,
      isSubmitting,
      pendingContracts,
      selectedContract,
      selectContract,
      lastSignature,
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
      pendingContracts,
      preview,
      refresh,
      selectContract,
      selectedContract,
      sign,
    ]
  );
};
