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
