/**
 * Constantes de paginação padrão para toda a aplicação
 * Alinhadas com os defaults do back-end PROD_HOSTINGER
 */

export const PAGINATION_DEFAULTS = {
  // Página padrão (zero-indexed, como esperado pelo back-end)
  DEFAULT_PAGE: 0,

  // Tamanho padrão de página (usado na maioria dos endpoints)
  DEFAULT_PAGE_SIZE: 10,

  // Tamanho específico para pending-approvals (back-end hardcoda size=5)
  PENDING_APPROVALS_PAGE_SIZE: 5,

  // Tamanho específico para time-off/requests (back-end hardcoda size=5)
  TIME_OFF_PAGE_SIZE: 5,

  // Tamanho específico para vacation requests (back-end usa size=10)
  VACATION_PAGE_SIZE: 10,

  // Máximo de itens que o back-end retorna por página
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Helper para criar parâmetros de paginação padrão
 */
export const createPaginationParams = (
  page: number = PAGINATION_DEFAULTS.DEFAULT_PAGE,
  size: number = PAGINATION_DEFAULTS.DEFAULT_PAGE_SIZE
) => ({
  page,
  size,
});
