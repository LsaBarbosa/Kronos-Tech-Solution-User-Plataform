import { useMutation } from "@tanstack/react-query";
import { hardDeleteCompany } from "@/service/company.service";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { useToast } from "@/hooks/use-toast";

export const useHardDeleteEmpresa = () => {
    const { toast } = useToast();

    return useMutation({
        mutationFn: (cnpj: string) => hardDeleteCompany(cnpj),
        onError: (error) => {
            const err = normalizeServiceError(error);
            toast({
                title: "Erro ao excluir empresa",
                description: err.message,
                variant: "destructive",
            });
        },
    });
};
