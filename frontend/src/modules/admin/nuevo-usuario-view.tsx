'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, UserPlus, Copy, Eye, EyeOff } from 'lucide-react';
import { useCrearUsuario } from '@/hooks/use-admin-usuarios';
import { useRoles, useDependencias } from '@/hooks/use-admin-catalogs';
import { useToast } from '@/providers/toast-provider';
import { PageContainer } from '@/components/funcionario/page-container';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { crearUsuarioSchema } from '@/schemas/admin.schemas';
import type { CrearUsuarioFormValues } from '@/schemas/admin.schemas';
import { FUNC_ROUTES } from '@/lib/constants';

interface TempPassDialogProps {
  nombre: string;
  email: string;
  contrasenaTemp: string;
  onClose: () => void;
}

function TempPassDialog({ nombre, email, contrasenaTemp, onClose }: TempPassDialogProps) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(contrasenaTemp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo copiar la contraseña.' });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex flex-col gap-1">
          <h2 id="dialog-title" className="text-lg font-bold text-neutral-900">
            Usuario creado exitosamente
          </h2>
          <p className="text-sm text-neutral-600">
            Comparta las credenciales de acceso inicial con <strong>{nombre}</strong>.
          </p>
        </div>

        <Alert variant="warning" title="Guarde esta contraseña ahora">
          Esta contraseña temporal no se volverá a mostrar. El usuario deberá cambiarla al primer
          inicio de sesión.
        </Alert>

        <div className="space-y-3 bg-neutral-50 rounded-xl border border-neutral-200 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
              Correo
            </span>
            <span className="text-sm text-neutral-800 font-mono select-all">{email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
              Contraseña temporal
            </span>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-sm font-mono select-all text-neutral-800 break-all">
                {show ? contrasenaTemp : '•'.repeat(contrasenaTemp.length)}
              </span>
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="h-7 w-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copiar contraseña"
                className="h-7 w-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {copied && (
              <span className="text-xs text-success-600" role="status" aria-live="polite">
                ¡Copiado al portapapeles!
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} size="sm">
            Entendido, cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-danger-600" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 ${hasError ? 'border-danger-400' : 'border-neutral-300'}`;
}

export function NuevoUsuarioView() {
  const router = useRouter();
  const { toast } = useToast();
  const [createdUser, setCreatedUser] = useState<{
    nombre: string;
    email: string;
    contrasenaTemp: string;
  } | null>(null);

  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: dependencias } = useDependencias();
  const crearMut = useCrearUsuario();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrearUsuarioFormValues>({
    resolver: zodResolver(crearUsuarioSchema),
  });

  function onSubmit(values: CrearUsuarioFormValues) {
    const body = {
      ...values,
      dependenciaId: values.dependenciaId || undefined,
    };
    crearMut.mutate(body, {
      onSuccess: (data) => {
        setCreatedUser({
          nombre: `${data.nombre} ${data.apellido}`,
          email: data.email,
          contrasenaTemp: data.contrasenaTemp,
        });
      },
      onError: (err: unknown) => {
        toast({
          type: 'error',
          title: 'Error al crear usuario',
          message: err instanceof Error ? err.message : 'Error inesperado.',
        });
      },
    });
  }

  function handleDialogClose() {
    setCreatedUser(null);
    router.push(FUNC_ROUTES.usuarios);
  }

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <HeaderFunc
          breadcrumbs={[
            { label: 'Usuarios', href: FUNC_ROUTES.usuarios },
            { label: 'Nuevo usuario' },
          ]}
        />

        <PageContainer
          title="Nuevo usuario"
          description="Complete los datos para crear un nuevo funcionario o administrador."
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(FUNC_ROUTES.usuarios)}
              aria-label="Volver a usuarios"
            >
              <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              Volver
            </Button>
          }
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 max-w-2xl"
            aria-label="Formulario de creación de usuario"
            noValidate
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Nombre" required error={errors.nombre?.message}>
                <input
                  {...register('nombre')}
                  placeholder="Juan"
                  autoComplete="given-name"
                  aria-required="true"
                  className={inputCls(Boolean(errors.nombre))}
                />
              </FormInput>

              <FormInput label="Apellido" required error={errors.apellido?.message}>
                <input
                  {...register('apellido')}
                  placeholder="García"
                  autoComplete="family-name"
                  aria-required="true"
                  className={inputCls(Boolean(errors.apellido))}
                />
              </FormInput>

              <FormInput label="Correo electrónico" required error={errors.email?.message}>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="jgarcia@alcaldia.gov.co"
                  autoComplete="email"
                  aria-required="true"
                  className={inputCls(Boolean(errors.email))}
                />
              </FormInput>

              <FormInput label="Rol" required error={errors.rolId?.message}>
                <select
                  {...register('rolId')}
                  disabled={rolesLoading}
                  aria-required="true"
                  className={inputCls(Boolean(errors.rolId))}
                >
                  <option value="">
                    {rolesLoading ? 'Cargando roles…' : 'Seleccione un rol…'}
                  </option>
                  {roles?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </FormInput>

              <FormInput label="Dependencia" error={errors.dependenciaId?.message}>
                <select
                  {...register('dependenciaId')}
                  className={inputCls(Boolean(errors.dependenciaId))}
                >
                  <option value="">Sin dependencia asignada</option>
                  {dependencias?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </FormInput>
            </div>

            <Alert variant="info">
              La contraseña temporal se generará automáticamente y se mostrará al confirmar la
              creación. Deberá compartirla de forma segura con el usuario.
            </Alert>

            {crearMut.isError && (
              <Alert variant="danger" title="Error al crear usuario">
                {crearMut.error instanceof Error ? crearMut.error.message : 'Error inesperado.'}
              </Alert>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
              <Button
                type="submit"
                disabled={isSubmitting || crearMut.isPending}
                loading={crearMut.isPending}
                aria-busy={crearMut.isPending}
              >
                <UserPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Crear usuario
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(FUNC_ROUTES.usuarios)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </PageContainer>
      </div>

      {createdUser && (
        <TempPassDialog
          nombre={createdUser.nombre}
          email={createdUser.email}
          contrasenaTemp={createdUser.contrasenaTemp}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
}
