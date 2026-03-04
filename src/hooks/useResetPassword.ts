// src/hooks/useResetPassword.ts

import { useState, useCallback, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { resetPasswordSchema, ResetPasswordFormType, ResetPasswordPayload } from "@/types/auth";
import { resetPassword } from "@/service/auth.Service";

interface UseResetPasswordReturn {
    form: UseFormReturn<ResetPasswordFormType>;
    isSubmitting: boolean;
    passwordResetToken: string | null;
    isSuccess: boolean;
    onSubmit: (data: ResetPasswordFormType) => Promise<void>;
}

export const useResetPassword = (): UseResetPasswordReturn => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    // Extrai o token da URL
    const passwordResetToken = searchParams.get('token');

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
        if (!passwordResetToken) {
            toast({ 
                title: "Erro de Token", 
                description: "Token de redefinição não encontrado na URL. Retorne à página de login.", 
                variant: "destructive" 
            });
            navigate("/login");
        }
    }, [passwordResetToken, navigate, toast]);

    const onSubmit = useCallback(async (data: ResetPasswordFormType) => {
        if (!passwordResetToken) {
            toast({ title: "Erro", description: "Token de redefinição não disponível.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: ResetPasswordPayload = {
                passwordResetToken,
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

        } catch (error: any) {
            console.error("Erro ao redefinir senha:", error);
            toast({
                title: "Erro na Redefinição",
                description: error.message || "Falha ao redefinir a senha. O token pode ter expirado.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [passwordResetToken, toast, navigate]);

    return {
        form,
        isSubmitting,
        passwordResetToken,
        isSuccess,
        onSubmit,
    };
};