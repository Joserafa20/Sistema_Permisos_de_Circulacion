import type { Metadata } from 'next';
import { CambiarContrasenaForm } from '@/modules/funcionario/cambiar-contrasena-form';

export const metadata: Metadata = {
  title: 'Cambiar Contraseña',
};

export default function CambiarContrasenaPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <main className="w-full flex justify-center">
        <CambiarContrasenaForm />
      </main>
    </div>
  );
}
