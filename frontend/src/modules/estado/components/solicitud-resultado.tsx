'use client';

import { motion } from 'framer-motion';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useToast } from '@/providers/toast-provider';
import type { SolicitudResumenCiudadano, EstadoSolicitud, EstadoPermiso } from '@/types';
import { formatDateLong } from '@/lib/utils';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

/* ── Mapas de estado ─────────────────────────────────── */
const ESTADO_CONFIG: Record<
  EstadoSolicitud,
  {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
    Icon: React.ElementType;
  }
> = {
  recibida: { label: 'Recibida', variant: 'default', Icon: CheckCircle2 },
  en_revision: { label: 'En revisión', variant: 'warning', Icon: Clock },
  aprobada: { label: 'Aprobada', variant: 'success', Icon: CheckCircle2 },
  rechazada: { label: 'Rechazada', variant: 'danger', Icon: XCircle },
  pendiente_correccion: { label: 'Corrección requerida', variant: 'warning', Icon: AlertCircle },
  vencida: { label: 'Vencida', variant: 'neutral', Icon: XCircle },
};

const PERMISO_CONFIG: Record<
  EstadoPermiso,
  { label: string; variant: 'success' | 'danger' | 'neutral' }
> = {
  vigente: { label: 'Vigente', variant: 'success' },
  vencido: { label: 'Vencido', variant: 'neutral' },
  revocado: { label: 'Revocado', variant: 'danger' },
};

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-neutral-100 last:border-0">
      <dt className="text-sm font-medium text-neutral-500 sm:w-40 shrink-0">{label}</dt>
      <dd className="text-sm text-neutral-800 mt-0.5 sm:mt-0">{value}</dd>
    </div>
  );
}

interface SolicitudResultadoProps {
  data: SolicitudResumenCiudadano;
  onNuevaConsulta: () => void;
}

export function SolicitudResultado({ data, onNuevaConsulta }: SolicitudResultadoProps) {
  const { toast } = useToast();
  const estadoConf = ESTADO_CONFIG[data.estado] ?? ESTADO_CONFIG.recibida;
  const { Icon } = estadoConf;

  async function descargarPermiso() {
    if (!data.permiso?.urlDescarga) return;
    try {
      window.open(data.permiso.urlDescarga, '_blank', 'noopener,noreferrer');
    } catch {
      toast({ type: 'error', title: 'No fue posible abrir el enlace de descarga' });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Cabecera de estado */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-1">
                Radicado
              </p>
              <CardTitle className="text-xl font-mono">{data.radicado}</CardTitle>
            </div>
            <Badge variant={estadoConf.variant} className="text-sm px-3 py-1">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {estadoConf.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {data.estadoDescripcion && (
            <p className="text-sm text-neutral-600 mb-4">{data.estadoDescripcion}</p>
          )}
          <dl>
            <InfoRow label="Ciudadano" value={data.nombreCiudadano} />
            <InfoRow label="Placa" value={data.placaMoto} />
            <InfoRow label="Motivo" value={data.motivoNombre} />
            <InfoRow label="Funcionario" value={data.funcionarioNombre} />
            <InfoRow label="Fecha de solicitud" value={formatDateLong(data.fechaCreacion)} />
            <InfoRow label="Última actualización" value={formatDateLong(data.fechaActualizacion)} />
          </dl>
        </CardContent>
      </Card>

      {/* Permiso (si existe) */}
      {data.permiso && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-600" aria-hidden="true" />
                Permiso de Circulación
              </CardTitle>
              <Badge variant={PERMISO_CONFIG[data.permiso.estadoPermiso]?.variant ?? 'neutral'}>
                {PERMISO_CONFIG[data.permiso.estadoPermiso]?.label ?? data.permiso.estadoPermiso}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl>
              <InfoRow
                label="Código"
                value={
                  <code className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded">
                    {data.permiso.codigoPermiso}
                  </code>
                }
              />
              <InfoRow label="Fecha de emisión" value={formatDateLong(data.permiso.fechaEmision)} />
              <InfoRow
                label="Fecha de vencimiento"
                value={formatDateLong(data.permiso.fechaVencimiento)}
              />
            </dl>

            {data.permiso.estadoPermiso === 'vigente' && data.permiso.urlDescarga && (
              <Button
                className="mt-4 w-full sm:w-auto gap-2"
                onClick={descargarPermiso}
                aria-label="Descargar permiso en PDF"
              >
                <Download className="h-4 w-4" />
                Descargar permiso PDF
              </Button>
            )}

            {data.permiso.estadoPermiso === 'vigente' && !data.permiso.urlDescarga && (
              <Alert variant="info" className="mt-4">
                El permiso está disponible. Recibirá el enlace de descarga en su correo electrónico.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historial de estados */}
      {data.historial && data.historial.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Historial de estados</CardTitle>
          </CardHeader>
          <CardContent>
            <ol
              className="relative border-l-2 border-neutral-200 ml-2 space-y-4"
              aria-label="Historial de estados"
            >
              {data.historial.map((item, idx) => {
                const conf = ESTADO_CONFIG[item.estado];
                return (
                  <li key={idx} className="ml-5">
                    <div
                      className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white bg-primary-600"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <Badge variant={conf?.variant ?? 'neutral'} className="text-xs">
                        {conf?.label ?? item.estado}
                      </Badge>
                      <time className="text-xs text-neutral-400">{formatDateLong(item.fecha)}</time>
                    </div>
                    {item.descripcion && (
                      <p className="text-xs text-neutral-600">{item.descripcion}</p>
                    )}
                    {item.usuario && (
                      <p className="text-xs text-neutral-400">Por: {item.usuario}</p>
                    )}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Alerta corrección requerida */}
      {data.estado === 'pendiente_correccion' && (
        <Alert variant="warning" title="Corrección requerida">
          Debe corregir los datos de su solicitud. Revise el correo electrónico para ver los campos
          específicos que requieren corrección.
        </Alert>
      )}

      {/* Alerta rechazada */}
      {data.estado === 'rechazada' && (
        <Alert variant="danger" title="Solicitud rechazada">
          Su solicitud fue rechazada. Puede presentar una nueva solicitud si considera que los
          motivos han sido resueltos.
        </Alert>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button variant="outline" onClick={onNuevaConsulta} aria-label="Realizar nueva consulta">
          Nueva consulta
        </Button>
        <Link href={ROUTES.solicitud} className="contents">
          <Button variant="ghost" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Nueva solicitud
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
