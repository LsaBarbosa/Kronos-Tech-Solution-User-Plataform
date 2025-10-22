// src/types/dashboard.ts

/**
 * Interface para os dados do perfil do usuário no Dashboard.
 */
export interface UserProfile {
  fullName: string;
  jobPosition: string;
  email: string;
  salary: number; // Salário como number (para formatação)
  phone: string; // Telefone como string
  companyName: string;
  role: 'PARTNER' | 'MANAGER' | 'ADMIN' | 'CTO' | 'USER'; // Assumindo as roles
  employeeId: string; // Adicionado para consistência
  lastSeenMessageTimestamp?: string; // Para lógica de "novo aviso"
  profilePhotoUrl?: string; // URL da foto de perfil
}
/**
 * Interface para o contador de aprovações pendentes.
 */
// 💡 NOVO: Exportação da interface ApprovalStats
export interface ApprovalStats {
  count: number;
}


/**
 * Interface para os avisos (simplificada para notificação).
 * 💡 CORREÇÃO: Usaremos 'Warning' no hook, mas a versão do serviço pode usar 'WarningMessage'
 */
export interface WarningMessage {
  messageId: string;
  createdAt: string;
  title: string;
  priority: string;
  // Outros campos relevantes para exibir no dashboard
  [key: string]: any;
}

// Utilitários de role (se você os usa, caso contrário pode ser removido)
export const getRoleDisplayName = (role: UserProfile['role'] | string): string => {
    switch (role) {
        case 'MANAGER': return 'Gestor';
        case 'CTO': return 'CTO';
        case 'PARTNER': return 'Colaborador';
        default: return 'Colaborador';
    }
};

/**
 * Verifica se o usuário tem permissão de Manager/Admin.
 * 💡 NOVO: Exportação da função hasApprovalPermission
 */
export const hasApprovalPermission = (role: string): boolean => {
  return ['MANAGER'].includes(role);
};