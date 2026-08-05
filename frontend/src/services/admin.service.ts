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

/* ── Health / Sistema ─────────────────────── */

export async function getHealth(): Promise<HealthStatus> {
  // /health is @Public() and returns Terminus format directly (no ApiResponse wrapper)
  return apiGet<HealthStatus>('/health');
}

export { type UsuarioAdmin };
