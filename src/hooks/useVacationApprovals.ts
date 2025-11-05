// ARQUIVO: src/hooks/useVacationApprovals.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IVacationQueryParams, IVacationRequestResponse } from "@/types/vacation";
import { toast } from "sonner";
import { fetchVacationRequests, approveVacationRequest, rejectVacationRequest } from "@/service/vacation.service";

// Validador defensivo: garante que o resultado é sempre um array
const ensureArray = (data: any): IVacationRequestResponse[] => {
    return Array.isArray(data) ? data : [];
};

export const useVacationApprovals = (params: IVacationQueryParams) => {
    const queryClient = useQueryClient();

    // 1. Fetch de Dados
    const { data, isLoading } = useQuery({
        queryKey: ['vacationRequests', params],
        queryFn: () => fetchVacationRequests(params),
        
        // CORREÇÃO: Garante que 'data' é sempre um array vazio no início
        initialData: [], 
        
        // CORREÇÃO: Força o valor final a ser um array, tratando falhas de forma segura
        select: ensureArray 
    });

    // 2. Mutações (Aprovação)
    const { mutate: approveMutate, isPending: isApproving } = useMutation({
        mutationFn: (ids: number[]) => approveVacationRequest(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacationRequests'] });
            toast.success("Férias aprovadas com sucesso!");
        },
        onError: (error) => {
            toast.error(`Falha na aprovação: ${error.message}`);
        },
    });

    // 3. Mutações (Rejeição)
    const { mutate: rejectMutate, isPending: isRejecting } = useMutation({
        mutationFn: (ids: number[]) => rejectVacationRequest(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacationRequests'] });
            toast.success("Férias rejeitadas com sucesso!");
        },
        onError: (error) => {
            toast.error(`Falha na rejeição: ${error.message}`);
        },
    });

    const approve = (ids: number[]) => approveMutate(ids);
    const reject = (ids: number[]) => rejectMutate(ids);

    return {
        requests: data, // data agora é garantido como array
        isLoading,
        isMutating: isApproving || isRejecting,
        approve,
        reject,
    };
};