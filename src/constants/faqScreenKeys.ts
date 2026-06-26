import { APP_PATHS } from "@/config/app-routes";

export const FAQ_SCREEN_KEYS = {
  DASHBOARD:    "DASHBOARD",
  DOCUMENTS:    "DOCUMENTS",
  EMPLOYEES:    "EMPLOYEES",
  USERS:        "USERS",
  COMPANIES:    "COMPANIES",
  TIME_RECORDS: "TIME_RECORDS",
  VACATION:     "VACATION",
  TIME_OFF:     "TIME_OFF",
  AUDIT:        "AUDIT",
  PRIVACY:      "PRIVACY",
  MESSAGES:     "MESSAGES",
  CONTRACTS:    "CONTRACTS",
  REPORTS:      "REPORTS",
  PROFILE:      "PROFILE",
} as const;

export type FaqScreenKey = (typeof FAQ_SCREEN_KEYS)[keyof typeof FAQ_SCREEN_KEYS];

export const FAQ_SCREEN_ROUTES: Record<string, { label: string; path: (role: string) => string }> = {
  DASHBOARD:    { label: "Início",             path: ()     => APP_PATHS.dashboard },
  DOCUMENTS:    { label: "Documentos",         path: (role) => role === "PARTNER" ? APP_PATHS.meusDocumentos : APP_PATHS.documentos },
  EMPLOYEES:    { label: "Colaboradores",      path: ()     => APP_PATHS.listaColaboradores },
  USERS:        { label: "Usuários",           path: ()     => APP_PATHS.administracao },
  COMPANIES:    { label: "Empresas",           path: ()     => APP_PATHS.empresa },
  TIME_RECORDS: { label: "Registros de Ponto", path: (role) => role === "PARTNER" ? APP_PATHS.espelhoPonto : APP_PATHS.apuracaoHoras },
  VACATION:     { label: "Férias",             path: (role) => role === "PARTNER" ? APP_PATHS.solicitarFerias : APP_PATHS.ferias },
  TIME_OFF:     { label: "Abono",              path: (role) => role === "PARTNER" ? APP_PATHS.solicitarAbono : APP_PATHS.aprovacoesAbono },
  AUDIT:        { label: "Auditoria Fiscal",   path: ()     => APP_PATHS.auditoria },
  PRIVACY:      { label: "Privacidade",        path: ()     => APP_PATHS.privacidade },
  MESSAGES:     { label: "Avisos",             path: ()     => APP_PATHS.avisos },
  CONTRACTS:    { label: "Contratos",          path: (role) => role === "PARTNER" ? APP_PATHS.assinaturaContrato : APP_PATHS.contratosAdmin },
  REPORTS:      { label: "Relatório de Horas", path: (role) => role === "PARTNER" ? APP_PATHS.espelhoPonto : APP_PATHS.relatorioDetalhado },
  PROFILE:      { label: "Meu Perfil",         path: ()     => APP_PATHS.usuario },
};
