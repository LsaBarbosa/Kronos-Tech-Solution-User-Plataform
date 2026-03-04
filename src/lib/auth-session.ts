import { queryClient } from '@/lib/queryClient';

/**
 * Limpa apenas estado local de sessão (cache e sinais de UI),
 * sem executar lógica de validação/decodificação de JWT.
 *
 * Segurança:
 * - utilitários de sessão não devem ler/gravar token de reset de senha;
 * - o único dado persistido aqui é `session_invalid`.
 */
export const clearLocalAuthSession = (): void => {
  localStorage.removeItem('session_invalid');
  queryClient.clear();
};
