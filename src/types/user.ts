// src/types/user.ts

/**
 * Interface para os dados básicos da conta do usuário (geralmente do token ou endpoint de conta).
 */
export interface UserAccountData {
  userId: string;
  username: string;
  role: string;
  active: boolean;
  employeeId: string;
  companyId?: string;
  claims?: Record<string, unknown>;
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
  role?: 'PARTNER' | 'MANAGER' | 'ADMIN' | 'CTO' | 'USER' | string; 
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
