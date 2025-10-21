// src/types/dashboard.ts

/**
 * Interface para os dados do perfil do usuário no Dashboard.
 */
export interface UserProfile {
  fullName: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  companyName: string;
  role: 'PARTNER' | 'MANAGER' | 'ADMIN' | 'CTO';
  employeeId: string; // Adicionado para consistência
  lastSeenMessageTimestamp?: string; // Para lógica de "novo aviso"
}

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
}

/**
 * Mapeia o role para um nome mais amigável.
 */
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'ADMIN': return 'Administrador';
    case 'CTO': return 'Diretor Executivo (CTO)';
    case 'MANAGER': return 'Gestor de Equipe';
    case 'PARTNER': return 'Colaborador';
    default: return 'Usuário';
  }
};

/**
 * Verifica se o usuário tem permissão de Manager/Admin.
 */
export const hasApprovalPermission = (role: string): boolean => {
  return ['MANAGER', 'ADMIN'].includes(role);
};