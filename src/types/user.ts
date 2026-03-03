// src/types/user.ts

export type UserRole = 'PARTNER' | 'MANAGER' | 'ADMIN' | 'CTO' | 'USER';

/**
 * Interface para os dados básicos da conta do usuário (geralmente do token ou endpoint de conta).
 */
export interface UserAccountData {
  userId: string;
  username: string;
  role: UserRole | string;
  active: boolean;
  employeeId: string;
}

/**
 * Interface para os dados detalhados do colaborador/usuário.
 * Combina informações do EmployeeProfile (EmployeeResponse) com a role.
 */
export interface UserData {
  employeeId: string;
  fullName: string;
  maskedCpf: string;
  jobPosition: string;
  email: string;
  salary: number;
  phone: string;
  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    state: string;
  };
  companyName: string;
  lastSeenMessageTimestamp: string | null;
  homeOffice: boolean;
  
  // A role é injetada a partir do token no hook para conveniência
  role?: UserRole | string;
  lastLogin?: string; // Mantido
}

/**
 * Interface para os dados necessários para a mudança de senha.
 */
export interface ChangePasswordData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Funções Utilitárias Puras ---

// Função auxiliar para limpar números
export const cleanNumberString = (value: string | undefined): string => (value || '').replace(/\D/g, '');
