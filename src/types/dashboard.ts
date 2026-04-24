// src/types/dashboard.ts

// import { UserData } from "@/types/user"; // Não é mais necessário importar UserData aqui

// 💡 REMOVIDO: UserProfile (agora consolidado em UserData no src/types/user.ts)

/**
 * Interface para o contador de aprovações pendentes.
 */
export interface ApprovalStats {
  count: number;
}


/**
 * Interface para os avisos (simplificada para notificação).
 */
export interface WarningMessage {
  messageId: string;
  createdAt: string;
  title: string;
  priority: string;
  // Outros campos relevantes para exibir no dashboard
  [key: string]: unknown;
}

// Utilitários de role
// 💡 CORRIGIDO: Tipagem ajustada para aceitar string
export const getRoleDisplayName = (role: string): string => {
    switch (role) {
        case 'MANAGER': return 'Gestor';
        case 'CTO': return 'CTO';
        case 'PARTNER': return 'Colaborador';
        default: return 'Colaborador';
    }
};

/**
 * Verifica se o usuário tem permissão de Manager/Admin.
 */
export const hasApprovalPermission = (role: string): boolean => {
  return ['MANAGER'].includes(role);
};
