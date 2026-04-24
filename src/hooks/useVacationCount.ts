// ARQUIVO CORRIGIDO: src/hooks/useVacationCount.ts

import { useQuery } from '@tanstack/react-query';
import { fetchPendingVacationCount } from '@/service/records.service';

/**
 * Hook para buscar a contagem de solicitações de férias PENDENTES.
 */
export const useVacationCount = (enabled = true) => {
    const { data: vacationCount = 0, isLoading: isLoadingVacationCount } = useQuery<number>({
        queryKey: ['pendingVacationCount'],
        queryFn: fetchPendingVacationCount,
        enabled,
        refetchInterval: 60000 * 5,
        staleTime: 60000 * 2,
        placeholderData: 0,
    });

    return {
        pendingVacationCount: vacationCount,
        isLoadingVacationCount
    };
};
