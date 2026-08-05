import type { Metadata } from 'next';
import { DependenciasView } from '@/modules/admin/dependencias-view';

export const metadata: Metadata = {
  title: 'Dependencias — Panel Funcionario',
};

export default function DependenciasPage() {
  return <DependenciasView />;
}
