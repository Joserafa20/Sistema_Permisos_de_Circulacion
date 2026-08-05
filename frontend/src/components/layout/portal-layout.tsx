import { Navbar } from './navbar';
import { Footer } from './footer';

interface PortalLayoutProps {
  children: React.ReactNode;
}

/**
 * Wrapper de layout compartido para todas las páginas del portal ciudadano.
 * Incluye Navbar, contenido principal y Footer.
 */
export function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
