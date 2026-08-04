'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useSolicitudDetalle, SOLICITUD_DETALLE_KEY } from '@/hooks/use-solicitud-detalle';
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

type ModalAction = 'aprobar' | 'rechazar' | 'correccion' | null;

const ESTADOS_ACCIONABLES = ['en_revision', 'pendiente_correccion'];

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
  const [activeModal, setActiveModal] = useState<ModalAction>(null);

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: SOLICITUD_DETALLE_KEY(solicitudId) });
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

              {/* Botón imprimir — disponible siempre */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                aria-label="Imprimir solicitud"
              >
                <Printer className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Imprimir
              </Button>

              {/* Acciones operativas — solo estados accionables */}
              {ESTADOS_ACCIONABLES.includes(solicitud.estado) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal('correccion')}
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
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ciudadano */}
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

              {/* Motocicleta */}
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

              {/* Motivo */}
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

              {/* Documentos */}
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

            {/* Columna lateral: Historial */}
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

              {/* Permiso generado */}
              {solicitud.permiso && (
                <div className="rounded-xl border border-success-200 bg-success-50 p-5">
                  <p className="text-sm font-semibold text-success-700 mb-2">Permiso generado</p>
                  {solicitud.permiso.codigoPermiso && (
                    <p className="text-xs text-success-600 font-mono">
                      {solicitud.permiso.codigoPermiso}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </PageContainer>
      )}

      {/* Modal Aprobar */}
      <ConfirmationModal
        open={activeModal === 'aprobar'}
        onClose={() => setActiveModal(null)}
        title="Aprobar solicitud"
        description={`¿Está seguro de aprobar la solicitud ${solicitud?.numeroRadicado}? Se generará el permiso de circulación automáticamente.`}
        confirmLabel="Aprobar"
        confirmVariant="primary"
        onConfirm={() => {
          /* B17 implementará la acción real */
          setActiveModal(null);
        }}
      />

      {/* Modal Rechazar */}
      <ConfirmationModal
        open={activeModal === 'rechazar'}
        onClose={() => setActiveModal(null)}
        title="Rechazar solicitud"
        description="Indique el motivo del rechazo. Esta acción es definitiva."
        confirmLabel="Rechazar solicitud"
        confirmVariant="danger"
        onConfirm={() => {
          /* B17 implementará la acción real */
          setActiveModal(null);
        }}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="motivo-rechazo" className="text-sm font-medium text-neutral-700">
            Motivo del rechazo <span className="text-danger-500">*</span>
          </label>
          <textarea
            id="motivo-rechazo"
            rows={4}
            placeholder="Describa claramente el motivo del rechazo (mínimo 20 caracteres)…"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-danger-600 focus:border-danger-600 resize-none"
          />
        </div>
      </ConfirmationModal>

      {/* Modal Corrección */}
      <ConfirmationModal
        open={activeModal === 'correccion'}
        onClose={() => setActiveModal(null)}
        title="Solicitar corrección al ciudadano"
        description="Seleccione los campos a corregir e indique las observaciones."
        confirmLabel="Solicitar corrección"
        confirmVariant="primary"
        onConfirm={() => {
          /* B17 implementará la acción real */
          setActiveModal(null);
        }}
      >
        <div className="space-y-3">
          <fieldset>
            <legend className="text-sm font-medium text-neutral-700 mb-2">
              Campos a corregir:
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Nombre ciudadano',
                'Documento',
                'Placa moto',
                'Marca/Modelo',
                'Período solicitado',
                'Documentos adjuntos',
              ].map((campo) => (
                <label
                  key={campo}
                  className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600"
                  />
                  {campo}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-1">
            <label htmlFor="obs-correccion" className="text-sm font-medium text-neutral-700">
              Observaciones
            </label>
            <textarea
              id="obs-correccion"
              rows={3}
              placeholder="Indique las correcciones necesarias…"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
            />
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}
