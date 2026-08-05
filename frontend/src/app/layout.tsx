import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { SYSTEM_NAME, SYSTEM_SHORT_NAME } from '@/lib/constants';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: SYSTEM_NAME,
    template: `%s | ${SYSTEM_SHORT_NAME}`,
  },
  description:
    'Portal oficial para la solicitud y consulta de permisos de circulación de motocicletas durante la restricción Pico y Placa.',
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Enlace para saltar al contenido — accesibilidad WCAG 2.4.1 */}
        <a href="#main-content" className="skip-to-content">
          Saltar al contenido principal
        </a>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
