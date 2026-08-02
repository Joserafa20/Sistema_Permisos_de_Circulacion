'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-red-600">Ha ocurrido un error</h1>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        Intentar nuevamente
      </button>
    </main>
  );
}
