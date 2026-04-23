// src/hooks/useTimeOffCount.ts

import { useState, useEffect } from 'react';
import * as RecordsService from '@/service/records.service';
import { ITimeRecordPageResponse } from '@/types/recordApproval';
import { useToast } from "@/hooks/use-toast";

export interface UseTimeOffCountReturn {
    pendingTimeOffCount: number;
    isLoadingTimeOffCount: boolean;
    refetchTimeOffCount: () => void;
}

export const useTimeOffCount = (): UseTimeOffCountReturn => {
    const { toast } = useToast();
    const [pendingTimeOffCount, setPendingTimeOffCount] = useState<number>(0);
    const [isLoadingTimeOffCount, setIsLoadingTimeOffCount] = useState(true);

    const fetchTimeOffCount = async () => {
        setIsLoadingTimeOffCount(true);
        try {
            // Filtra por status 'PENDING' e pega apenas o primeiro elemento (page: 0, size: 1)
            // para obter o totalElements com o mínimo de dados, se o serviço suportar
            const data: ITimeRecordPageResponse = await RecordsService.listTimeOffRequests({
                page: 0,
                size: 1,
                employeeName: '',
                status: 'PENDING',
            });
            
            // Assume que ITimeRecordPageResponse tem totalElements para a paginação
            setPendingTimeOffCount(data.totalElements || 0);
        } catch (error) {
            console.error("Erro ao buscar contagem de abonos pendentes:", error);
            setPendingTimeOffCount(0);
            // Opcional: toast({ title: "Erro", description: "Falha ao carregar contagem de abonos." });
        } finally {
            setIsLoadingTimeOffCount(false);
        }
    };

    useEffect(() => {
        fetchTimeOffCount();
    }, []);

    const refetchTimeOffCount = () => {
        fetchTimeOffCount();
    };

    return {
        pendingTimeOffCount,
        isLoadingTimeOffCount,
        refetchTimeOffCount,
    };
};
