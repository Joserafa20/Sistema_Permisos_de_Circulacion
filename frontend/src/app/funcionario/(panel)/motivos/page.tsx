import type { Metadata } from 'next';
import { MotivosView } from '@/modules/admin/motivos-view';

export const metadata: Metadata = {
  title: 'Motivos — Panel Funcionario',
};

export default function MotivosPage() {
  return <MotivosView />;
}
