// src/types/dashboard.ts

import type { UserRole } from '@/types/user';

export interface ApprovalStats {
  count: number;
}

export interface WarningMessage {
  messageId: string;
  createdAt: string;
  title: string;
  priority: string;
  [key: string]: unknown;
}

const ROLE_DISPLAY_NAME_MAP: Partial<Record<UserRole, string>> = {
  MANAGER: 'Gestor',
  CTO: 'CTO',
  PARTNER: 'Colaborador',
};

export const getRoleDisplayName = (role?: string): string => {
  const normalizedRole = (role ?? "").toUpperCase() as UserRole;
  return ROLE_DISPLAY_NAME_MAP[normalizedRole] ?? 'Colaborador';
};

const APPROVAL_ALLOWED_ROLES: ReadonlySet<UserRole> = new Set(['MANAGER']);

export const hasApprovalPermission = (role?: string): boolean => {
  const normalizedRole = (role ?? "").toUpperCase() as UserRole;
  return APPROVAL_ALLOWED_ROLES.has(normalizedRole);
};
