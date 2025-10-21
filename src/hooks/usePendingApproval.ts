// src/hooks/usePendingApprovals.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast"; //
import { PendingApproval } from "@/types/recordApproval";
import { fetchPendingApprovals, approveRecord, rejectRecord } from "@/service/record.service";

interface UsePendingApprovalsReturn {
  pendingApprovals: PendingApproval[];
  isLoading: boolean;
  handleApprove: (timeRecordId: number, partnerName: string) => Promise<void>;
  handleReject: (timeRecordId: number, partnerName: string) => Promise<void>;
  refetchApprovals: () => void;
}

export const usePendingApprovals = (): UsePendingApprovalsReturn => {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast(); //

  // Função centralizada de busca (memoizada com useCallback)
  const loadPendingApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPendingApprovals();
      setPendingApprovals(data);
      
      toast({
        title: "Sucesso",
        description: `Foram encontradas ${data.length} solicitações de alteração pendentes.`,
        className: "border-success bg-success text-white font-medium shadow-lg"
      });
      
    } catch (error: any) {
      console.error("Erro ao buscar solicitações:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao buscar as solicitações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Efeito para carregar os dados na montagem (depende de loadPendingApprovals)
  useEffect(() => {
    loadPendingApprovals();
  }, [loadPendingApprovals]);

  // Handler de Aprovação (chama o serviço e atualiza o estado localmente)
  const handleApprove = useCallback(async (timeRecordId: number, partnerName: string) => {
    try {
      await approveRecord(timeRecordId);
      
      // Atualiza o estado localmente para feedback instantâneo
      setPendingApprovals(prev => prev.filter(req => req.timeRecordId !== timeRecordId));

      toast({
        title: "Solicitação Aprovada",
        description: `A alteração de registro de ${partnerName} foi aprovada com sucesso.`,
        className: "border-success bg-success text-white font-medium shadow-lg"
      });
    } catch (error: any) {
      console.error("Erro ao aprovar:", error);
      toast({
        title: "Erro ao Aprovar",
        description: error.message || "Ocorreu um erro ao aprovar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handler de Rejeição (chama o serviço e atualiza o estado localmente)
  const handleReject = useCallback(async (timeRecordId: number, partnerName: string) => {
    try {
      await rejectRecord(timeRecordId);
      
      // Atualiza o estado localmente para feedback instantâneo
      setPendingApprovals(prev => prev.filter(req => req.timeRecordId !== timeRecordId));

      toast({
        title: "Solicitação Rejeitada",
        description: `A alteração de registro de ${partnerName} foi rejeitada.`,
        className: "border-destructive bg-destructive text-white font-medium shadow-lg"
      });
    } catch (error: any) {
      console.error("Erro ao rejeitar:", error);
      toast({
        title: "Erro ao Rejeitar",
        description: error.message || "Ocorreu um erro ao rejeitar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    pendingApprovals,
    isLoading,
    handleApprove,
    handleReject,
    refetchApprovals: loadPendingApprovals, // Permite recarregar externamente
  };
};