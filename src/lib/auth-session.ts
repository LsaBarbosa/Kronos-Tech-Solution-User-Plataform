import { queryClient } from '@/lib/queryClient';

/**
 * Limpa estado local de autenticação em memória.
 */
export const clearLocalAuthSession = (): void => {
  queryClient.clear();
};
