/* ════════════════════════════════════════════
   Tipos del Portal Funcionario
════════════════════════════════════════════ */

export type RolSlug = 'funcionario' | 'administrador';

export interface RolInfo {
  id: string;
  nombre: string;
  slug: RolSlug;
}

export interface DependenciaInfo {
  id: string;
  nombre: string;
}

export interface UsuarioPerfil {
  id: string;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  activo: boolean;
  rol: RolInfo;
  dependencia?: DependenciaInfo;
}

export interface LoginPayload {
  correoElectronico: string;
  contrasena: string;
  recordarme?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
  user: UsuarioPerfil;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/* ── Dashboard ──────────────────────────────── */

export interface DashboardStats {
  solicitudesPendientes: number;
  solicitudesEnCorreccion: number;
  aprobadasHoy: number;
  rechazadasHoy: number;
  permisosActivos: number;
  permisosVencidos: number;
}

export interface SolicitudListItem {
  id: string;
  radicado: string;
  estado: string;
  estadoDescripcion: string;
  ciudadanoNombre: string;
  placaMoto: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  motivoNombre?: string;
}

/* ── Auth context ─────────────────────────── */

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
