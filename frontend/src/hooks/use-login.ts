import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { loginFuncionario } from '@/services/funcionario.service';
import { FUNC_ROUTES } from '@/lib/constants';
import { ApiError } from '@/lib/api-client';
import type { LoginFormValues } from '@/schemas/login.schemas';

export function getLoginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Correo o contraseña incorrectos.';
    if (err.status === 403) return 'Su cuenta está desactivada. Contacte al administrador.';
    if (err.isRateLimit()) return 'Demasiados intentos. Espere 15 minutos e intente nuevamente.';
    if (err.isServerError()) return 'Error del servidor. Intente nuevamente en unos minutos.';
  }
  if (err instanceof Error && err.message === 'Network Error')
    return 'Sin conexión a internet. Verifique su red.';
  return 'Ocurrió un error inesperado. Intente nuevamente.';
}

export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: (values: LoginFormValues) =>
      loginFuncionario({
        correoElectronico: values.correoElectronico,
        contrasena: values.contrasena,
      }),
    onSuccess: (data, variables) => {
      login(data.access_token, data.refresh_token, data.user, variables.recordarme ?? false);
      const next = searchParams.get('next');
      router.replace(next ?? FUNC_ROUTES.dashboard);
    },
  });
}
