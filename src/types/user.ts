// src/types/user.ts

/**
 * Interface para os dados do own profile do usuário.
 * Não deve ser reutilizada para listagens resumidas.
 */
export interface UserOwnProfileData {
  userId: string;
  username: string;
  role: string;
  active: boolean;
  employeeId: string;
}

export type UserAccountData = UserOwnProfileData;

/**
 * Interface para o retorno resumido de /users/search.
 */
export interface UserSearchListItem {
  userId: string;
  employeeId: string;
  username: string;
  role: "PARTNER" | "MANAGER";
  active: boolean;
  biometricConsentAccepted: boolean;
}

export interface UserSearchListResponse {
  users: UserSearchListItem[];
}

export type UserSearchData = UserSearchListItem;

export interface SessionUserData {
  accountData: UserOwnProfileData;
  profileData: UserData;
  userData: UserData & { role: string };
  role: string;
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
  salary: number | null;
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
  sandbox?: boolean;

  // A role é injetada a partir do token no hook para conveniência
  role?: 'PARTNER' | 'MANAGER' | 'ADMIN' | 'CTO' | 'USER' | string;
  lastLogin?: string; // Mantido
}

/**
 * Interface para os dados necessários para a mudança de senha.
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Funções Utilitárias Puras ---

// Função auxiliar para limpar números
export const cleanNumberString = (value: string | undefined): string => (value || '').replace(/\D/g, '');
