/* ════════════════════════════════════════════
   Tipos base de respuesta de la API backend
════════════════════════════════════════════ */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}

/* ════════════════════════════════════════════
   Dominio — Configuración Institucional
════════════════════════════════════════════ */

export interface ConfiguracionPublica {
  nombreAlcaldia: string;
  municipio: string;
  departamento: string;
  correo: string;
  telefono: string;
  sitioWeb: string | null;
  logoUrl: string | null;
}

/* ════════════════════════════════════════════
   Dominio — Motivos
════════════════════════════════════════════ */

export interface Motivo {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

/* ════════════════════════════════════════════
   Dominio — Solicitudes (portal ciudadano)
════════════════════════════════════════════ */

export type EstadoSolicitud =
  'recibida' | 'en_revision' | 'aprobada' | 'rechazada' | 'pendiente_correccion' | 'vencida';

export interface SolicitudResumenCiudadano {
  radicado: string;
  estado: EstadoSolicitud;
  estadoDescripcion: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  nombreCiudadano?: string;
  placaMoto?: string;
  permiso?: {
    codigoPermiso: string;
    estadoPermiso: EstadoPermiso;
    fechaEmision: string;
    fechaVencimiento: string;
    urlDescarga?: string;
  };
}

export interface SolicitudCreadaResponse {
  id: string;
  radicado: string;
  estado: EstadoSolicitud;
  message: string;
}

/* ════════════════════════════════════════════
   Dominio — Permisos (portal ciudadano)
════════════════════════════════════════════ */

export type EstadoPermiso = 'vigente' | 'vencido' | 'revocado';

export interface VerificacionQR {
  encontrado: boolean;
  estado?: EstadoPermiso;
  estadoDescripcion?: string;
  codigoPermiso?: string;
  nombreTitular?: string;
  placaMoto?: string;
  marcaMoto?: string;
  modeloMoto?: string;
  motivo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  municipio?: string;
  validadoEn: string;
}

/* ════════════════════════════════════════════
   Utilidades de UI
════════════════════════════════════════════ */

export interface StepItem {
  id: number;
  label: string;
  completed: boolean;
  active: boolean;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}
