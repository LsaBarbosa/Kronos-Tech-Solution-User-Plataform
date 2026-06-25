import { api } from "@/config/api";
import { API_ROUTES, FAQ_PATHS, buildRoute } from "@/config/api-routes";
import type { FaqContextualResponse, FaqItem, FaqSearchResponse } from "@/types/faq";

/**
 * Busca FAQs por query, com suporte a filtro por tela e paginação.
 * O back-end filtra por role do usuário autenticado; o front-end não envia role.
 */
export const searchFaqs = async (
  query: string,
  screen?: string,
  page = 0,
  size = 10
): Promise<FaqSearchResponse> => {
  const params: Record<string, unknown> = { page, size };
  if (query.trim()) {
    params.query = query.trim();
  }
  if (screen) {
    params.screen = screen;
  }
  const response = await api.get<FaqSearchResponse>(
    buildRoute(API_ROUTES.FAQ, FAQ_PATHS.SEARCH),
    { params }
  );
  return response.data;
};

/**
 * Retorna FAQs contextuais para a tela informada.
 * O back-end filtra por role e tela; o front-end apenas renderiza o retorno.
 */
export const getContextualFaqs = async (
  screen: string,
  limit = 5
): Promise<FaqContextualResponse> => {
  const response = await api.get<FaqContextualResponse>(
    buildRoute(API_ROUTES.FAQ, FAQ_PATHS.CONTEXTUAL),
    { params: { screen, limit } }
  );
  return response.data;
};

/**
 * Retorna o detalhe de um FAQ por ID.
 */
export const getFaqById = async (faqId: string): Promise<FaqItem> => {
  const response = await api.get<FaqItem>(
    buildRoute(API_ROUTES.FAQ, FAQ_PATHS.BY_ID(faqId))
  );
  return response.data;
};
