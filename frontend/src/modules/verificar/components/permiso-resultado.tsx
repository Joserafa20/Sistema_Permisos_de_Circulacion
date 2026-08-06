'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  User,
  Bike,
  FileText,
  AlertTriangle,
} from 'lucide-react';
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
    descripcion: 'Este permiso es auténtico y válido a la fecha actual.',
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

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-3 py-2.5 border-b border-neutral-100 last:border-0">
      <dt className="text-xs font-semibold text-neutral-500 uppercase tracking-wide sm:w-44 shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm font-medium text-neutral-900 mt-0.5 sm:mt-0">{String(value)}</dd>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <Icon className="h-4 w-4 text-neutral-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
      </div>
      <dl className="px-4">{children}</dl>
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

  const motoDesc = [data.marcaMoto, data.lineaMoto, data.modeloMoto ? `(${data.modeloMoto})` : null]
    .filter(Boolean)
    .join(' ');

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

      {/* Datos del titular */}
      {data.nombreTitular && (
        <Section icon={User} title="Datos del titular">
          <Row label="Nombre completo" value={data.nombreTitular} />
          <Row label="Tipo de documento" value={data.tipoDocumento} />
          <Row label="Número de documento" value={data.numeroDocumento} />
        </Section>
      )}

      {/* Datos de la motocicleta */}
      {data.placaMoto && (
        <Section icon={Bike} title="Datos de la motocicleta">
          <Row label="Placa" value={data.placaMoto} />
          {motoDesc && <Row label="Marca / Línea / Año" value={motoDesc} />}
          <Row label="Color" value={data.colorMoto} />
        </Section>
      )}

      {/* Datos del permiso */}
      <Section icon={FileText} title="Datos del permiso">
        <Row label="Motivo" value={data.motivo} />
        <Row
          label="Válido desde"
          value={data.fechaInicio ? formatDateLong(data.fechaInicio) : undefined}
        />
        <Row
          label="Válido hasta"
          value={data.fechaFin ? formatDateLong(data.fechaFin) : undefined}
        />
        <Row label="Funcionario autorizó" value={data.funcionarioAutorizo} />
        <Row label="Verificado el" value={formatDateLong(data.validadoEn)} />
      </Section>

      {/* Condiciones o restricciones */}
      {data.condicionesRestricciones && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Condiciones y restricciones</p>
            <p className="text-sm text-amber-700">{data.condicionesRestricciones}</p>
          </div>
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={onNueva}>
        Verificar otro permiso
      </Button>
    </motion.div>
  );
}
