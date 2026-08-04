import { useQuery } from '@tanstack/react-query';
import { getMotivos } from '@/services/public.service';
import { STATIC_STALE_TIME_MS } from '@/lib/constants';
import type { Motivo } from '@/types';

export const MOTIVOS_QUERY_KEY = ['public', 'motivos'] as const;

export function useMotivos() {
  return useQuery<Motivo[], Error>({
    queryKey: MOTIVOS_QUERY_KEY,
    queryFn: getMotivos,
    staleTime: STATIC_STALE_TIME_MS,
  });
}
