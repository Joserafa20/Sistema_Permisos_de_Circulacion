import type { Metadata } from 'next';
import { LoginForm } from '@/modules/funcionario/login-form';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <a href="#main-content" className="skip-to-content">
        Saltar al contenido principal
      </a>
      <main id="main-content" className="w-full flex justify-center">
        <LoginForm />
      </main>
      <p className="mt-6 text-xs text-neutral-400 text-center max-w-sm">
        Sistema de Permisos de Circulación · Uso exclusivo del personal autorizado de la Alcaldía
      </p>
    </div>
  );
}
