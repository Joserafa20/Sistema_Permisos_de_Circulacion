'use client';

import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Alert variant="danger" title="Ha ocurrido un error">
          {error.message || 'Ocurrió un error inesperado. Por favor intente nuevamente.'}
          {error.digest && <p className="mt-1 text-xs opacity-70">Código: {error.digest}</p>}
        </Alert>
        <div className="mt-4 flex justify-end">
          <Button onClick={reset}>Intentar nuevamente</Button>
        </div>
      </div>
    </main>
  );
}
