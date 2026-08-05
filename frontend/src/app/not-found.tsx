import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada',
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center p-8 text-center"
    >
      <p className="text-8xl font-bold text-neutral-200" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-800">Página no encontrada</h1>
      <p className="mt-2 text-neutral-500 max-w-md">
        La página que buscas no existe o fue movida. Verifica la dirección o regresa al inicio.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Button asChild>
          <Link href={ROUTES.home}>Ir al inicio</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.solicitud}>Solicitar permiso</Link>
        </Button>
      </div>
    </main>
  );
}
