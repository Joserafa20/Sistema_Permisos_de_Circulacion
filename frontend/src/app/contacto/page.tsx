import type { Metadata } from 'next';
import { PortalLayout } from '@/components/layout/portal-layout';
import { PageHeader } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Información de contacto de la Alcaldía Municipal para consultas sobre los permisos de circulación Pico y Placa.',
};

const CONTACT_ITEMS = [
  { icon: '📍', label: 'Dirección', value: 'Carrera 1 # 1-01, Palacio Municipal' },
  { icon: '📞', label: 'Teléfono', value: '(000) 000 0000' },
  { icon: '📧', label: 'Correo', value: 'picoYplaca@alcaldia.gov.co' },
  { icon: '🕒', label: 'Horario', value: 'Lunes a viernes de 8:00 a.m. a 5:00 p.m.' },
] as const;

export default function ContactoPage() {
  return (
    <PortalLayout>
      <PageHeader
        title="Contacto"
        description="Canales oficiales de atención para consultas sobre el trámite de permisos de circulación."
        centered
      />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card>
          <CardContent className="pt-6">
            <ul className="divide-y divide-neutral-100" role="list">
              {CONTACT_ITEMS.map(({ icon, label, value }) => (
                <li key={label} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="text-2xl shrink-0" aria-hidden="true">
                    {icon}
                  </span>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {label}
                    </dt>
                    <dd className="mt-0.5 text-sm text-neutral-800">{value}</dd>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Los datos de contacto son cargados desde la configuración institucional del sistema. Si
          detecta información incorrecta, comuníquese directamente con la Alcaldía.
        </p>
      </div>
    </PortalLayout>
  );
}
