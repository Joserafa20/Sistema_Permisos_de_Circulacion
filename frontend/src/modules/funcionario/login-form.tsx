'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { loginSchema, type LoginFormValues } from '@/schemas/login.schemas';
import { useLogin, getLoginErrorMessage } from '@/hooks/use-login';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { SYSTEM_NAME } from '@/lib/constants';

function LoginFormInner() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, isError, error } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { correoElectronico: '', contrasena: '', recordarme: false },
  });

  function onSubmit(values: LoginFormValues) {
    login(values);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      {/* Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-card px-8 py-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-md">
            <ShieldCheck className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-neutral-900">Panel Funcionario</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{SYSTEM_NAME}</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          aria-label="Formulario de acceso"
          className="space-y-5"
        >
          <Input
            id="correoElectronico"
            type="email"
            label="Correo institucional"
            required
            autoComplete="username email"
            autoFocus
            placeholder="funcionario@alcaldia.gov.co"
            error={form.formState.errors.correoElectronico?.message}
            aria-invalid={!!form.formState.errors.correoElectronico}
            {...form.register('correoElectronico')}
          />

          {/* Password con toggle de visibilidad */}
          <div className="flex flex-col gap-1 w-full">
            <Label htmlFor="contrasena" required>
              Contraseña
            </Label>
            <div className="relative">
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!form.formState.errors.contrasena}
                aria-describedby={form.formState.errors.contrasena ? 'contrasena-error' : undefined}
                className={`
                  flex h-10 w-full rounded-md border bg-white px-3 py-2 pr-10 text-sm
                  placeholder:text-neutral-400
                  focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 focus:border-primary-600
                  disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500
                  transition-colors duration-150
                  ${form.formState.errors.contrasena ? 'border-danger-500 focus:ring-danger-600' : 'border-neutral-300 hover:border-neutral-400'}
                `}
                {...form.register('contrasena')}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {form.formState.errors.contrasena && (
              <p
                id="contrasena-error"
                role="alert"
                className="text-xs text-danger-600 flex items-center gap-1"
              >
                <span aria-hidden="true">⚠</span>
                {form.formState.errors.contrasena.message}
              </p>
            )}
          </div>

          {/* Recordarme */}
          <div className="flex items-center gap-2.5">
            <input
              id="recordarme"
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600 cursor-pointer"
              {...form.register('recordarme')}
            />
            <label
              htmlFor="recordarme"
              className="text-sm text-neutral-600 cursor-pointer select-none"
            >
              Mantener sesión iniciada
            </label>
          </div>

          {/* Error global */}
          {isError && (
            <Alert variant="danger" title="Error de acceso" aria-live="assertive">
              {getLoginErrorMessage(error)}
            </Alert>
          )}

          <Button type="submit" className="w-full" size="lg" loading={isPending}>
            {isPending ? 'Verificando…' : 'Iniciar sesión'}
          </Button>
        </form>

        {/* Pie */}
        <p className="mt-6 text-center text-xs text-neutral-400">
          Acceso exclusivo para personal autorizado de la Alcaldía.
        </p>
      </div>
    </motion.div>
  );
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
