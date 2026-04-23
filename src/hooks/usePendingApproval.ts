// src/hooks/usePendingApproval.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  ITimeRecordApprovalPageResponse,
  IPendingApprovalQueryParams,
} from "@/types/recordApproval"; 
import { 
    fetchPendingApprovals, 
    approveTimeRecordChange, 
    rejectTimeRecordChange 
} from "@/service/records.service"; 
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

/**
 * Hook para gerenciar a listagem, aprovação e rejeição de solicitações de ponto.
 */
export const usePendingApprovals = (params: IPendingApprovalQueryParams) => {
  const queryClient = useQueryClient();

  // 1. Listagem Paginada e Filtrada
  const { data, isLoading, error } = useQuery<ITimeRecordApprovalPageResponse>({
    queryKey: ["pendingApprovals", params.page, params.employeeName],
    queryFn: () => fetchPendingApprovals(params), 
    staleTime: 1000 * 60 * 5, 
    // CORREÇÃO: Usando placeholderData para manter os dados anteriores
    placeholderData: (previousData) => previousData, 
  });

  // 2. Mutação para Aprovação
  const approveMutation = useMutation({
    mutationFn: (id: number) => approveTimeRecordChange(id), 
    onSuccess: () => {
      toast({
        title: "✅ Aprovado com sucesso!",
        description: "O registro de ponto foi atualizado e aprovado.",
      });
      // Invalida a query para forçar o refetch dos dados da página atual
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
    },
    onError: (e: any) => {
      toast({
        title: "❌ Erro ao Aprovar",
        description: getServiceErrorMessage(e, "Não foi possível aprovar a solicitação."), 
        variant: "destructive",
      });
    },
  });

  // 3. Mutação para Rejeição
  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectTimeRecordChange(id), 
    onSuccess: () => {
      toast({
        title: "✅ Rejeitado com sucesso!",
        description: "A solicitação de alteração foi rejeitada.",
      });
      // Invalida a query para forçar o refetch dos dados da página atual
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
    },
    onError: (e: any) => {
      toast({
        title: "❌ Erro ao Rejeitar",
        description: getServiceErrorMessage(e, "Não foi possível rejeitar a solicitação."), 
        variant: "destructive",
      });
    },
  });

  return {
    data,
    isLoading,
    error,
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
    isMutating: approveMutation.isPending || rejectMutation.isPending, 
  };
};
