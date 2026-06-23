// src/hooks/useResetPassword.ts

import { useState, useCallback, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { ResetPasswordFormType, ResetPasswordPayload } from "@/types/auth";
import { resetPasswordSchema } from "@/types/auth";
import { resetPassword } from "@/service/auth.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { safeLogger } from "@/utils/security/safeLogger";

interface UseResetPasswordReturn {
    form: UseFormReturn<ResetPasswordFormType>;
    isSubmitting: boolean;
    token: string | null;
    isSuccess: boolean;
    onSubmit: (data: ResetPasswordFormType) => Promise<void>;
}

export const useResetPassword = (): UseResetPasswordReturn => {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Lê o token de sessionStorage (depositado por TokenRedirect) e limpa imediatamente
    const [token] = useState<string | null>(() => {
        const t = sessionStorage.getItem("pwd_reset_token");
        if (t) sessionStorage.removeItem("pwd_reset_token");
        return t;
    });

    const form = useForm<ResetPasswordFormType>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Efeito para checar o token e redirecionar se inválido
    useEffect(() => {
        if (!token) {
            toast({ 
                title: "Erro de Token", 
                description: "Token de redefinição não encontrado na URL. Retorne à página de login.", 
                variant: "destructive" 
            });
            navigate("/login");
        }
    }, [token, navigate, toast]);

    const onSubmit = useCallback(async (data: ResetPasswordFormType) => {
        if (!token) {
            toast({ title: "Erro", description: "Token não disponível.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: ResetPasswordPayload = {
                token: token,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            };

            await resetPassword(payload); // 💡 Chama o Serviço

            setIsSuccess(true);
            toast({
                title: "Sucesso!",
                description: "Sua senha foi redefinida com sucesso. Você pode fazer login.",
            });
            
            // Redireciona para login após um pequeno atraso
            setTimeout(() => navigate("/login"), 3000);

        } catch (error: unknown) {
            safeLogger.error("Erro ao redefinir senha:", error);
            toast({
                title: "Erro na Redefinição",
                description: getServiceErrorMessage(
                    error,
                    "Falha ao redefinir a senha. O token pode ter expirado."
                ),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [token, toast, navigate]);

    return {
        form,
        isSubmitting,
        token,
        isSuccess,
        onSubmit,
    };
};
