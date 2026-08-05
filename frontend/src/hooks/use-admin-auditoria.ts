import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getAuditoria } from '@/services/admin.service';
import type { ListarAuditoriaQuery } from '@/types/admin';

export const AUDITORIA_KEY = ['admin', 'auditoria'] as const;

export function useAuditoria(query: ListarAuditoriaQuery = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...AUDITORIA_KEY, query],
    queryFn: () => getAuditoria(query),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}
