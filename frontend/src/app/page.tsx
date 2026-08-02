import { SYSTEM_NAME } from '@/lib/constants';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-primary-700">{SYSTEM_NAME}</h1>
      <p className="mt-4 text-gray-600">Portal en construcción — Fase 5</p>
    </main>
  );
}
