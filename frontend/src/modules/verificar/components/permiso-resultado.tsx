'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VerificacionQR, EstadoPermiso } from '@/types';
import { formatDateLong } from '@/lib/utils';

const ESTADO_DISPLAY: Record<
  EstadoPermiso,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    Icon: React.ElementType;
    badgeVariant: 'success' | 'danger' | 'neutral';
    descripcion: string;
  }
> = {
  vigente: {
    label: 'Permiso Vigente',
    color: 'text-success-700',
    bg: 'bg-success-50',
    border: 'border-success-300',
    Icon: CheckCircle2,
    badgeVariant: 'success',
    descripcion: 'Este permiso es válido para la fecha y hora actuales.',
  },
  vencido: {
    label: 'Permiso Vencido',
    color: 'text-neutral-700',
    bg: 'bg-neutral-50',
    border: 'border-neutral-300',
    Icon: XCircle,
    badgeVariant: 'neutral',
    descripcion: 'Este permiso ha superado su fecha de vencimiento.',
  },
  revocado: {
    label: 'Permiso Revocado',
    color: 'text-danger-700',
    bg: 'bg-danger-50',
    border: 'border-danger-300',
    Icon: XCircle,
    badgeVariant: 'danger',
    descripcion: 'Este permiso fue revocado y ya no tiene validez.',
  },
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3 py-2 border-b border-neutral-100 last:border-0">
      <dt className="text-sm font-medium text-neutral-500 sm:w-40 shrink-0">{label}</dt>
      <dd className="text-sm text-neutral-800">{value}</dd>
    </div>
  );
}

interface PermisoResultadoProps {
  data: VerificacionQR;
  onNueva: () => void;
}

export function PermisoResultado({ data, onNueva }: PermisoResultadoProps) {
  if (!data.encontrado || !data.estado) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50 p-8 text-center">
          <HelpCircle className="h-16 w-16 text-neutral-400" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold text-neutral-700 mb-1">Permiso no encontrado</h2>
            <p className="text-sm text-neutral-500">
              El código ingresado no corresponde a ningún permiso registrado en el sistema.
            </p>
          </div>
          <Button variant="outline" onClick={onNueva}>
            Verificar otro código
          </Button>
        </div>
      </motion.div>
    );
  }

  const conf = ESTADO_DISPLAY[data.estado];
  const { Icon } = conf;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Semáforo principal */}
      <div
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-8 text-center ${conf.bg} ${conf.border}`}
        role="status"
        aria-live="polite"
        aria-label={`Estado del permiso: ${conf.label}`}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
        >
          <Icon className={`h-20 w-20 ${conf.color}`} aria-hidden="true" />
        </motion.div>
        <h2 className={`text-2xl font-bold ${conf.color}`}>{conf.label}</h2>
        <p className={`text-sm ${conf.color} opacity-80`}>
          {data.estadoDescripcion ?? conf.descripcion}
        </p>
        {data.codigoPermiso && (
          <Badge variant={conf.badgeVariant} className="font-mono text-xs px-3 py-1">
            {data.codigoPermiso}
          </Badge>
        )}
      </div>

      {/* Detalles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Información del permiso</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <InfoRow label="Titular" value={data.nombreTitular} />
            <InfoRow label="Placa" value={data.placaMoto} />
            <InfoRow
              label="Motocicleta"
              value={[data.marcaMoto, data.modeloMoto].filter(Boolean).join(' ') || undefined}
            />
            <InfoRow label="Motivo" value={data.motivo} />
            <InfoRow label="Municipio" value={data.municipio} />
            <InfoRow
              label="Vigencia desde"
              value={data.fechaInicio ? formatDateLong(data.fechaInicio) : undefined}
            />
            <InfoRow
              label="Vigencia hasta"
              value={data.fechaFin ? formatDateLong(data.fechaFin) : undefined}
            />
            <InfoRow label="Validado en" value={formatDateLong(data.validadoEn)} />
          </dl>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={onNueva}>
        Verificar otro permiso
      </Button>
    </motion.div>
  );
}
