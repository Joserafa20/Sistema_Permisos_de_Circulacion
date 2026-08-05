import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getRoles, getDependencias } from '@/services/admin.service';

export const ROLES_KEY = ['admin', 'roles'] as const;
export const DEPENDENCIAS_KEY = ['admin', 'dependencias'] as const;

export function useRoles() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: getRoles,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDependencias() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: DEPENDENCIAS_KEY,
    queryFn: getDependencias,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}
