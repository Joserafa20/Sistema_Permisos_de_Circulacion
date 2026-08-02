export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="mt-4 text-xl text-gray-600">Página no encontrada</p>
      <a href="/" className="mt-6 text-primary-600 underline hover:text-primary-700">
        Volver al inicio
      </a>
    </main>
  );
}
