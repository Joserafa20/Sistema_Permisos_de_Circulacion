import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { PageHeader } from '@/components/layout/header';
import { EstadoConsulta } from '@/modules/estado/estado-consulta';

export const metadata: Metadata = {
  title: 'Consultar Estado de Solicitud',
  description:
    'Ingrese su número de radicado y documento de identidad para consultar el estado de su solicitud de permiso de circulación.',
};

export default function EstadoPage() {
  return (
    <PortalLayout>
      <PageHeader
        title="Consultar Estado de Solicitud"
        description="Ingrese su número de radicado y número de documento para conocer el estado actual de su trámite."
        centered
      />
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <EstadoConsulta />
      </div>
    </PortalLayout>
  );
}
