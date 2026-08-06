'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { cambiarContrasena } from '@/services/funcionario.service';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { FUNC_ROUTES, SYSTEM_NAME } from '@/lib/constants';
import { ApiError } from '@/lib/api-client';

const schema = z
  .object({
    contrasenaActual: z.string().min(1, 'La contraseña actual es requerida'),
    nuevaContrasena: z
      .string()
      .min(10, 'Mínimo 10 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[!@#$%^&*]/, 'Debe contener al menos un carácter especial (!@#$%^&*)'),
    confirmarContrasena: z.string().min(1, 'Confirme su nueva contraseña'),
  })
  .refine((d) => d.nuevaContrasena === d.confirmarContrasena, {
    path: ['confirmarContrasena'],
    message: 'Las contraseñas no coinciden',
  });

type FormValues = z.infer<typeof schema>;

function PasswordField({
  id,
  label,
  registration,
  error,
}: {
  id: string;
  label: string;
  registration: ReturnType<ReturnType<typeof useForm<FormValues>>['register']>;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label htmlFor={id} required>
        {label}
      </Label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={!!error}
          className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 pr-10 text-sm placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600
            disabled:cursor-not-allowed disabled:bg-neutral-50 transition-colors duration-150
            ${error ? 'border-danger-500 focus:ring-danger-600' : 'border-neutral-300 hover:border-neutral-400'}`}
          {...registration}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 rounded"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-danger-600">⚠ {error}</p>}
    </div>
  );
}

export function CambiarContrasenaForm() {
  const { logout } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { contrasenaActual: '', nuevaContrasena: '', confirmarContrasena: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => cambiarContrasena(values),
    onSuccess: () => {
      setSuccessMsg('Contraseña actualizada correctamente. Inicie sesión nuevamente.');
      setTimeout(() => {
        void logout();
      }, 2500);
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  function getErrorMsg(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 422)
        return 'La contraseña actual es incorrecta o la nueva no cumple los requisitos.';
      if (err.status === 401) return 'Sesión expirada. Vuelva a iniciar sesión.';
    }
    return 'Ocurrió un error. Intente nuevamente.';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-card px-8 py-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-warning-600 flex items-center justify-center shadow-md">
            <KeyRound className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-neutral-900">Cambio de contraseña requerido</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{SYSTEM_NAME}</p>
          </div>
        </div>

        <Alert variant="warning" title="Contraseña temporal" className="mb-6">
          Su contraseña temporal ha expirado. Debe establecer una nueva contraseña para continuar.
        </Alert>

        {successMsg ? (
          <Alert variant="success" title="¡Listo!">
            {successMsg}
          </Alert>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
            <PasswordField
              id="contrasenaActual"
              label="Contraseña actual"
              registration={form.register('contrasenaActual')}
              error={form.formState.errors.contrasenaActual?.message}
            />
            <PasswordField
              id="nuevaContrasena"
              label="Nueva contraseña"
              registration={form.register('nuevaContrasena')}
              error={form.formState.errors.nuevaContrasena?.message}
            />
            <PasswordField
              id="confirmarContrasena"
              label="Confirmar nueva contraseña"
              registration={form.register('confirmarContrasena')}
              error={form.formState.errors.confirmarContrasena?.message}
            />

            <p className="text-xs text-neutral-500">
              Mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial
              (!@#$%^&*).
            </p>

            {mutation.isError && (
              <Alert variant="danger" title="Error" aria-live="assertive">
                {getErrorMsg(mutation.error)}
              </Alert>
            )}

            <div className="flex flex-col gap-3 pt-1">
              <Button type="submit" className="w-full" size="lg" loading={mutation.isPending}>
                {mutation.isPending ? 'Guardando…' : 'Cambiar contraseña'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  void logout();
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-neutral-400">
        Ir a{' '}
        <a href={FUNC_ROUTES.login} className="underline hover:text-neutral-600">
          inicio de sesión
        </a>
      </p>
    </motion.div>
  );
}
