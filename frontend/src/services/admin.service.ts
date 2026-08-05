import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type {
  ConfiguracionInstitucionalAdmin,
  ActualizarConfiguracionBody,
  UsuarioAdmin,
  UsuarioAdminDetalle,
  UsuarioCreado,
  UsuariosPaginados,
  ListarUsuariosQuery,
  RolCatalog,
  DependenciaCatalog,
  HealthStatus,
  AuditoriaPaginada,
  ListarAuditoriaQuery,
  MotivoAdmin,
  CrearMotivoBody,
  ActualizarMotivoBody,
  DependenciaAdmin,
  CrearDependenciaBody,
  ActualizarDependenciaBody,
  ReporteByEstado,
} from '@/types/admin';

/* ── Configuración Institucional ─────────────── */

export async function getConfiguracionAdmin(): Promise<ConfiguracionInstitucionalAdmin> {
  const res = await apiGet<ApiResponse<ConfiguracionInstitucionalAdmin>>(
    '/configuracion-institucional',
  );
  return res.data;
}

export async function actualizarConfiguracion(
  body: ActualizarConfiguracionBody,
): Promise<ConfiguracionInstitucionalAdmin> {
  const res = await apiPatch<ApiResponse<ConfiguracionInstitucionalAdmin>>(
    '/configuracion-institucional',
    body,
  );
  return res.data;
}

/* ── Usuarios ─────────────────────────────────── */

export async function getUsuarios(query: ListarUsuariosQuery = {}): Promise<UsuariosPaginados> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);
  if (query.rolId) params.set('rolId', query.rolId);
  if (query.dependenciaId) params.set('dependenciaId', query.dependenciaId);
  if (query.activo !== undefined) params.set('activo', String(query.activo));
  if (query.busqueda) params.set('busqueda', query.busqueda);

  const res = await apiGet<ApiResponse<UsuariosPaginados>>(`/usuarios?${params.toString()}`);
  return res.data;
}

export async function getUsuario(id: string): Promise<UsuarioAdminDetalle> {
  const res = await apiGet<ApiResponse<UsuarioAdminDetalle>>(`/usuarios/${id}`);
  return res.data;
}

export async function crearUsuario(body: {
  nombre: string;
  apellido: string;
  email: string;
  rolId: string;
  dependenciaId?: string;
}): Promise<UsuarioCreado> {
  const res = await apiPost<ApiResponse<UsuarioCreado>>('/usuarios', body);
  return res.data;
}

export async function actualizarUsuario(
  id: string,
  body: {
    nombre?: string;
    apellido?: string;
    email?: string;
    rolId?: string;
    dependenciaId?: string | null;
    desbloquear?: boolean;
  },
): Promise<UsuarioAdminDetalle> {
  const res = await apiPut<ApiResponse<UsuarioAdminDetalle>>(`/usuarios/${id}`, body);
  return res.data;
}

export async function activarDesactivarUsuario(
  id: string,
  activo: boolean,
): Promise<UsuarioAdminDetalle> {
  const res = await apiPatch<ApiResponse<UsuarioAdminDetalle>>(`/usuarios/${id}/activar`, {
    activo,
  });
  return res.data;
}

export async function eliminarUsuario(id: string): Promise<{ id: string }> {
  const res = await apiDelete<ApiResponse<{ id: string }>>(`/usuarios/${id}`);
  return res.data;
}

export async function restaurarUsuario(id: string): Promise<UsuarioAdminDetalle> {
  const res = await apiPost<ApiResponse<UsuarioAdminDetalle>>(`/usuarios/${id}/restaurar`);
  return res.data;
}

/* ── Catálogos ──────────────────────────────── */

export async function getRoles(): Promise<RolCatalog[]> {
  const res = await apiGet<ApiResponse<RolCatalog[]>>('/roles');
  return res.data;
}

export async function getDependencias(): Promise<DependenciaCatalog[]> {
  const res = await apiGet<ApiResponse<DependenciaCatalog[]>>('/dependencias');
  return res.data;
}

/* ── Auditoría ───────────────────────────────── */

export async function getAuditoria(query: ListarAuditoriaQuery = {}): Promise<AuditoriaPaginada> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.accion) params.set('accion', query.accion);
  if (query.entidad) params.set('entidad', query.entidad);
  if (query.usuarioId) params.set('usuarioId', query.usuarioId);
  if (query.fechaDesde) params.set('fechaDesde', query.fechaDesde);
  if (query.fechaHasta) params.set('fechaHasta', query.fechaHasta);
  return apiGet<AuditoriaPaginada>(`/auditoria?${params.toString()}`);
}

/* ── Motivos Admin ───────────────────────────── */

export async function getMotivosAdmin(): Promise<MotivoAdmin[]> {
  const res = await apiGet<{ items: MotivoAdmin[] }>('/motivos');
  return res.items;
}

export async function crearMotivo(body: CrearMotivoBody): Promise<MotivoAdmin> {
  return apiPost<MotivoAdmin>('/motivos', body);
}

export async function actualizarMotivo(
  id: string,
  body: ActualizarMotivoBody,
): Promise<MotivoAdmin> {
  return apiPatch<MotivoAdmin>(`/motivos/${id}`, body);
}

export async function toggleActivoMotivo(id: string): Promise<MotivoAdmin> {
  return apiPatch<MotivoAdmin>(`/motivos/${id}/toggle-activo`);
}

/* ── Dependencias Admin ──────────────────────── */

export async function getDependenciasAdmin(): Promise<DependenciaAdmin[]> {
  const res = await apiGet<{ items: DependenciaAdmin[] }>('/dependencias');
  return res.items;
}

export async function crearDependencia(body: CrearDependenciaBody): Promise<DependenciaAdmin> {
  return apiPost<DependenciaAdmin>('/dependencias', body);
}

export async function actualizarDependencia(
  id: string,
  body: ActualizarDependenciaBody,
): Promise<DependenciaAdmin> {
  return apiPatch<DependenciaAdmin>(`/dependencias/${id}`, body);
}

export async function toggleActivoDependencia(id: string): Promise<DependenciaAdmin> {
  return apiPatch<DependenciaAdmin>(`/dependencias/${id}/toggle-activo`);
}

/* ── Reportes ────────────────────────────────── */

export async function getReporteSolicitudes(
  fechaDesde?: string,
  fechaHasta?: string,
): Promise<ReporteByEstado> {
  const params = new URLSearchParams();
  if (fechaDesde) params.set('fechaDesde', fechaDesde);
  if (fechaHasta) params.set('fechaHasta', fechaHasta);
  return apiGet<ReporteByEstado>(`/reportes/solicitudes?${params.toString()}`);
}

export async function getReportePermisos(
  fechaDesde?: string,
  fechaHasta?: string,
): Promise<ReporteByEstado> {
  const params = new URLSearchParams();
  if (fechaDesde) params.set('fechaDesde', fechaDesde);
  if (fechaHasta) params.set('fechaHasta', fechaHasta);
  return apiGet<ReporteByEstado>(`/reportes/permisos?${params.toString()}`);
}

/* ── Health / Sistema ─────────────────────── */

export async function getHealth(): Promise<HealthStatus> {
  // /health is @Public() and returns Terminus format directly (no ApiResponse wrapper)
  return apiGet<HealthStatus>('/health');
}

export { type UsuarioAdmin };
