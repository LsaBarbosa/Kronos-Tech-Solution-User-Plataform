// src/types/auth.ts

import * as z from "zod";

// --- INTERFACES DE DADOS ---

/**
 * Payload de solicitação de recuperação de senha (EsqueciSenha).
 */
export interface RecoverPasswordPayload {
    cpf: string;
    email: string;
}

/**
 * Payload de redefinição de senha (ResetPassword).
 */
export interface ResetPasswordPayload {
    token: string;
    newPassword: string;
    confirmPassword: string
}

/**
 * Resposta de login (credencial ou facial).
 * A autenticação é baseada no cookie de sessão; qualquer payload extra é opcional.
 */
export interface LoginResponse {
    token?: string;
    [key: string]: unknown;
}


// --- ESQUEMAS DE VALIDAÇÃO ---

// Padrão de validação de senha (consistente com o seu código original)
export const passwordValidation = z
  .string()
  .min(8, "Mínimo de 8 caracteres")
  .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
  .regex(/\d/, "Deve conter pelo menos um dígito");

// 1. Esquema para Solicitar Recuperação de Senha (EsqueciSenha)
export const forgotPasswordSchema = z.object({
  cpf: z.string().min(14, "CPF inválido ou incompleto"), // Assumindo o formato mascarado 000.000.000-00
  email: z.string().email("Email inválido"),
});
export type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;


// 2. Esquema para Redefinir Senha (ResetPassword)
export const resetPasswordSchema = z
  .object({
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormType = z.infer<typeof resetPasswordSchema>;


// --- FUNÇÕES UTILIÁRIAS PURAS ---

// Função para formatar o CPF (do seu código)
export const maskCPF = (value: string): string => {
    // Limpa a string para conter apenas dígitos
    const cleanValue = value.replace(/\D/g, "");
    
    // Aplica a máscara
    if (cleanValue.length <= 3) return cleanValue;
    if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
    if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9, 11)}`;
};

// Função para limpar CPF (remove máscara)
export const cleanCPF = (value: string): string => value.replace(/\D/g, "");
