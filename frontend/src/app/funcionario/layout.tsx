import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: {
    default: 'Panel Funcionario',
    template: '%s | Panel Funcionario',
  },
  robots: { index: false, follow: false },
};

export default function FuncionarioRootLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
