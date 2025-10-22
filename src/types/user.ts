// src/types/user.ts

/**
 * Interface para os dados básicos da conta do usuário (geralmente do token ou endpoint de conta).
 * A role e o employeeId vêm do token/dados da conta.
 */
export interface UserAccountData {
  userId: string;
  username: string;
  role: string;
  active: boolean;
  employeeId: string;
}

/**
 * Interface para os dados detalhados do colaborador/usuário.
 * 💡 ATUALIZADO: Inclui todos os campos do payload da API + role (adicionada no hook).
 */
export interface UserData {
  employeeId: string;
  fullName: string;
  maskedCpf: string; // <-- NOVO
  jobPosition: string;
  email: string;
  salary: number; // <-- NOVO
  phone: string;
  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    state: string;
  };
  companyName: string; // <-- NOVO
  lastSeenMessageTimestamp: string | null; // <-- NOVO
  homeOffice: boolean; // <-- NOVO
  
  // Adicionado no hook (vem do UserAccountData/Token) para conveniência
  role?: 'PARTNER' | 'MANAGER' | 'ADMIN' | 'CTO' | 'USER' | string; 
  lastLogin?: string; // Mantido
}

/**
 * Interface para os dados necessários para a mudança de senha.
 */
export interface ChangePasswordData {
  oldPassword?: string;
  newPassword: string;
  confirmNewPassword: string;
}

// --- Funções Utilitárias Puras ---

// Função auxiliar para limpar números
export const cleanNumberString = (value: string | undefined): string => (value || '').replace(/\D/g, '');