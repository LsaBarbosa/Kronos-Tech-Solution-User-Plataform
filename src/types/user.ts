/**
 * Papéis suportados pela aplicação.
 */
export type UserRole = 'PARTNER' | 'MANAGER' | 'ADMIN' | 'CTO' | 'USER' | string;

/**
 * Interface para os dados básicos da conta do usuário (sessão).
 */
export interface UserAccountData {
  userId: string;
  username: string;
  role: UserRole;
  active: boolean;
  employeeId: string;
  companyId: string;
  claims: Record<string, unknown>;
}

/**
 * Interface para os dados detalhados do colaborador/usuário.
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
  role: UserRole;
  lastLogin: string | null;
}

export interface UserSessionProfile {
  account: UserAccountData;
  profile: UserData;
}

/**
 * Interface para os dados necessários para a mudança de senha.
 */
export interface ChangePasswordData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export const cleanNumberString = (value: string | undefined): string => (value || '').replace(/\D/g, '');
