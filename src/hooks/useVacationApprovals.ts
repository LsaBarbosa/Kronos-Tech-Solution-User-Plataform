// ARQUIVO: src/hooks/useVacationApprovals.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EMPTY_VACATION_REQUEST_PAGE,
  VacationQueryParams,
  VacationRequestPageResponse,
} from "@/types/vacation";
import { toast } from "@/hooks/use-toast";
import { fetchVacationRequests, approveVacationRequest, rejectVacationRequest } from "@/service/records.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";

export const useVacationApprovals = (params: VacationQueryParams) => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['vacationRequests', params],
        queryFn: () => fetchVacationRequests(params),
        placeholderData: EMPTY_VACATION_REQUEST_PAGE,
    });

    const { mutate: approveMutate, isPending: isApproving } = useMutation({
        mutationFn: (ids: number[]) => approveVacationRequest(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacationRequests'] });
            toast.success("Férias aprovadas com sucesso!");
        },
        onError: (error) => {
            toast.error(`Falha na aprovação: ${getServiceErrorMessage(error)}`);
        },
    });

    const { mutate: rejectMutate, isPending: isRejecting } = useMutation({
        mutationFn: (ids: number[]) => rejectVacationRequest(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacationRequests'] });
            toast.success("Férias rejeitadas com sucesso!");
        },
        onError: (error) => {
            toast.error(`Falha na rejeição: ${getServiceErrorMessage(error)}`);
        },
    });

    const approve = (ids: number[]) => approveMutate(ids);
    const reject = (ids: number[]) => rejectMutate(ids);
    const pageData: VacationRequestPageResponse = data ?? EMPTY_VACATION_REQUEST_PAGE;

    return {
        requests: pageData.requests,
        pageData,
        totalPages: pageData.totalPages,
        totalElements: pageData.totalElements,
        currentPage: pageData.currentPage,
        isLoading,
        isMutating: isApproving || isRejecting,
        approve,
        reject,
    };
};
