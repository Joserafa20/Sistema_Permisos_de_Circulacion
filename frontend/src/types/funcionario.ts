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

/* ── Auth context ─────────────────────────── */

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/* ═══════════════════════════════════════════
   Solicitudes — Listado (backend DTO exacto)
═══════════════════════════════════════════ */

export type EstadoSolicitud =
  'recibida' | 'en_revision' | 'aprobada' | 'rechazada' | 'pendiente_correccion' | 'vencida';

export interface CiudadanoResumen {
  nombre: string;
  numeroDocumento: string;
  email: string | null;
  celular: string | null;
}

export interface MotocicletaResumen {
  placa: string;
  marca: string | null;
  modelo: number | null;
}

export interface SolicitudListItem {
  id: string;
  numeroRadicado: string;
  estado: EstadoSolicitud;
  ciudadano: CiudadanoResumen;
  motocicleta: MotocicletaResumen;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
  tiempoEspera: string;
  createdAt: string;
}

export interface PaginacionBackend {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedSolicitudesResponse {
  data: SolicitudListItem[];
  pagination: PaginacionBackend;
}

/* ═══════════════════════════════════════════
   Solicitudes — Detalle
═══════════════════════════════════════════ */

export interface CiudadanoDetalle {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string | null;
  direccion: string | null;
  barrio: string | null;
  municipio: string | null;
  celular: string | null;
  email: string | null;
}

export interface MotocicletaDetalle {
  id: string;
  placa: string;
  marca: string | null;
  linea: string | null;
  modelo: number | null;
  cilindraje: number | null;
  color: string | null;
  numeroMotor: string | null;
  numeroChasis: string | null;
}

export interface MotivoDetalle {
  id: string;
  nombre: string;
  requiereSoporte: boolean;
}

export interface DocumentoItem {
  id: string;
  tipoDocumento: string;
  nombreOriginal: string;
  mimeType: string;
  tamanoBytes: number;
  activo: boolean;
  createdAt: string;
}

export interface HistorialEstadoItem {
  id: string;
  estadoAnterior: EstadoSolicitud | null;
  estadoNuevo: EstadoSolicitud;
  motivo: string | null;
  camposCorreccion: Record<string, unknown> | null;
  usuario: { nombre: string; apellido: string } | null;
  createdAt: string;
}

export interface PermisoEnSolicitud {
  id?: string;
  codigoPermiso?: string;
  estado?: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
}

export interface SolicitudDetalle {
  id: string;
  numeroRadicado: string;
  estado: EstadoSolicitud;
  ciudadano: CiudadanoDetalle;
  motocicleta: MotocicletaDetalle;
  motivo: MotivoDetalle;
  fechaInicio: string;
  fechaFin: string;
  descripcionAdicional: string | null;
  declaracionJurada: boolean;
  documentos: DocumentoItem[];
  historial: HistorialEstadoItem[];
  permiso: PermisoEnSolicitud | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface DocumentoUrl {
  url: string;
  expiraEn: string;
  nombreOriginal: string;
  mimeType: string;
}

export interface AccionSolicitudResponse {
  solicitudId: string;
  numeroRadicado: string;
  estado: EstadoSolicitud;
  mensaje: string | null;
}

export interface PermisoPdfUrl {
  url: string;
  expiraEn: string;
  codigoPermiso: string;
  nombreArchivo: string;
}

export interface PermisoListItem {
  id: string;
  codigoPermiso: string;
  estado: string;
  ciudadano: { nombre: string; numeroDocumento: string };
  motocicleta: { placa: string };
  motivo: string;
  fechaExpedicion: string;
  fechaVencimiento: string;
  funcionario: { nombre: string; apellido: string };
}

export interface PaginatedPermisosResponse {
  items: PermisoListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ListarPermisosFiltros {
  page?: number;
  limit?: number;
  estado?: string;
  placa?: string;
  documento?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

/* ═══════════════════════════════════════════
   Solicitudes — Filtros UI
═══════════════════════════════════════════ */

export type SortOrder = 'ASC' | 'DESC';

export interface SolicitudesFiltros {
  estados: EstadoSolicitud[];
  fechaInicio: string;
  fechaFin: string;
  documento: string;
  placa: string;
  radicado: string;
  sortBy: string;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
