import { useQuery } from '@tanstack/react-query';
import { getConfiguracionPublica } from '@/services/public.service';
import { STATIC_STALE_TIME_MS } from '@/lib/constants';
import type { ConfiguracionPublica } from '@/types';

export const CONFIG_PUBLICA_QUERY_KEY = ['public', 'configuracion'] as const;

export function useConfiguracionPublica() {
  return useQuery<ConfiguracionPublica, Error>({
    queryKey: CONFIG_PUBLICA_QUERY_KEY,
    queryFn: getConfiguracionPublica,
    staleTime: STATIC_STALE_TIME_MS,
  });
}
