/* ════════════════════════════════════════════
   Tipos del Portal Administrador (B18)
════════════════════════════════════════════ */

import type { PaginacionBackend } from './funcionario';

/* ── Catálogos ──────────────────────────────── */

export interface RolCatalog {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface DependenciaCatalog {
  id: string;
  nombre: string;
  codigo: string;
}

/* ── Configuración Institucional (admin) ────── */

export interface ConfiguracionInstitucionalAdmin {
  id: string;
  nombreAlcaldia: string;
  nit: string;
  codigoDane: string;
  departamento: string;
  municipio: string;
  direccion: string;
  telefono: string;
  correoInstitucional: string;
  sitioWeb: string | null;
  tieneEscudo: boolean;
  tieneLogo: boolean;
  updatedAt: string | null;
}

export interface ActualizarConfiguracionBody {
  nombreAlcaldia?: string;
  nit?: string;
  codigoDane?: string;
  departamento?: string;
  municipio?: string;
  direccion?: string;
  telefono?: string;
  correoInstitucional?: string;
  sitioWeb?: string | null;
}

/* ── Usuarios ─────────────────────────────── */

export interface RolBriefAdmin {
  id: string;
  nombre: string;
}

export interface DependenciaBriefAdmin {
  id: string;
  nombre: string;
}

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolBriefAdmin;
  dependencia: DependenciaBriefAdmin | null;
  activo: boolean;
  ultimoLogin: string | null;
  createdAt: string;
}

export interface UsuarioAdminDetalle extends UsuarioAdmin {
  intentosFallidos: number;
  contrasenaExpiraAt: string | null;
  updatedAt: string | null;
}

export interface UsuarioCreado extends UsuarioAdminDetalle {
  contrasenaTemp: string;
}

export interface UsuariosPaginados {
  items: UsuarioAdmin[];
  pagination: PaginacionBackend;
}

export interface ListarUsuariosQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  rolId?: string;
  dependenciaId?: string;
  activo?: boolean;
  busqueda?: string;
}

/* ── Auditoría ────────────────────────────── */

export type AccionAuditoria =
  | 'LOGIN_EXITOSO'
  | 'LOGIN_FALLIDO'
  | 'LOGOUT'
  | 'SOLICITUD_CREADA'
  | 'SOLICITUD_EN_REVISION'
  | 'SOLICITUD_PENDIENTE_CORRECCION'
  | 'SOLICITUD_APROBADA'
  | 'SOLICITUD_RECHAZADA'
  | 'SOLICITUD_VENCIDA'
  | 'PERMISO_GENERADO'
  | 'PERMISO_REVOCADO'
  | 'PERMISO_VENCIDO'
  | 'PERMISO_QR_VERIFICADO'
  | 'USUARIO_CREADO'
  | 'USUARIO_ACTUALIZADO'
  | 'USUARIO_DESACTIVADO'
  | 'USUARIO_ACTIVADO'
  | 'USUARIO_ELIMINADO'
  | 'USUARIO_RESTAURADO'
  | 'CONTRASENA_CAMBIADA'
  | 'CONTRASENA_RESTABLECIDA'
  | 'CONFIGURACION_ACTUALIZADA'
  | 'DOCUMENTO_SUBIDO'
  | 'DOCUMENTO_ELIMINADO'
  | 'DOCUMENTO_DESCARGADO'
  | 'REFRESH_TOKEN_USADO'
  | 'REFRESH_TOKEN_REVOCADO';

export interface AuditoriaUsuarioBrief {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
}

export interface AuditoriaItem {
  id: string;
  accion: AccionAuditoria;
  entidad: string;
  entidadId: string | null;
  usuario: AuditoriaUsuarioBrief | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditoriaPaginada {
  items: AuditoriaItem[];
  pagination: PaginacionAdmin;
}

export interface ListarAuditoriaQuery {
  page?: number;
  limit?: number;
  accion?: AccionAuditoria;
  entidad?: string;
  usuarioId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

/* ── Paginación genérica admin ─────────────── */

export interface PaginacionAdmin {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/* ── Motivos (admin CRUD) ──────────────────── */

export interface MotivoAdmin {
  id: string;
  nombre: string;
  descripcion: string | null;
  requiereSoporte: boolean;
  activo: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CrearMotivoBody {
  nombre: string;
  descripcion?: string;
  requiereSoporte?: boolean;
  orden?: number;
}

export interface ActualizarMotivoBody {
  nombre?: string;
  descripcion?: string;
  requiereSoporte?: boolean;
  orden?: number;
}

/* ── Dependencias (admin CRUD) ─────────────── */

export interface DependenciaAdmin {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CrearDependenciaBody {
  nombre: string;
  codigo: string;
  descripcion?: string;
}

export interface ActualizarDependenciaBody {
  nombre?: string;
  descripcion?: string;
}

/* ── Permisos (panel admin/funcionario list) ─ */

export interface PermisoAdmin {
  id: string;
  codigoPermiso: string;
  estado: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  createdAt: string;
}

/* ── Reportes ──────────────────────────────── */

export interface ReporteByEstado {
  total: number;
  byEstado: Record<string, number>;
  fechaDesde?: string;
  fechaHasta?: string;
}

/* ── Health / Sistema ─────────────────────── */

export type HealthServiceStatus = 'up' | 'down';

export interface HealthCheckResult {
  status: HealthServiceStatus;
  [key: string]: unknown;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  info: {
    database?: HealthCheckResult;
    redis?: HealthCheckResult;
    minio?: HealthCheckResult;
    smtp?: HealthCheckResult;
    [key: string]: HealthCheckResult | undefined;
  };
  error?: {
    database?: HealthCheckResult;
    redis?: HealthCheckResult;
    minio?: HealthCheckResult;
    smtp?: HealthCheckResult;
    [key: string]: HealthCheckResult | undefined;
  };
  details?: Record<string, HealthCheckResult>;
}
