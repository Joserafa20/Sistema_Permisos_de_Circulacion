import { UsuarioDetalleView } from '@/modules/admin/usuario-detalle-view';

export const metadata = { title: 'Detalle Usuario | Panel' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UsuarioDetallePage({ params }: Props) {
  const { id } = await params;
  return <UsuarioDetalleView id={id} />;
}
