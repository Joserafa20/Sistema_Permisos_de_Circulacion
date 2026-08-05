import { useQuery } from '@tanstack/react-query';
import { getMePerfil } from '@/services/funcionario.service';
import { useAuth } from '@/contexts/auth-context';

export const PROFILE_QUERY_KEY = ['funcionario', 'perfil'] as const;

export function useProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getMePerfil,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
