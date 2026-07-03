import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleCompanyStatus } from "@/service/company.service";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { useToast } from "@/hooks/use-toast";

export const useGerenciarStatusEmpresa = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (cnpj: string) => toggleCompanyStatus(cnpj),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
        },
        onError: (error) => {
            const err = normalizeServiceError(error);
            toast({
                title: "Erro ao alterar status da empresa",
                description: err.message,
                variant: "destructive",
            });
        },
    });
};
