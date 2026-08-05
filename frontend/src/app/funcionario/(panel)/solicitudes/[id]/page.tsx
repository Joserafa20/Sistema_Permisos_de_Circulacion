import type { Metadata } from 'next';
import { SolicitudDetalleView } from '@/modules/funcionario/solicitud-detalle-view';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Solicitud ${id} — Panel Funcionario`,
  };
}

export default async function SolicitudDetallePage({ params }: Props) {
  const { id } = await params;
  return <SolicitudDetalleView solicitudId={id} />;
}
