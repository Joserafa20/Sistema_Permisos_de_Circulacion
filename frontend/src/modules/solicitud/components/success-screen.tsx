'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Copy, Printer, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/providers/toast-provider';
import type { SolicitudCreadaResponse } from '@/types';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

interface SuccessScreenProps {
  solicitud: SolicitudCreadaResponse;
  correo: string;
  onNuevaSolicitud: () => void;
}

export function SuccessScreen({ solicitud, correo, onNuevaSolicitud }: SuccessScreenProps) {
  const { toast } = useToast();

  function copiarRadicado() {
    navigator.clipboard
      .writeText(solicitud.radicado)
      .then(() => toast({ type: 'success', title: '¡Radicado copiado al portapapeles!' }))
      .catch(() => toast({ type: 'error', title: 'No fue posible copiar el radicado' }));
  }

  function imprimir() {
    window.print();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center py-8 px-4 max-w-lg mx-auto"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 160 }}
        className="flex justify-center mb-6"
      >
        <CheckCircle2 className="h-20 w-20 text-success-600" aria-hidden="true" />
      </motion.div>

      <h2 className="text-2xl font-bold text-neutral-900 mb-2">¡Solicitud enviada exitosamente!</h2>
      <p className="text-neutral-600 text-sm mb-6">
        Recibirá una confirmación en <strong className="text-neutral-800">{correo}</strong> con los
        detalles de su solicitud.
      </p>

      {/* Radicado */}
      <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-6 mb-6">
        <p className="text-xs uppercase tracking-widest text-primary-600 font-semibold mb-1">
          Número de radicado
        </p>
        <p className="text-3xl font-mono font-bold text-primary-800 tracking-wider">
          {solicitud.radicado}
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          Guarde este número para consultar el estado de su solicitud.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href={ROUTES.estado} className="contents">
          <Button variant="default" className="w-full gap-2">
            <Search className="h-4 w-4" />
            Consultar estado
          </Button>
        </Link>

        <Button variant="outline" className="w-full gap-2" onClick={copiarRadicado}>
          <Copy className="h-4 w-4" />
          Copiar radicado
        </Button>

        <Button variant="outline" className="w-full gap-2" onClick={imprimir}>
          <Printer className="h-4 w-4" />
          Imprimir comprobante
        </Button>

        <Button variant="ghost" className="w-full gap-2" onClick={onNuevaSolicitud}>
          <Plus className="h-4 w-4" />
          Nueva solicitud
        </Button>
      </div>
    </motion.div>
  );
}
