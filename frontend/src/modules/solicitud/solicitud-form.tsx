'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 as CheckCircle2Icon, Copy as CopyIcon, Plus as PlusIcon } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';

import {
  solicitudFormSchema,
  DEFAULT_VALUES,
  PASO_FIELDS,
  type SolicitudFormValues,
} from '@/schemas/solicitud.schemas';
import { loadDraft, clearDraft, hasDraft, useSolicitudDraft } from '@/hooks/use-solicitud-draft';
import { useRecaptchaV3 } from '@/hooks/use-recaptcha';
import { useToast } from '@/providers/toast-provider';
import { useMotivos } from '@/hooks/use-motivos';

import { crearSolicitud, adjuntarDocumentos } from '@/services/public.service';
import type { SolicitudCreadaResponse } from '@/types';
import { ApiError } from '@/lib/api-client';

import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';
import { Alert } from '@/components/ui/alert';

import { Paso1Ciudadano } from './components/paso1-ciudadano';
import { Paso2Motocicleta } from './components/paso2-motocicleta';
import { Paso3Motivo } from './components/paso3-motivo';
import { Paso4Documentos } from './components/paso4-documentos';
import { Paso5Confirmacion } from './components/paso5-confirmacion';

const STEPS = [
  { id: 1, label: 'Datos personales' },
  { id: 2, label: 'Motocicleta' },
  { id: 3, label: 'Motivo' },
  { id: 4, label: 'Documentos' },
  { id: 5, label: 'Confirmación' },
];

const STEP_TITLES: Record<number, string> = {
  1: 'Datos personales',
  2: 'Motocicleta',
  3: 'Motivo y vigencia',
  4: 'Documentos adjuntos',
  5: 'Resumen y envío',
};

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

export function SolicitudForm() {
  const { toast } = useToast();
  const { getToken, configured } = useRecaptchaV3();
  const { data: motivos } = useMotivos();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solicitudCreada, setSolicitudCreada] = useState<SolicitudCreadaResponse | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);

  const stepRef = useRef<HTMLDivElement>(null);

  const form = useForm<SolicitudFormValues>({
    resolver: zodResolver(solicitudFormSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES,
  });

  useSolicitudDraft(form);

  /* Restauración de borrador */
  useEffect(() => {
    if (hasDraft()) {
      const draft = loadDraft();
      if (draft) {
        form.reset({ ...DEFAULT_VALUES, ...draft });
        setDraftRestored(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Advertencia reCAPTCHA en dev */
  useEffect(() => {
    if (!configured && process.env.NODE_ENV === 'development') {
      toast({
        type: 'warning',
        title: 'reCAPTCHA no configurado',
        message: 'Defina NEXT_PUBLIC_RECAPTCHA_SITE_KEY en .env.local para activar la protección.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function focusStep() {
    setTimeout(() => {
      stepRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    }, 350);
  }

  async function goNext() {
    const fields = PASO_FIELDS[step] as Array<keyof SolicitudFormValues & string>;
    const valid = fields.length === 0 ? true : await form.trigger(fields);

    if (!valid) {
      toast({ type: 'error', title: 'Corrija los errores antes de continuar' });
      return;
    }

    if (step === 4 && files.length === 0) {
      setFilesError('Debe adjuntar al menos un documento');
      toast({ type: 'error', title: 'Debe adjuntar al menos un documento' });
      return;
    }
    setFilesError(undefined);

    setDirection(1);
    setStep((s) => s + 1);
    focusStep();
  }

  function goBack() {
    setDirection(-1);
    setStep((s) => s - 1);
    focusStep();
  }

  function dismissDraft() {
    clearDraft();
    form.reset(DEFAULT_VALUES);
    setDraftRestored(false);
  }

  async function onSubmit(values: SolicitudFormValues) {
    if (isSubmitting) return;

    const recaptchaToken = await getToken('crear_solicitud');

    setIsSubmitting(true);
    try {
      const payload: Parameters<typeof crearSolicitud>[0] = {
        ciudadano: {
          tipoDocumento: values.tipoDocumento,
          numeroDocumento: values.numeroDocumento,
          nombre: values.nombres,
          apellido: values.apellidos,
          email: values.correoElectronico,
          celular: values.telefono,
          direccion: values.direccion,
          aceptaTratamientoDatos: true,
        },
        motocicleta: {
          placa: values.placa,
          ...(values.marca && { marca: values.marca }),
          ...(values.modelo && { linea: values.modelo }),
          ...(values.anio && values.anio > 1900 && { modelo: values.anio }),
          ...(values.cilindraje && values.cilindraje > 0 && { cilindraje: values.cilindraje }),
          ...(values.color && { color: values.color }),
        },
        motivoId: values.motivoId,
        declaracionJurada: values.declaracionJurada,
        descripcionAdicional: values.justificacion || undefined,
      };
      if (recaptchaToken) {
        (payload as unknown as Record<string, unknown>).recaptchaToken = recaptchaToken;
      }

      const response = await crearSolicitud(payload);

      // Mostrar modal con radicado inmediatamente; docs son secundarios
      clearDraft();
      setSolicitudCreada(response);

      if (files.length > 0) {
        try {
          await adjuntarDocumentos(response.id, response.radicado, values.numeroDocumento, files);
        } catch {
          toast({
            type: 'warning',
            title: 'Solicitud creada',
            message: 'Hubo un problema al adjuntar los documentos. Contáctenos con su radicado.',
          });
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SOLICITUD_ACTIVA') {
        toast({
          type: 'warning',
          title: 'Ya existe una solicitud activa con esta placa',
          message: err.message,
        });
      } else {
        const message = getErrorMessage(err);
        toast({ type: 'error', title: 'Error al enviar la solicitud', message });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const motivoNombre = motivos?.find((m) => m.id === form.watch('motivoId'))?.nombre;
  const correoEnvio = form.watch('correoElectronico');

  function handleNuevaSolicitud() {
    setSolicitudCreada(null);
    form.reset(DEFAULT_VALUES);
    setFiles([]);
    setStep(1);
  }

  return (
    <div className="relative">
      {/* ── Modal radicado ─────────────────────────────────── */}
      {solicitudCreada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-radicado-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.35, type: 'spring', stiffness: 160 }}
              className="flex justify-center mb-5"
            >
              <CheckCircle2Icon className="h-16 w-16 text-success-600" aria-hidden="true" />
            </motion.div>

            <h2 id="modal-radicado-title" className="text-2xl font-bold text-neutral-900 mb-2">
              ¡Solicitud enviada exitosamente!
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Recibirá una confirmación en{' '}
              <strong className="text-neutral-700">{correoEnvio}</strong> con los detalles de su
              solicitud.
            </p>

            <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-5 mb-6">
              <p className="text-xs uppercase tracking-widest text-primary-600 font-semibold mb-1">
                Número de radicado
              </p>
              <p className="text-3xl font-mono font-bold text-primary-800 tracking-wider">
                {solicitudCreada.radicado}
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                Guarde este número para consultar el estado de su solicitud.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="default"
                className="w-full gap-2"
                onClick={() => {
                  navigator.clipboard
                    .writeText(solicitudCreada.radicado)
                    .then(() => toast({ type: 'success', title: '¡Radicado copiado!' }))
                    .catch(() => {});
                }}
              >
                <CopyIcon className="h-4 w-4" />
                Copiar radicado
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleNuevaSolicitud}>
                <PlusIcon className="h-4 w-4" />
                Nueva solicitud
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {isSubmitting && <LoadingOverlay message="Enviando su solicitud..." />}

      {/* Draft banner */}
      {draftRestored && (
        <Alert variant="info" title="Borrador restaurado" className="mb-6">
          Se encontró un borrador de una solicitud anterior.{' '}
          <button
            type="button"
            className="underline font-medium hover:no-underline focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
            onClick={dismissDraft}
          >
            Comenzar desde cero
          </button>
        </Alert>
      )}

      {/* Stepper */}
      <Stepper steps={STEPS} currentStep={step} className="mb-8" />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          aria-label="Formulario de solicitud de permiso de circulación"
        >
          <div
            className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8 overflow-hidden"
            ref={stepRef}
          >
            <h2 className="text-lg font-semibold text-neutral-800 mb-6" aria-live="polite">
              Paso {step} de {STEPS.length}: {STEP_TITLES[step]}
            </h2>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              >
                {step === 1 && <Paso1Ciudadano />}
                {step === 2 && <Paso2Motocicleta />}
                {step === 3 && <Paso3Motivo />}
                {step === 4 && (
                  <Paso4Documentos
                    files={files}
                    onChange={(f) => {
                      setFiles(f);
                      if (f.length > 0) setFilesError(undefined);
                    }}
                    error={filesError}
                  />
                )}
                {step === 5 && <Paso5Confirmacion files={files} motivoNombre={motivoNombre} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 1}
              aria-label="Paso anterior"
            >
              ← Anterior
            </Button>

            {step < STEPS.length ? (
              <Button type="button" onClick={goNext} aria-label="Siguiente paso">
                Siguiente →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                aria-label="Enviar solicitud"
              >
                Enviar solicitud
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isUnauthorized()) return 'Sesión expirada. Por favor recargue la página.';
    if (err.isConflict()) return err.message || 'Ya existe una solicitud activa con estos datos.';
    if (err.status === 400) return 'Los datos enviados son inválidos. Revise el formulario.';
    if (err.status === 422) return 'Los datos no pasaron la validación del servidor.';
    if (err.isServerError())
      return 'Error interno del servidor. Intente nuevamente en unos minutos.';
  }
  if (err instanceof Error) {
    if (err.message === 'Network Error' || !navigator.onLine) {
      return 'Sin conexión a internet. Verifique su red e intente nuevamente.';
    }
    if (err.message.includes('timeout')) {
      return 'La solicitud tardó demasiado. Intente nuevamente.';
    }
  }
  return 'Ocurrió un error inesperado. Intente nuevamente.';
}
