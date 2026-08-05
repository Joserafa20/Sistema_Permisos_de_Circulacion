'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  User,
  Bike,
  FileText,
  History,
  CheckCircle2,
  XCircle,
  Wrench,
  Printer,
  RefreshCw,
  Download,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useSolicitudDetalle, SOLICITUD_DETALLE_KEY } from '@/hooks/use-solicitud-detalle';
import {
  useAprobarSolicitud,
  useRechazarSolicitud,
  useSolicitarCorreccion,
  usePermisoPdf,
} from '@/hooks/use-solicitud-acciones';
import { useToast } from '@/providers/toast-provider';
import { DetalleCard } from '@/components/funcionario/detalle-card';
import { SolicitudTimeline } from '@/components/funcionario/solicitud-timeline';
import { DocumentoViewer } from '@/components/funcionario/documento-viewer';
import { SolicitudStatusBadge } from '@/components/funcionario/solicitud-status-badge';
import { ConfirmationModal } from '@/components/funcionario/confirmation-modal';
import { HeaderFunc } from '@/components/funcionario/header-func';
import { PageContainer } from '@/components/funcionario/page-container';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { FUNC_ROUTES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { rechazarSchema, correccionSchema } from '@/schemas/solicitudes-acciones.schemas';
import type {
  RechazarFormValues,
  CorreccionFormValues,
} from '@/schemas/solicitudes-acciones.schemas';
import { useQueryClient } from '@tanstack/react-query';

type ModalAction = 'aprobar' | 'rechazar' | 'correccion' | null;
type CorreccionStep = 'form' | 'preview';

const ESTADOS_ACCIONABLES = ['en_revision', 'pendiente_correccion'];

const CAMPOS_OPCIONES = [
  { value: 'nombre_ciudadano', label: 'Nombre del ciudadano' },
  { value: 'numero_documento', label: 'Número de documento' },
  { value: 'placa_motocicleta', label: 'Placa de motocicleta' },
  { value: 'marca_modelo', label: 'Marca / Modelo' },
  { value: 'periodo_solicitado', label: 'Período solicitado' },
  { value: 'documentos_adjuntos', label: 'Documentos adjuntos' },
  { value: 'descripcion_adicional', label: 'Descripción adicional' },
];

interface Props {
  solicitudId: string;
}

function SolicitudSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  );
}

export function SolicitudDetalleView({ solicitudId }: Props) {
  const queryClient = useQueryClient();
  const { data: solicitud, isLoading, isError, refetch } = useSolicitudDetalle(solicitudId);
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState<ModalAction>(null);
  const [correccionStep, setCorreccionStep] = useState<CorreccionStep>('form');
  const [wantsPdf, setWantsPdf] = useState(false);

  /* ── Mutations ─────────────────────────────── */
  const aprobarMut = useAprobarSolicitud(solicitudId);
  const rechazarMut = useRechazarSolicitud(solicitudId);
  const correccionMut = useSolicitarCorreccion(solicitudId);

  /* ── PDF permiso ──────────────────────────── */
  const { data: pdfData, isFetching: pdfLoading } = usePermisoPdf(solicitud?.permiso?.id, wantsPdf);

  /* ── Forms ─────────────────────────────────── */
  const rechazarForm = useForm<RechazarFormValues>({
    resolver: zodResolver(rechazarSchema),
    defaultValues: { motivo: '' },
  });
  const rechazarMotivo = rechazarForm.watch('motivo');

  const correccionForm = useForm<CorreccionFormValues>({
    resolver: zodResolver(correccionSchema),
    defaultValues: { motivo: '', camposCorreccion: [] },
  });
  const {
    fields: campoFields,
    append: appendCampo,
    remove: removeCampo,
  } = useFieldArray({
    control: correccionForm.control,
    name: 'camposCorreccion',
  });
  const correccionMotivo = correccionForm.watch('motivo');

  /* ── Helpers ───────────────────────────────── */
  function closeModal() {
    setActiveModal(null);
    setCorreccionStep('form');
    rechazarForm.reset();
    correccionForm.reset();
    aprobarMut.reset();
    rechazarMut.reset();
    correccionMut.reset();
  }

  function toggleCampoCorreccion(campo: string) {
    const idx = campoFields.findIndex((f) => f.campo === campo);
    if (idx >= 0) {
      removeCampo(idx);
    } else {
      appendCampo({ campo, descripcion: '' });
    }
  }

  function isCampoSelected(campo: string) {
    return campoFields.some((f) => f.campo === campo);
  }

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: SOLICITUD_DETALLE_KEY(solicitudId) });
  }

  /* ── Action handlers ────────────────────────── */
  function handleAprobar() {
    aprobarMut.mutate(undefined, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Solicitud aprobada',
          message: 'Se generó el permiso de circulación.',
        });
        closeModal();
      },
      onError: (err: unknown) => {
        const msg = getErrorMessage(err);
        toast({ type: 'error', title: 'Error al aprobar', message: msg });
      },
    });
  }

  function handleRechazar(values: RechazarFormValues) {
    rechazarMut.mutate(values, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Solicitud rechazada',
          message: 'El ciudadano será notificado.',
        });
        closeModal();
      },
      onError: (err: unknown) => {
        const msg = getErrorMessage(err);
        toast({ type: 'error', title: 'Error al rechazar', message: msg });
      },
    });
  }

  function handleCorreccion(values: CorreccionFormValues) {
    correccionMut.mutate(values, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Corrección solicitada',
          message: 'El ciudadano deberá corregir los campos indicados.',
        });
        closeModal();
      },
      onError: (err: unknown) => {
        const msg = getErrorMessage(err);
        toast({ type: 'error', title: 'Error al solicitar corrección', message: msg });
      },
    });
  }

  const breadcrumbs = [
    { label: 'Solicitudes', href: FUNC_ROUTES.solicitudes },
    { label: solicitud?.numeroRadicado ?? 'Detalle' },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <HeaderFunc
        breadcrumbs={breadcrumbs}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
        extra={
          <Link
            href={FUNC_ROUTES.solicitudes}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Link>
        }
      />

      {isLoading && <SolicitudSkeleton />}

      {isError && (
        <PageContainer title="Error">
          <Alert variant="danger" title="No se pudo cargar la solicitud">
            Verifique su conexión e intente nuevamente.
          </Alert>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </PageContainer>
      )}

      {solicitud && (
        <PageContainer
          title={solicitud.numeroRadicado}
          description={`Recibida el ${formatDate(solicitud.createdAt)}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <SolicitudStatusBadge estado={solicitud.estado} />

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                aria-label="Imprimir solicitud"
              >
                <Printer className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Imprimir
              </Button>

              {ESTADOS_ACCIONABLES.includes(solicitud.estado) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveModal('correccion');
                      setCorreccionStep('form');
                    }}
                    aria-label="Solicitar corrección"
                    className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  >
                    <Wrench className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Corrección
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal('rechazar')}
                    aria-label="Rechazar solicitud"
                    className="text-danger-700 border-danger-300 hover:bg-danger-50"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveModal('aprobar')}
                    aria-label="Aprobar solicitud"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    Aprobar
                  </Button>
                </>
              )}
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DetalleCard
                title="Información del ciudadano"
                icon={User}
                columns={2}
                items={[
                  {
                    label: 'Nombre completo',
                    value: `${solicitud.ciudadano.nombre} ${solicitud.ciudadano.apellido}`,
                  },
                  { label: 'Tipo de documento', value: solicitud.ciudadano.tipoDocumento },
                  { label: 'Número de documento', value: solicitud.ciudadano.numeroDocumento },
                  { label: 'Celular', value: solicitud.ciudadano.celular },
                  { label: 'Correo', value: solicitud.ciudadano.email },
                  { label: 'Municipio', value: solicitud.ciudadano.municipio },
                  { label: 'Dirección', value: solicitud.ciudadano.direccion },
                  { label: 'Barrio', value: solicitud.ciudadano.barrio },
                ]}
              />

              <DetalleCard
                title="Motocicleta"
                icon={Bike}
                columns={3}
                items={[
                  { label: 'Placa', value: solicitud.motocicleta.placa },
                  { label: 'Marca', value: solicitud.motocicleta.marca },
                  { label: 'Línea / Modelo', value: solicitud.motocicleta.linea },
                  { label: 'Año', value: solicitud.motocicleta.modelo },
                  {
                    label: 'Cilindraje',
                    value: solicitud.motocicleta.cilindraje
                      ? `${solicitud.motocicleta.cilindraje} cc`
                      : null,
                  },
                  { label: 'Color', value: solicitud.motocicleta.color },
                  { label: 'Nº Motor', value: solicitud.motocicleta.numeroMotor },
                  { label: 'Nº Chasis', value: solicitud.motocicleta.numeroChasis },
                ]}
              />

              <DetalleCard
                title="Motivo de la solicitud"
                icon={FileText}
                columns={2}
                items={[
                  { label: 'Motivo', value: solicitud.motivo.nombre },
                  {
                    label: 'Período',
                    value: `${formatDate(solicitud.fechaInicio)} — ${formatDate(solicitud.fechaFin)}`,
                  },
                  { label: 'Descripción adicional', value: solicitud.descripcionAdicional },
                  { label: 'Declaración jurada', value: solicitud.declaracionJurada ? 'Sí' : 'No' },
                ]}
              />

              {solicitud.documentos.length > 0 && (
                <section aria-label="Documentos adjuntos">
                  <h2 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                    Documentos adjuntos ({solicitud.documentos.length})
                  </h2>
                  <div className="space-y-3">
                    {solicitud.documentos.map((doc) => (
                      <DocumentoViewer key={doc.id} solicitudId={solicitudId} documento={doc} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section
                className="rounded-xl border border-neutral-200 bg-white p-5"
                aria-label="Historial de estados"
              >
                <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                  <History className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  Historial
                </h2>
                <SolicitudTimeline historial={solicitud.historial} />
              </section>

              {solicitud.permiso && (
                <div className="rounded-xl border border-success-200 bg-success-50 p-5 space-y-3">
                  <p className="text-sm font-semibold text-success-700">Permiso generado</p>
                  {solicitud.permiso.codigoPermiso && (
                    <p className="text-xs text-success-600 font-mono">
                      {solicitud.permiso.codigoPermiso}
                    </p>
                  )}
                  {solicitud.permiso.id &&
                    (pdfData ? (
                      <a
                        href={pdfData.url}
                        download={pdfData.nombreArchivo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-success-700 hover:text-success-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-600 rounded"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        Descargar PDF
                      </a>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWantsPdf(true)}
                        disabled={pdfLoading}
                        className="text-success-700 border-success-300 hover:bg-success-100 text-xs h-7"
                        aria-busy={pdfLoading}
                      >
                        {pdfLoading ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                        )}
                        {pdfLoading ? 'Generando enlace…' : 'Obtener PDF'}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      )}

      {/* ══ Modal Aprobar ══════════════════════════════════ */}
      <ConfirmationModal
        open={activeModal === 'aprobar'}
        onClose={closeModal}
        title="Aprobar solicitud"
        description={`¿Está seguro de aprobar la solicitud ${solicitud?.numeroRadicado}? Se generará el permiso de circulación automáticamente.`}
        confirmLabel="Aprobar"
        confirmVariant="primary"
        isConfirming={aprobarMut.isPending}
        onConfirm={handleAprobar}
      >
        {aprobarMut.isError && (
          <Alert variant="danger" icon={false}>
            {getErrorMessage(aprobarMut.error)}
          </Alert>
        )}
      </ConfirmationModal>

      {/* ══ Modal Rechazar ══════════════════════════════════ */}
      <ConfirmationModal
        open={activeModal === 'rechazar'}
        onClose={closeModal}
        title="Rechazar solicitud"
        description="Indique el motivo del rechazo. Esta acción es definitiva."
        confirmLabel="Rechazar solicitud"
        confirmVariant="danger"
        isConfirming={rechazarMut.isPending}
        confirmDisabled={!rechazarForm.formState.isValid}
        onConfirm={rechazarForm.handleSubmit(handleRechazar)}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="motivo-rechazo" className="text-sm font-medium text-neutral-700">
            Motivo del rechazo{' '}
            <span className="text-danger-500" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            id="motivo-rechazo"
            rows={4}
            placeholder="Describa claramente el motivo del rechazo (mínimo 20 caracteres)…"
            aria-required="true"
            aria-describedby="motivo-rechazo-count motivo-rechazo-error"
            {...rechazarForm.register('motivo')}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-danger-600 focus:border-danger-600 resize-none"
          />
          <div className="flex items-center justify-between">
            <span id="motivo-rechazo-error" className="text-xs text-danger-600" role="alert">
              {rechazarForm.formState.errors.motivo?.message ?? ''}
            </span>
            <span id="motivo-rechazo-count" className="text-xs text-neutral-400" aria-live="polite">
              {rechazarMotivo.length} / 1000
            </span>
          </div>
          {rechazarMut.isError && (
            <Alert variant="danger" icon={false} className="mt-1">
              {getErrorMessage(rechazarMut.error)}
            </Alert>
          )}
        </div>
      </ConfirmationModal>

      {/* ══ Modal Corrección ════════════════════════════════ */}
      <ConfirmationModal
        open={activeModal === 'correccion'}
        onClose={closeModal}
        onCancel={correccionStep === 'preview' ? () => setCorreccionStep('form') : undefined}
        title="Solicitar corrección al ciudadano"
        description={
          correccionStep === 'form'
            ? 'Seleccione los campos a corregir e indique las observaciones.'
            : 'Revise la información antes de enviar la solicitud de corrección.'
        }
        confirmLabel={correccionStep === 'form' ? 'Revisar →' : 'Enviar corrección'}
        cancelLabel={correccionStep === 'preview' ? '← Editar' : 'Cancelar'}
        confirmVariant="primary"
        isConfirming={correccionMut.isPending}
        confirmDisabled={correccionStep === 'form' && !correccionForm.formState.isValid}
        maxWidth="max-w-xl"
        onConfirm={
          correccionStep === 'form'
            ? () => {
                correccionForm.handleSubmit(() => setCorreccionStep('preview'))();
              }
            : correccionForm.handleSubmit(handleCorreccion)
        }
      >
        {correccionStep === 'form' ? (
          <div className="space-y-4">
            <fieldset>
              <legend className="text-sm font-medium text-neutral-700 mb-2">
                Campos a corregir{' '}
                <span className="text-danger-500" aria-hidden="true">
                  *
                </span>
              </legend>
              {correccionForm.formState.errors.camposCorreccion?.root?.message && (
                <p className="text-xs text-danger-600 mb-2" role="alert">
                  {correccionForm.formState.errors.camposCorreccion.root.message}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {CAMPOS_OPCIONES.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isCampoSelected(opt.value)}
                      onChange={() => toggleCampoCorreccion(opt.value)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {campoFields.length > 0 && (
                <div className="mt-3 space-y-3">
                  {campoFields.map((field, idx) => {
                    const opt = CAMPOS_OPCIONES.find((o) => o.value === field.campo);
                    const fieldErr =
                      correccionForm.formState.errors.camposCorreccion?.[idx]?.descripcion;
                    return (
                      <div key={field.id} className="flex flex-col gap-1">
                        <label
                          htmlFor={`campo-desc-${field.id}`}
                          className="text-xs font-medium text-neutral-600"
                        >
                          Observación — {opt?.label ?? field.campo}
                          <span className="text-danger-500 ml-0.5" aria-hidden="true">
                            *
                          </span>
                        </label>
                        <textarea
                          id={`campo-desc-${field.id}`}
                          rows={2}
                          placeholder="Describa qué debe corregir el ciudadano (mínimo 10 caracteres)…"
                          {...correccionForm.register(`camposCorreccion.${idx}.descripcion`)}
                          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                        />
                        {fieldErr && (
                          <span className="text-xs text-danger-600" role="alert">
                            {fieldErr.message}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </fieldset>

            <div className="flex flex-col gap-1">
              <label htmlFor="motivo-correccion" className="text-sm font-medium text-neutral-700">
                Motivo general{' '}
                <span className="text-danger-500" aria-hidden="true">
                  *
                </span>
              </label>
              <textarea
                id="motivo-correccion"
                rows={3}
                placeholder="Explique brevemente por qué se solicita la corrección (mínimo 20 caracteres)…"
                aria-required="true"
                aria-describedby="motivo-correccion-count motivo-correccion-error"
                {...correccionForm.register('motivo')}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
              />
              <div className="flex items-center justify-between">
                <span id="motivo-correccion-error" className="text-xs text-danger-600" role="alert">
                  {correccionForm.formState.errors.motivo?.message ?? ''}
                </span>
                <span
                  id="motivo-correccion-count"
                  className="text-xs text-neutral-400"
                  aria-live="polite"
                >
                  {correccionMotivo.length} / 500
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Preview step */
          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Motivo general
              </p>
              <p className="text-sm text-neutral-800">{correccionForm.getValues('motivo')}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Campos a corregir ({correccionForm.getValues('camposCorreccion').length})
              </p>
              {correccionForm.getValues('camposCorreccion').map((c, i) => {
                const opt = CAMPOS_OPCIONES.find((o) => o.value === c.campo);
                return (
                  <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold text-amber-800 mb-1">
                      {opt?.label ?? c.campo}
                    </p>
                    <p className="text-xs text-amber-700">{c.descripcion}</p>
                  </div>
                );
              })}
            </div>

            {correccionMut.isError && (
              <Alert variant="danger" icon={false}>
                {getErrorMessage(correccionMut.error)}
              </Alert>
            )}
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}

function getErrorMessage(err: unknown): string {
  if (!err) return 'Ocurrió un error inesperado.';
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e['message'] === 'string') return e['message'];
    if (typeof e['statusCode'] === 'number') {
      if (e['statusCode'] === 409)
        return 'La solicitud ya tiene un permiso activo o existe un conflicto.';
      if (e['statusCode'] === 422) return 'El estado de la solicitud no permite esta acción.';
    }
  }
  return 'Ocurrió un error inesperado. Intente nuevamente.';
}
