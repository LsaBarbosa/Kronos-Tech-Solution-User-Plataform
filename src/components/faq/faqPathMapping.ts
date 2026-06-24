import { FAQ_SCREEN_KEYS } from "@/constants/faqScreenKeys";

/**
 * Mapeia caminhos exatos para screen keys do FAQ.
 * Rotas com parâmetros dinâmicos devem ser tratadas separadamente se necessário.
 */
export const FAQ_SCREEN_KEY_BY_PATH: Record<string, string> = {
  "/dashboard": FAQ_SCREEN_KEYS.DASHBOARD,
  "/documentos": FAQ_SCREEN_KEYS.DOCUMENTS,
  "/meus-documentos": FAQ_SCREEN_KEYS.DOCUMENTS,
  "/enviar-documentos": FAQ_SCREEN_KEYS.DOCUMENTS,
  "/enviar-documento-colaborador": FAQ_SCREEN_KEYS.DOCUMENTS,
  "/lista-colaboradores": FAQ_SCREEN_KEYS.EMPLOYEES,
  "/criar-colaborador": FAQ_SCREEN_KEYS.EMPLOYEES,
  "/criar-administrador": FAQ_SCREEN_KEYS.USERS,
  "/usuario": FAQ_SCREEN_KEYS.USERS,
  "/empresa": FAQ_SCREEN_KEYS.COMPANIES,
  "/empresa/criar": FAQ_SCREEN_KEYS.COMPANIES,
  "/empresa/buscar": FAQ_SCREEN_KEYS.COMPANIES,
  "/empresa/atualizar": FAQ_SCREEN_KEYS.COMPANIES,
  "/empresa/multi-acesso": FAQ_SCREEN_KEYS.COMPANIES,
  "/relatorio-detalhado": FAQ_SCREEN_KEYS.TIME_RECORDS,
  "/espelho-ponto": FAQ_SCREEN_KEYS.TIME_RECORDS,
  "/apuracao-horas": FAQ_SCREEN_KEYS.TIME_RECORDS,
  "/status-do-registro": FAQ_SCREEN_KEYS.TIME_RECORDS,
  "/solicitar-ferias": FAQ_SCREEN_KEYS.VACATION,
  "/ferias": FAQ_SCREEN_KEYS.VACATION,
  "/solicitar-abono": FAQ_SCREEN_KEYS.TIME_OFF,
  "/aprovacoes-abono": FAQ_SCREEN_KEYS.TIME_OFF,
  "/auditoria": FAQ_SCREEN_KEYS.AUDIT,
  "/privacidade": FAQ_SCREEN_KEYS.PRIVACY,
};
