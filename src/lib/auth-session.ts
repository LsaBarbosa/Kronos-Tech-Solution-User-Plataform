import { queryClient } from '@/lib/queryClient';

/**
 * Limpa apenas estado local de sessão (cache e sinais de UI),
 * sem executar lógica de validação/decodificação de JWT.
 */
export const clearLocalAuthSession = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('session_invalid');
  queryClient.clear();
};
