import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { SYSTEM_NAME, SYSTEM_SHORT_NAME } from '@/lib/constants';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
