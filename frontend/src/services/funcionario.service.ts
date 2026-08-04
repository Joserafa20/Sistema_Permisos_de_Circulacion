import { apiGet, apiPost } from '@/lib/api-client';
import type { ApiResponse, ApiListResponse } from '@/types';
import type {
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  UsuarioPerfil,
  DashboardStats,
  SolicitudListItem,
} from '@/types/funcionario';

/* ── Auth ──────────────────────────────────────── */

export async function loginFuncionario(payload: LoginPayload): Promise<LoginResponse> {
  const res = await apiPost<ApiResponse<LoginResponse>>('/auth/login', {
    correoElectronico: payload.correoElectronico,
    contrasena: payload.contrasena,
  });
  return res.data;
}

export async function logoutFuncionario(refreshToken: string): Promise<void> {
  await apiPost('/auth/logout', { refresh_token: refreshToken });
}

export async function refreshFuncionario(refreshToken: string): Promise<RefreshResponse> {
  const res = await apiPost<ApiResponse<RefreshResponse>>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return res.data;
}

export async function getMePerfil(): Promise<UsuarioPerfil> {
  const res = await apiGet<ApiResponse<UsuarioPerfil>>('/auth/me');
  return res.data;
}

/* ── Dashboard ─────────────────────────────────── */

function todayCO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

async function countSolicitudes(params: Record<string, string>): Promise<number> {
  const query = new URLSearchParams({ page: '1', limit: '1', ...params }).toString();
  const res = await apiGet<ApiListResponse<SolicitudListItem>>(`/solicitudes?${query}`);
  return res.meta?.total ?? 0;
}

async function countPermisos(params: Record<string, string>): Promise<number> {
  const query = new URLSearchParams({ page: '1', limit: '1', ...params }).toString();
  const res = await apiGet<ApiListResponse<unknown>>(`/permisos?${query}`);
  return res.meta?.total ?? 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const hoy = todayCO();

  const [pendientes, enCorreccion, aprobadasHoy, rechazadasHoy, activos, vencidos] =
    await Promise.all([
      countSolicitudes({ estado: 'recibida' }),
      countSolicitudes({ estado: 'pendiente_correccion' }),
      countSolicitudes({ estado: 'aprobada', fechaDesde: hoy }),
      countSolicitudes({ estado: 'rechazada', fechaDesde: hoy }),
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
  const res = await apiGet<ApiListResponse<SolicitudListItem>>(
    '/solicitudes?page=1&limit=5&order=fechaCreacion:DESC',
  );
  return res.data ?? [];
}
