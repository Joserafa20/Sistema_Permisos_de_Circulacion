import { useMutation } from '@tanstack/react-query';
import { setTokens } from '@/lib/api-client';
import { refreshFuncionario } from '@/services/funcionario.service';
import { FUNC_STORAGE } from '@/lib/constants';

/**
 * Hook para refresh manual de tokens (no sustituye el refresh automático del interceptor 401).
 * Útil para operaciones proactivas (ej. antes de subir un archivo grande).
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const stored =
        sessionStorage.getItem(FUNC_STORAGE.refreshToken) ??
        localStorage.getItem(FUNC_STORAGE.refreshToken);
      if (!stored) throw new Error('No hay refresh token almacenado');
      return refreshFuncionario(stored);
    },
    onSuccess: ({ access_token, refresh_token }) => {
      setTokens(access_token, refresh_token);
      const remember = localStorage.getItem(FUNC_STORAGE.rememberMe) === '1';
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(FUNC_STORAGE.refreshToken, refresh_token);
    },
  });
}
