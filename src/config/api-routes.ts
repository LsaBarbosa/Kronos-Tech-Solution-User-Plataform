export const API_ROUTES = {
  AUTH: "auth",
  COMPANIES: "companies",
  DOCUMENTS: "documents",
  EMPLOYEE: "employee",
  GEOLOCATION: "geolocation",
  LEGAL: "legal",
  MESSAGES: "messages",
  RECORDS: "records",
  USERS: "users",
} as const;

export const buildRoute = (...segments: string[]) => `/${segments.join("/")}`;
