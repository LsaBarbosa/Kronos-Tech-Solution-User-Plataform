import { useState, useEffect, useCallback } from 'react';
import * as PendingApprovalService from '@/service/pendingApproval.service';
import { ITimeOffQueryParams, ITimeRecordPageResponse } from '@/types/recordApproval';
import { useToast } from '@/components/ui/use-toast';

// Define o tipo de dados e funções que o hook irá retornar
export interface UseTimeOffApprovalsReturn {
    approvalsData: ITimeRecordPageResponse | null;
    isLoading: boolean;
    isMutating: boolean;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    employeeNameFilter: string;
    setEmployeeNameFilter: (name: string) => void;
    statusFilter: ITimeOffQueryParams['status'];
    setStatusFilter: (status: ITimeOffQueryParams['status']) => void;
    handleSearch: () => void;
    handleAction: (timeRecordId: number, action: 'approve' | 'reject') => Promise<void>;
    refetch: () => void;
    // Adicionamos o estado para controlar a abertura da Sidebar (consistência com PendingApprovals)
    sidebarOpen: boolean;
    handleToggleSidebar: () => void;
}

const ROWS_PER_PAGE = 5;
const INITIAL_STATUS_FILTER: ITimeOffQueryParams['status'] = 'PENDING';

export const useTimeOffApprovals = (): UseTimeOffApprovalsReturn => {
    const { toast } = useToast();
    const [approvalsData, setApprovalsData] = useState<ITimeRecordPageResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [employeeNameFilter, setEmployeeNameFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ITimeOffQueryParams['status']>(INITIAL_STATUS_FILTER);
    
    // Estado para Sidebar (importado do padrão PendingApprovals)
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);


    const fetchApprovals = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await PendingApprovalService.listTimeOffRequests({
                page: currentPage,
                size: ROWS_PER_PAGE,
                employeeName: searchQuery,
                status: statusFilter,
            });
            setApprovalsData(data);
        } catch (error) {
            console.error('Erro ao buscar aprovações de abono:', error);
            toast({
                title: 'Erro de Carregamento',
                description: 'Não foi possível carregar as solicitações de abono.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchQuery, statusFilter, toast]);

    const handleAction = async (timeRecordId: number, action: 'approve' | 'reject'): Promise<void> => {
        setIsMutating(true);
        try {
            if (action === 'approve') {
                await PendingApprovalService.approveTimeOff(timeRecordId);
                toast({ title: 'Sucesso', description: 'Abono aprovado com sucesso!' });
            } else {
                await PendingApprovalService.rejectTimeOff(timeRecordId);
                toast({ title: 'Sucesso', description: 'Abono rejeitado com sucesso!' });
            }
            await fetchApprovals(); // Recarrega a lista após a ação
        } catch (error) {
            console.error(`Erro ao ${action} abono:`, error);
            toast({
                title: 'Erro',
                description: `Não foi possível ${action} o abono. Detalhes: ${(error as Error).message}`,
                variant: 'destructive',
            });
        } finally {
            setIsMutating(false);
        }
    };

    const handleSearch = () => {
        if (currentPage !== 0) {
            setCurrentPage(0); // Força refetch com a nova query na página 0
        } else {
            setSearchQuery(employeeNameFilter); // Mantém a página atual e dispara o refetch via useEffect
        }
    };

    const refetch = () => {
        fetchApprovals();
    };

    // Efeito para buscar dados quando a página ou a query de busca muda
    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals, searchQuery]);

    // Reseta a página para 0 sempre que o filtro de status muda
    useEffect(() => {
        setCurrentPage(0);
    }, [statusFilter]);


    return {
        approvalsData,
        isLoading,
        isMutating,
        currentPage,
        setCurrentPage,
        employeeNameFilter,
        setEmployeeNameFilter,
        statusFilter,
        setStatusFilter,
        handleSearch,
        handleAction,
        refetch,
        sidebarOpen,
        handleToggleSidebar,
    };
};