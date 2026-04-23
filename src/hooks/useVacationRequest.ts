// NOVO ARQUIVO: src/hooks/useVacationRequest.ts

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import { format } from 'date-fns';
import * as z from 'zod';
import { IRequestVacationRequest, IManagerOption } from '@/types/vacation';
import { requestVacation, fetchManagerOptions } from '@/service/records.service';
import { getServiceErrorMessage } from '@/service/helpers/service-error.helper';

// --- Zod Schema para Validação ---
const VacationSchema = z.object({
    startDate: z.date({
        required_error: "A data de início é obrigatória.",
    }).refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), { 
        message: "A data de início não pode ser passada.",
    }),
    endDate: z.date({
        required_error: "A data de fim é obrigatória.",
    }).refine(date => date >= new Date(new Date().setHours(0, 0, 0, 0)), { 
        message: "A data de fim não pode ser passada.",
    }),
    managerId: z.string().min(1, "O manager para aprovação é obrigatório."),
}).refine(data => data.endDate >= data.startDate, {
    message: "A data de fim não pode ser anterior à data de início.",
    path: ["endDate"],
});


export const useVacationRequest = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [managerId, setManagerId] = useState<string>('');

    // --- Fetch de Managers ---
    const { data: managerOptions, isLoading: isLoadingManagers } = useQuery({
        queryKey: ['managerOptions'],
        queryFn: fetchManagerOptions,
    });

    // --- Mutação (API POST) ---
    const { mutate, isPending } = useMutation({
        mutationFn: (data: IRequestVacationRequest) => requestVacation(data),
        onSuccess: (createdIds) => {
            toast.success(`Solicitação de férias enviada com sucesso! ${createdIds.length} dias registrados para aprovação.`);
            // Limpar formulário
            setStartDate(undefined);
            setEndDate(undefined);
            setManagerId('');
        },
        onError: (error) => {
            toast.error(`Falha na solicitação: ${getServiceErrorMessage(error)}`);
        },
    });

    // --- Função de Submissão ---
    const onSubmit = () => {
        try {
            // 1. Validação com Zod
            const rawData = { startDate, endDate, managerId };
            const validatedData = VacationSchema.parse(rawData);

            // 2. Formatação das Datas para o padrão do Backend ('dd-MM-yyyy')
            const formattedRequest: IRequestVacationRequest = {
                startDate: format(validatedData.startDate, 'dd-MM-yyyy'),
                endDate: format(validatedData.endDate, 'dd-MM-yyyy'),
                managerId: validatedData.managerId,
            };

            // 3. Execução da Mutação
            mutate(formattedRequest);

        } catch (error) {
            if (error instanceof z.ZodError) {
                // Exibe o primeiro erro de validação para o usuário
                const firstError = error.errors[0];
                toast.error(`Erro de Validação: ${firstError.message}`, {
                    description: `Campo: ${firstError.path.join('.')}`
                });
            } else {
                toast.error(getServiceErrorMessage(error, "Erro desconhecido ao processar a solicitação."));
            }
        }
    };

    return {
        startDate, setStartDate,
        endDate, setEndDate,
        managerId, setManagerId,
        managerOptions: managerOptions || [],
        isLoadingManagers,
        isSubmitting: isPending,
        onSubmit,
    };
};
