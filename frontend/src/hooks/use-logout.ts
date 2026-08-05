import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';

export function useLogout() {
  const { logout } = useAuth();

  return useMutation({
    mutationFn: logout,
  });
}
