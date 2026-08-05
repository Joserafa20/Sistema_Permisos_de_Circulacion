import type { Metadata } from 'next';
import { AuditoriaView } from '@/modules/admin/auditoria-view';

export const metadata: Metadata = {
  title: 'Auditoría — Panel Funcionario',
};

export default function AuditoriaPage() {
  return <AuditoriaView />;
}
