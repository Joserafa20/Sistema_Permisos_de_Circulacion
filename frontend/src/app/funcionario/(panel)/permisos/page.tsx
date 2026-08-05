import type { Metadata } from 'next';
import { PermisosView } from '@/modules/funcionario/permisos-view';

export const metadata: Metadata = {
  title: 'Permisos — Panel Funcionario',
};

export default function PermisosPage() {
  return <PermisosView />;
}
