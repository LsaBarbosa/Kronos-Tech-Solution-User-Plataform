// ARQUIVO: src/hooks/useVacationApprovals.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  VacationQueryParams,
  VacationRequestPageResponse} from "@/types/vacation";
import {
  EMPTY_VACATION_REQUEST_PAGE
} from "@/types/vacation";
import { toast } from "@/hooks/use-toast";
import { fetchVacationRequests, approveVacationRequest, rejectVacationRequest } from "@/service/records.service";
import { getAdministrativeErrorMessage } from "@/service/helpers/admin-error-message.helper";
import { queryKeys } from "@/lib/query-keys";

export const useVacationApprovals = (params: VacationQueryParams) => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: [...queryKeys.vacationRequests, params],
        queryFn: () => fetchVacationRequests(params),
        placeholderData: EMPTY_VACATION_REQUEST_PAGE,
    });

    const { mutate: approveMutate, isPending: isApproving } = useMutation({
        mutationFn: (ids: number[]) => approveVacationRequest(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.vacationRequests });
            toast.success("Férias aprovadas com sucesso!");
        },
        onError: (error) => {
            toast.error(`Falha na aprovação: ${getAdministrativeErrorMessage(error, "vacation")}`);
        },
    });

    const { mutate: rejectMutate, isPending: isRejecting } = useMutation({
        mutationFn: (ids: number[]) => rejectVacationRequest(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.vacationRequests });
            toast.success("Férias rejeitadas com sucesso!");
        },
        onError: (error) => {
            toast.error(`Falha na rejeição: ${getAdministrativeErrorMessage(error, "vacation")}`);
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
