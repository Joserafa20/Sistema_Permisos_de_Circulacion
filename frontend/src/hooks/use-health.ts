import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/services/admin.service';

export const HEALTH_KEY = ['sistema', 'health'] as const;

export function useHealth() {
  return useQuery({
    queryKey: HEALTH_KEY,
    queryFn: getHealth,
    staleTime: 0,
    refetchInterval: 30 * 1000, // re-check every 30 s
    retry: 0,
  });
}
