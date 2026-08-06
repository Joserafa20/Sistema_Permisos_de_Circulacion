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
    nombre: string;
    apellido: string;
    email: string;
    celular: string;
    direccion?: string;
    aceptaTratamientoDatos: boolean;
  };
  motocicleta: {
    placa: string;
    marca?: string;
    linea?: string;
    modelo?: number;
    cilindraje?: number;
    color?: string;
  };
  motivoId: string;
  declaracionJurada: boolean;
  descripcionAdicional?: string;
  recaptchaToken?: string;
}

export async function crearSolicitud(
  payload: CrearSolicitudPayload,
): Promise<SolicitudCreadaResponse> {
  const response = await apiPost<ApiResponse<Record<string, unknown>>>(
    '/public/solicitudes',
    payload,
  );
  const raw = response.data;
  // Backend devuelve numeroRadicado; el tipo frontend usa radicado
  return {
    id: raw['id'] as string,
    radicado: (raw['numeroRadicado'] ?? raw['radicado']) as string,
    estado: raw['estado'] as SolicitudCreadaResponse['estado'],
    message: (raw['message'] ?? '') as string,
  };
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
  const url = `/public/solicitudes/${solicitudId}/documentos?radicado=${encodeURIComponent(radicado)}&documento=${encodeURIComponent(documento)}`;
  for (const file of files) {
    const form = new FormData();
    form.append('archivo', file, file.name);
    form.append('tipoDocumento', 'otro');
    await apiPost(url, form);
  }
}
