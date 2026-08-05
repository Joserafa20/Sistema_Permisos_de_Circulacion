'use client';

import { ProtectedRoute } from '@/components/funcionario/protected-route';
import { Sidebar } from '@/components/funcionario/sidebar';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
