export const API_ROUTES = {
  AUTH: "auth",
  COMPANIES: "companies",
  DOCUMENTS: "documents",
  EMPLOYEE: "employee",
  LEGAL: "legal",
  MESSAGES: "messages",
  RECORDS: "records",
  TERMS: "terms",
  USERS: "users",
} as const;

export const buildRoute = (...segments: string[]) => `/${segments.join("/")}`;
