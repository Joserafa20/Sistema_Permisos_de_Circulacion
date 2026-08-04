import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { PageHeader } from '@/components/layout/header';
import { Alert } from '@/components/ui/alert';
import { SolicitudForm } from '@/modules/solicitud/solicitud-form';

export const metadata: Metadata = {
  title: 'Solicitar Permiso de Circulación',
  description:
    'Diligencie el formulario en línea para solicitar su permiso de circulación de motocicleta durante la restricción Pico y Placa.',
};

export default function SolicitudPage() {
  return (
    <PortalLayout>
      <PageHeader
        title="Solicitar Permiso de Circulación"
        description="Diligencie el formulario con sus datos para solicitar el permiso de circulación de motocicleta durante el Pico y Placa."
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Alert
          variant="info"
          title="Autorización de tratamiento de datos — Ley 1581 de 2012"
          className="mb-8"
        >
          Los datos suministrados serán tratados de acuerdo con la política de privacidad de la
          Alcaldía Municipal y usados exclusivamente para la expedición del permiso solicitado. Al
          continuar autoriza su uso para este fin.
        </Alert>

        <SolicitudForm />
      </div>
    </PortalLayout>
  );
}
