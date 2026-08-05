import type { Metadata } from 'next';
import { SolicitudesView } from '@/modules/funcionario/solicitudes-view';

export const metadata: Metadata = {
  title: 'Cola de Solicitudes — Panel Funcionario',
};

export default function SolicitudesPage() {
  return <SolicitudesView />;
}
