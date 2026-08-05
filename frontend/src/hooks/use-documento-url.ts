import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getDocumentoUrl } from '@/services/funcionario.service';

export const DOCUMENTO_URL_KEY = (solicitudId: string, docId: string) =>
  ['documento-url', solicitudId, docId] as const;

export function useDocumentoUrl(solicitudId: string, docId: string, enabled: boolean = false) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: DOCUMENTO_URL_KEY(solicitudId, docId),
    queryFn: () => getDocumentoUrl(solicitudId, docId),
    enabled: isAuthenticated && enabled && Boolean(solicitudId) && Boolean(docId),
    staleTime: 4 * 60 * 1000, // 4 min — URL firmada vence a los 5 min
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}
