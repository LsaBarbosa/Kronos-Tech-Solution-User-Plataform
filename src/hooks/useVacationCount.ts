// ARQUIVO CORRIGIDO: src/hooks/useVacationCount.ts

import { useQuery } from '@tanstack/react-query';
import { fetchPendingVacationCount } from '@/service/vacation.service';

/**
 * Hook para buscar a contagem de solicitações de férias PENDENTES.
 */
export const useVacationCount = () => {
    const { data: vacationCount = 0, isLoading: isLoadingVacationCount } = useQuery<number>({
        queryKey: ['pendingVacationCount'],
        queryFn: fetchPendingVacationCount,
        // Configurações de cache e atualização para dashboard (ex: 5 minutos)
        refetchInterval: 60000 * 5,
        staleTime: 60000 * 2,
        // CORREÇÃO: 'onError' foi removido. Essa propriedade não é permitida em useQuery no TanStack Query v4+.
        
        // Garante que o valor inicial seja 0 (número)
        initialData: 0,
    });

    return {
        pendingVacationCount: vacationCount,
        isLoadingVacationCount
    };
};