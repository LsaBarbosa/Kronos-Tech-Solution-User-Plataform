export const API_ROUTES = {
  AUTH: "auth",
  COMPANIES: "companies",
  DOCUMENTS: "documents",
  EMPLOYEE: "employee",
  GEOLOCATION: "geolocation",
  LEGAL: "legal",
  LGPD: "lgpd",
  MESSAGES: "messages",
  RECORDS: "records",
  TERMS: "terms",
  USERS: "users",
} as const;

export const buildRoute = (...segments: string[]) => `/${segments.join("/")}`;

export const AUTH_PATHS = {
  LOGIN: "login",
  LOGIN_FACE: "login-face",
  RECOVER_PASSWORD: "recover-password",
  RESET_PASSWORD: "reset-password",
  LOGOUT: "logout",
} as const;

export const TERMS_PATHS = {
  STATUS: "status",
  CURRENT_BIOMETRIC: "biometric/current",
  ACCEPT_BIOMETRIC: "accept-biometric",
  REVOKE_BIOMETRIC: "revoke-biometric",
} as const;

export const LEGAL_PATHS = {
  MIRROR: "espelho-ponto",
  TECHNICAL_CERTIFICATE: "technical-certificate",
  AFD: "afd",
  AEJ: "aej",
} as const;

export const DOCUMENT_PATHS = {
  UPLOAD: "",
  DOWNLOAD: (documentId: string) => documentId,
  DELETE: (documentId: string) => documentId,
} as const;

export const RECORD_PATHS = {
  CHECKIN: "checkin",
  PENDING_APPROVALS: "pending-approvals",
  REPORT: "report",
  APPROVE: (timeRecordId: number | string) => `approve/${timeRecordId}`,
  REJECT: (timeRecordId: number | string) => `reject/${timeRecordId}`,
  UPDATE_STATUS: (employeeId: string, timeRecordId: string) => `update/status/${employeeId}/${timeRecordId}`,
  TOGGLE_ACTIVATE: (employeeId: string, timeRecordId: string) => `toggle-activate/${employeeId}/${timeRecordId}`,
  UPDATE_TIME_RECORD: (timeRecordId: number | string) => `update/time-record/${timeRecordId}`,
  DELETE: (employeeId: string, timeRecordId: number | string) => `${employeeId}/${timeRecordId}`,
  VACATION_REQUEST: "vacation-request",
  VACATION_APPROVE: "vacation-request/approve",
  VACATION_REJECT: "vacation-request/reject",
  TIME_OFF_REQUEST: "time-off/request",
  TIME_OFF_REQUESTS: "time-off/requests",
  TIME_OFF_APPROVE: (timeRecordId: number) => `time-off/approve/${timeRecordId}`,
  TIME_OFF_REJECT: (timeRecordId: number) => `time-off/reject/${timeRecordId}`,
} as const;

export const VACATION_PATHS = {
  REQUEST: "vacation-request",
  APPROVE: "vacation-request/approve",
  REJECT: "vacation-request/reject",
} as const;

export const USER_PATHS = {
  SEARCH: "search",
  CHECK_USERNAME: "check-username",
  TOGGLE_ACTIVATE: (userId: string) => `toggle-activate/${userId}`,
  UPDATE: (userId: string) => `${userId}`,
} as const;

export const EMPLOYEE_PATHS = {
  CHECK_CPF: "check-cpf",
  OWN_PROFILE: "own-profile",
  MARK_MESSAGES_SEEN: "mark-messages-seen",
} as const;

export const COMPANY_PATHS = {
  SEARCH: (cnpj: string) => cnpj,
  TOGGLE_ACTIVATE: (cnpj: string) => `${cnpj}/toggle-activate`,
  UPDATE: (cnpj: string) => cnpj,
} as const;

export const MESSAGE_PATHS = {
  DELETE: (messageId: string) => messageId,
} as const;

export const LGPD_PATHS = {
  REQUESTS: "requests",
  EMPLOYEE_EXPORT: (employeeId: string) => `employees/${employeeId}/export`,
  EMPLOYEE_ANONYMIZE: (employeeId: string) => `employees/${employeeId}/anonymize`,
  ADMIN_REQUESTS: "admin/requests",
  ADMIN_REQUEST_DETAILS: (requestId: string) => `admin/requests/${requestId}`,
  ASSIGN_REQUEST: (requestId: string) => `admin/requests/${requestId}/assign`,
  ADD_NOTE: (requestId: string) => `admin/requests/${requestId}/notes`,
  COMPLETE_REQUEST: (requestId: string) => `admin/requests/${requestId}/complete`,
  REJECT_REQUEST: (requestId: string) => `admin/requests/${requestId}/reject`,
  TRANSITION_STATUS: (requestId: string) => `admin/requests/${requestId}/transition-status`,
  REQUEST_COMPLEMENT: (requestId: string) => `admin/requests/${requestId}/request-complement`,
  CANCEL_REQUEST: (requestId: string) => `admin/requests/${requestId}/cancel`,
  INVENTORY: "inventory",
  INVENTORY_ACTIVE: "inventory/active",
  INVENTORY_BY_CODE: (processCode: string) => `inventory/${processCode}`,
} as const;
