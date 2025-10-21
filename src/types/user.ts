/**
 * Interface para os dados básicos da conta do usuário (geralmente do token ou endpoint de conta).
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
 */
export interface UserData {
  fullName: string;
  email: string;
  jobPosition: string;
  phone: string;
  lastLogin?: string;
  maskedCpf: string;
  address: {
    street: string;
    number: string;
    postalCode: string;
    city: string;
    state: string;
  };
}

/**
 * Interface para os dados necessários para a mudança de senha.
 */
export interface ChangePasswordData {
  oldPassword?: string;
  newPassword: string;
  confirmNewPassword: string;
}