import type { Metadata } from 'next';
import { ReportesView } from '@/modules/admin/reportes-view';

export const metadata: Metadata = {
  title: 'Reportes — Panel Funcionario',
};

export default function ReportesPage() {
  return <ReportesView />;
}
