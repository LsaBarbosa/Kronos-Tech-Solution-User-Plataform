// src/hooks/useForgotPassword.ts

import { useState, useCallback } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { forgotPasswordSchema, ForgotPasswordFormType, cleanCPF } from "@/types/auth";
import { recoverPasswordRequest } from "@/service/auth.Service";

interface UseForgotPasswordReturn {
    form: UseFormReturn<ForgotPasswordFormType>;
    isSubmitting: boolean;
    isSuccess: boolean;
    onSubmit: (data: ForgotPasswordFormType) => Promise<void>;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
    const form = useForm<ForgotPasswordFormType>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            cpf: "",
            email: "",
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const onSubmit = useCallback(async (data: ForgotPasswordFormType) => {
        setIsSubmitting(true);
        setIsSuccess(false);

        try {
            const payload = {
                cpf: cleanCPF(data.cpf), // Limpa o CPF antes de enviar
                email: data.email,
            };

            await recoverPasswordRequest(payload); // 💡 Chama o Serviço

            setIsSuccess(true);
            toast({
                title: "Solicitação Enviada",
                description: "Verifique seu e-mail para o link de recuperação de senha.",
            });

            form.reset({
                cpf: data.cpf, // Mantém o valor para visualização no form de sucesso
                email: data.email,
            });

        } catch (error: any) {
            console.error("Erro na recuperação de senha:", error);
            toast({
                title: "Erro na Solicitação",
                description: error.message || "Não foi possível processar a solicitação. Verifique os dados.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [toast, form]);

    return {
        form,
        isSubmitting,
        isSuccess,
        onSubmit,
    };
};