import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-client';
import { DYNAMIC_STALE_TIME_MS } from './constants';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DYNAMIC_STALE_TIME_MS,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            // No reintentar en errores de cliente (4xx)
            if (error.status >= 400 && error.status < 500) return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
