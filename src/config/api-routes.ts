export const API_ROUTES = {
  AUTH: "auth",
  COMPANIES: "companies",
  DOCUMENTS: "documents",
  EMPLOYEE: "employee",
  GEOLOCATION: "geolocation",
  LEGAL: "legal",
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
  ACCEPT_BIOMETRIC: "accept-biometric",
  REVOKE_BIOMETRIC: "revoke-biometric",
} as const;

export const LEGAL_PATHS = {
  MIRROR: "espelho-ponto",
  TECHNICAL_CERTIFICATE: "technical-certificate",
  AFD: "afd",
  AEJ: "aej",
} as const;
