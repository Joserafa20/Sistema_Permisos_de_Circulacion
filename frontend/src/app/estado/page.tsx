import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { PageHeader } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Consultar Estado de Solicitud',
  description:
    'Ingrese su número de radicado y documento de identidad para consultar el estado de su solicitud de permiso de circulación.',
};

/**
 * Página de consulta de estado.
 * Consume: GET /api/v1/public/solicitudes/estado?radicado=&documento=
 * El formulario de consulta se implementa en bloque posterior de Fase 5.
 */
export default function EstadoPage() {
  return (
    <PortalLayout>
      <PageHeader
        title="Consultar Estado de Solicitud"
        description="Ingrese su número de radicado y tipo de documento para conocer el estado actual de su trámite."
        centered
      />

      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div
          className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500"
          aria-label="Consulta de estado — próximamente"
        >
          <div className="text-5xl mb-4" aria-hidden="true">
            🔍
          </div>
          <p className="text-lg font-medium text-neutral-700 mb-2">Consulta de estado</p>
          <p className="text-sm leading-relaxed">
            El formulario de consulta se implementará en el siguiente bloque de desarrollo (Fase 5).
            <br />
            Necesitará su número de radicado (ej:{' '}
            <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">
              20260802-PYP-000145
            </code>
            ) y su número de documento de identidad.
          </p>
        </div>
      </div>
    </PortalLayout>
  );
}
