'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QrCode, Keyboard } from 'lucide-react';

import { verificarCodigoSchema, type VerificarCodigoValues } from '@/schemas/verificar.schemas';
import { useVerificarPermiso } from '@/hooks/use-verificar-permiso';
import { ApiError } from '@/lib/api-client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PermisoResultado } from './components/permiso-resultado';

/* Carga diferida del scanner — evita que @zxing/browser se incluya en SSR/build inicial */
const QrScanner = dynamic(
  () => import('./components/qr-scanner').then((m) => ({ default: m.QrScanner })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
        Iniciando cámara...
      </div>
    ),
  },
);

type Mode = 'idle' | 'manual' | 'camera';

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return 'No se encontró ningún permiso con ese código.';
    if (err.isServerError()) return 'Error del servidor. Intente nuevamente en unos minutos.';
  }
  if (err instanceof Error && (!navigator.onLine || err.message === 'Network Error')) {
    return 'Sin conexión a internet. Verifique su red e intente nuevamente.';
  }
  return 'Ocurrió un error inesperado. Intente nuevamente.';
}

/** Extrae solo el hash SHA256 de un código QR que puede ser URL o hash directo. */
function extraerCodigo(raw: string): string {
  try {
    const url = new URL(raw);
    const param = url.searchParams.get('codigo');
    if (param) return param.trim();
  } catch {
    // No es URL — usar como está
  }
  return raw.trim();
}

export function VerificarForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('idle');
  const [codigoActivo, setCodigoActivo] = useState('');

  const form = useForm<VerificarCodigoValues>({
    resolver: zodResolver(verificarCodigoSchema),
    defaultValues: { codigo: '' },
  });

  // Auto-verificar cuando llega por URL (QR escanea → abre /verificar?codigo=...)
  useEffect(() => {
    const codigo = searchParams.get('codigo');
    if (codigo && !codigoActivo) {
      setCodigoActivo(codigo.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, isError, error } = useVerificarPermiso({
    codigo: codigoActivo,
    enabled: codigoActivo.length > 0,
  });

  const reset = useCallback(() => {
    setCodigoActivo('');
    setMode('idle');
    form.reset({ codigo: '' });
  }, [form]);

  function onManualSubmit(values: VerificarCodigoValues) {
    setCodigoActivo(values.codigo.trim());
  }

  function onQrScan(code: string) {
    setCodigoActivo(extraerCodigo(code));
    setMode('idle');
  }

  /* Mostrar resultado cuando hay datos y no está cargando */
  if (data && !isLoading) {
    return <PermisoResultado data={data} onNueva={reset} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-3" aria-live="polite" aria-label="Verificando permiso...">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modos: cámara o manual */}
      {mode === 'idle' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50 p-6 text-center hover:border-primary-500 hover:bg-primary-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none"
            aria-label="Escanear código QR con la cámara"
          >
            <QrCode className="h-10 w-10 text-primary-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-sm text-primary-700">Escanear QR</p>
              <p className="text-xs text-primary-600 mt-0.5">Use la cámara del dispositivo</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center hover:border-neutral-400 hover:bg-neutral-100 transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none"
            aria-label="Ingresar código manualmente"
          >
            <Keyboard className="h-10 w-10 text-neutral-500" aria-hidden="true" />
            <div>
              <p className="font-semibold text-sm text-neutral-700">Código manual</p>
              <p className="text-xs text-neutral-500 mt-0.5">Ingrese el código del permiso</p>
            </div>
          </button>
        </div>
      )}

      {mode === 'camera' && <QrScanner onScan={onQrScan} onCancel={() => setMode('idle')} />}

      {mode === 'manual' && (
        <form
          onSubmit={form.handleSubmit(onManualSubmit)}
          noValidate
          aria-label="Verificar permiso por código"
          className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4"
        >
          <Input
            id="codigo"
            label="Código del permiso"
            required
            placeholder="Ingrese el código que aparece en el permiso"
            autoFocus
            error={form.formState.errors.codigo?.message}
            {...form.register('codigo')}
          />
          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              Verificar
            </Button>
            <Button type="button" variant="outline" onClick={() => setMode('idle')}>
              Volver
            </Button>
          </div>
        </form>
      )}

      {isError && !isLoading && (
        <Alert variant="danger" title="No fue posible verificar el permiso" aria-live="assertive">
          {getErrorMessage(error)}
        </Alert>
      )}

      {/* Información de seguridad */}
      {mode === 'idle' && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs text-neutral-500 leading-relaxed">
            <strong className="text-neutral-700">Verificación oficial</strong> — Esta herramienta
            consulta en tiempo real la base de datos oficial de la Alcaldía. Los resultados son
            definitivos y no se almacenan datos del dispositivo.
          </p>
        </div>
      )}
    </div>
  );
}
