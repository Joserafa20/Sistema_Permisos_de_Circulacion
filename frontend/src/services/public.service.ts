import { apiGet, apiPost } from '@/lib/api-client';
import type {
  ApiResponse,
  ConfiguracionPublica,
  Motivo,
  SolicitudCreadaResponse,
  SolicitudResumenCiudadano,
  VerificacionQR,
} from '@/types';

/* ── GET /public/motivos ──────────────────────── */
export async function getMotivos(): Promise<Motivo[]> {
  const response = await apiGet<ApiResponse<Motivo[]>>('/public/motivos');
  return response.data;
}

/* ── GET /public/configuracion/publica ───────── */
export async function getConfiguracionPublica(): Promise<ConfiguracionPublica> {
  const response = await apiGet<ApiResponse<ConfiguracionPublica>>('/public/configuracion/publica');
  return response.data;
}

/* ── POST /public/solicitudes ────────────────── */
export interface CrearSolicitudPayload {
  ciudadano: {
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    correoElectronico: string;
    telefono: string;
  };
  motocicleta: {
    placa: string;
    marca: string;
    modelo: string;
    anio: number;
    cilindraje: number;
    color: string;
  };
  solicitud: {
    motivoId: string;
    fechaInicio: string;
    fechaFin: string;
    declaracionJurada: boolean;
    justificacion?: string;
  };
}

export async function crearSolicitud(
  payload: CrearSolicitudPayload,
): Promise<SolicitudCreadaResponse> {
  const response = await apiPost<ApiResponse<SolicitudCreadaResponse>>(
    '/public/solicitudes',
    payload,
  );
  return response.data;
}

/* ── GET /public/solicitudes/estado ──────────── */
export async function getEstadoSolicitud(
  radicado: string,
  documento: string,
): Promise<SolicitudResumenCiudadano> {
  const response = await apiGet<ApiResponse<SolicitudResumenCiudadano>>(
    '/public/solicitudes/estado',
    { params: { radicado, documento } },
  );
  return response.data;
}

/* ── GET /public/verificar/{codigo} ──────────── */
export async function verificarPermiso(codigoQR: string): Promise<VerificacionQR> {
  const response = await apiGet<ApiResponse<VerificacionQR>>(
    `/public/verificar/${encodeURIComponent(codigoQR)}`,
  );
  return response.data;
}

/* ── POST /public/solicitudes/{id}/documentos ── */
export async function adjuntarDocumentos(
  solicitudId: string,
  radicado: string,
  documento: string,
  files: File[],
): Promise<void> {
  const form = new FormData();
  files.forEach((file) => form.append('files', file));

  await apiPost(
    `/public/solicitudes/${solicitudId}/documentos?radicado=${encodeURIComponent(radicado)}&documento=${encodeURIComponent(documento)}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
}
