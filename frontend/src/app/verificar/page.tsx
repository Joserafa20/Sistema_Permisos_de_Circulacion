import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { PageHeader } from '@/components/layout/header';
import { VerificarForm } from '@/modules/verificar/verificar-form';

export const metadata: Metadata = {
  title: 'Verificar Permiso de Circulación',
  description:
    'Verifique la autenticidad y vigencia de un permiso de circulación ingresando o escaneando su código QR.',
};

export default function VerificarPage() {
  return (
    <PortalLayout>
      <PageHeader
        title="Verificar Permiso"
        description="Escanee el código QR del permiso o ingrese el código manualmente para verificar su vigencia."
        centered
      />
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <VerificarForm />
      </div>
    </PortalLayout>
  );
}
