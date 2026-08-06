import { apiGet, apiPost } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type {
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  UsuarioPerfil,
  DashboardStats,
  SolicitudListItem,
  PaginatedSolicitudesResponse,
  SolicitudDetalle,
  DocumentoUrl,
  SolicitudesFiltros,
  AccionSolicitudResponse,
  PermisoPdfUrl,
  PaginatedPermisosResponse,
  ListarPermisosFiltros,
} from '@/types/funcionario';

/* ── Auth ──────────────────────────────────────── */

// El backend devuelve campos en camelCase con nombres distintos al tipo UsuarioPerfil.
// Este mapper convierte la respuesta del backend al contrato del frontend.
function mapUsuario(u: {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  dependencia?: string | null;
  activo?: boolean;
}): UsuarioPerfil {
  return {
    id: u.id,
    nombres: u.nombre,
    apellidos: u.apellido,
    correoElectronico: u.email,
    activo: u.activo ?? true,
    rol: { id: u.rol, nombre: u.rol, slug: u.rol as UsuarioPerfil['rol']['slug'] },
    dependencia: u.dependencia ? { id: u.dependencia, nombre: '' } : undefined,
  };
}

export async function loginFuncionario(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiPost<
    ApiResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      usuario: {
        id: string;
        nombre: string;
        apellido: string;
        email: string;
        rol: string;
        dependencia: string | null;
        contrasenaExpirada: boolean;
      };
    }>
  >('/auth/login', {
    email: payload.correoElectronico,
    contrasena: payload.contrasena,
  });
  const d = res.data;
  return {
    access_token: d.accessToken,
    refresh_token: d.refreshToken,
    expires_in: d.expiresIn,
    token_type: 'Bearer',
    user: mapUsuario(d.usuario),
    contrasenaExpirada: d.usuario.contrasenaExpirada,
  };
}

export async function cambiarContrasena(payload: {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarContrasena: string;
}): Promise<{ message: string }> {
  const res = await apiPost<ApiResponse<{ message: string }>>('/auth/cambiar-contrasena', payload);
  return res.data;
}

export async function logoutFuncionario(refreshToken: string): Promise<void> {
  await apiPost('/auth/logout', { refreshToken });
}

export async function refreshFuncionario(refreshToken: string): Promise<RefreshResponse> {
  const res = await apiPost<
    ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>
  >('/auth/refresh', {
    refreshToken,
  });
  const d = res.data;
  return { access_token: d.accessToken, refresh_token: d.refreshToken, expires_in: d.expiresIn };
}

export async function getMePerfil(): Promise<UsuarioPerfil> {
  const res = await apiGet<
    ApiResponse<{
      id: string;
      nombre: string;
      apellido: string;
      email: string;
      rol: string;
      dependencia: string | null;
      activo: boolean;
    }>
  >('/auth/me');
  return mapUsuario(res.data);
}

/* ── Dashboard ─────────────────────────────────── */

function todayCO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

async function countSolicitudes(params: Record<string, string>): Promise<number> {
  const query = new URLSearchParams({ page: '1', limit: '1', ...params }).toString();
  const res = await apiGet<ApiResponse<PaginatedSolicitudesResponse>>(`/solicitudes?${query}`);
  return res.data?.pagination?.total ?? 0;
}

async function countPermisos(params: Record<string, string>): Promise<number> {
  const query = new URLSearchParams({ page: '1', limit: '1', ...params }).toString();
  const res = await apiGet<ApiResponse<{ data: unknown[]; pagination: { total: number } }>>(
    `/permisos?${query}`,
  );
  return res.data?.pagination?.total ?? 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const hoy = todayCO();

  const [pendientes, enCorreccion, aprobadasHoy, rechazadasHoy, activos, vencidos] =
    await Promise.all([
      countSolicitudes({ estado: 'recibida' }),
      countSolicitudes({ estado: 'pendiente_correccion' }),
      countSolicitudes({ estado: 'aprobada', fechaInicio: hoy }),
      countSolicitudes({ estado: 'rechazada', fechaInicio: hoy }),
      countPermisos({ estado: 'vigente' }),
      countPermisos({ estado: 'vencido' }),
    ]);

  return {
    solicitudesPendientes: pendientes,
    solicitudesEnCorreccion: enCorreccion,
    aprobadasHoy,
    rechazadasHoy,
    permisosActivos: activos,
    permisosVencidos: vencidos,
  };
}

export async function getActividadReciente(): Promise<SolicitudListItem[]> {
  const res = await apiGet<ApiResponse<PaginatedSolicitudesResponse>>(
    '/solicitudes?page=1&limit=5&sortBy=createdAt&sortOrder=DESC',
  );
  return res.data?.data ?? [];
}

/* ── Solicitudes ───────────────────────────────── */

export async function getSolicitudes(
  filtros: Partial<SolicitudesFiltros>,
): Promise<PaginatedSolicitudesResponse> {
  const params = new URLSearchParams();

  if (filtros.page) params.set('page', String(filtros.page));
  if (filtros.limit) params.set('limit', String(filtros.limit));
  if (filtros.sortBy) params.set('sortBy', filtros.sortBy);
  if (filtros.sortOrder) params.set('sortOrder', filtros.sortOrder);
  if (filtros.estados && filtros.estados.length > 0) {
    params.set('estado', filtros.estados.join(','));
  }
  if (filtros.fechaInicio) params.set('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.set('fechaFin', filtros.fechaFin);
  if (filtros.documento) params.set('documento', filtros.documento);
  if (filtros.placa) params.set('placa', filtros.placa.toUpperCase());
  if (filtros.radicado) params.set('radicado', filtros.radicado);

  const res = await apiGet<ApiResponse<PaginatedSolicitudesResponse>>(
    `/solicitudes?${params.toString()}`,
  );
  return res.data;
}

export async function getSolicitudDetalle(id: string): Promise<SolicitudDetalle> {
  const res = await apiGet<ApiResponse<SolicitudDetalle>>(`/solicitudes/${id}`);
  return res.data;
}

export async function getDocumentoUrl(solicitudId: string, docId: string): Promise<DocumentoUrl> {
  const res = await apiGet<ApiResponse<DocumentoUrl>>(
    `/solicitudes/${solicitudId}/documentos/${docId}`,
  );
  return res.data;
}

/* ── Acciones de solicitud ─────────────────────── */

export async function iniciarRevision(id: string): Promise<AccionSolicitudResponse> {
  const res = await apiPost<ApiResponse<AccionSolicitudResponse>>(
    `/solicitudes/${id}/iniciar-revision`,
    {},
  );
  return res.data;
}

export async function aprobarSolicitud(id: string): Promise<AccionSolicitudResponse> {
  const res = await apiPost<ApiResponse<AccionSolicitudResponse>>(`/solicitudes/${id}/aprobar`, {});
  return res.data;
}

export async function rechazarSolicitud(
  id: string,
  body: { motivo: string },
): Promise<AccionSolicitudResponse> {
  const res = await apiPost<ApiResponse<AccionSolicitudResponse>>(
    `/solicitudes/${id}/rechazar`,
    body,
  );
  return res.data;
}

export async function solicitarCorreccion(
  id: string,
  body: {
    motivo: string;
    camposCorreccion: Array<{ campo: string; descripcion: string }>;
  },
): Promise<AccionSolicitudResponse> {
  const res = await apiPost<ApiResponse<AccionSolicitudResponse>>(
    `/solicitudes/${id}/correccion`,
    body,
  );
  return res.data;
}

/* ── Permisos ─────────────────────────────────── */

export async function getPermisos(
  filtros: ListarPermisosFiltros = {},
): Promise<PaginatedPermisosResponse> {
  const params = new URLSearchParams();
  if (filtros.page) params.set('page', String(filtros.page));
  if (filtros.limit) params.set('limit', String(filtros.limit));
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.placa) params.set('placa', filtros.placa);
  if (filtros.documento) params.set('documento', filtros.documento);
  if (filtros.fechaInicio) params.set('fechaInicio', filtros.fechaInicio);
  if (filtros.fechaFin) params.set('fechaFin', filtros.fechaFin);
  const res = await apiGet<ApiResponse<PaginatedPermisosResponse>>(
    `/permisos?${params.toString()}`,
  );
  return res.data;
}

/* ── Permisos PDF ──────────────────────────────── */

export async function getPermisoPdfUrl(permisoId: string): Promise<PermisoPdfUrl> {
  const res = await apiGet<ApiResponse<PermisoPdfUrl>>(`/permisos/${permisoId}/pdf`);
  return res.data;
}
