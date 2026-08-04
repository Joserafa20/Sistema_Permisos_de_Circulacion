import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';
import { API_URL, API_TIMEOUT_MS } from './constants';

/* ─────────────────────────────────────────────
   Token store (en memoria — no en localStorage
   para evitar XSS con tokens JWT)
───────────────────────────────────────────── */
let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _isRefreshing = false;
let _failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason: unknown) => void;
}> = [];

export function setTokens(access: string, refresh: string): void {
  _accessToken = access;
  _refreshToken = refresh;
}

export function clearTokens(): void {
  _accessToken = null;
  _refreshToken = null;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

function processQueue(error: unknown, token: string | null = null): void {
  _failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _failedQueue = [];
}

/* ─────────────────────────────────────────────
   Instancia Axios
───────────────────────────────────────────── */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/* ─── Interceptor de request: inyectar Bearer ── */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (_accessToken) {
      config.headers['Authorization'] = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

/* ─── Interceptor de response: refresh en 401 ── */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry || !_refreshToken) {
      return Promise.reject(normalizeAxiosError(error));
    }

    if (_isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        _failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (token) originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    _isRefreshing = true;

    try {
      const { data } = await axios.post<{ data: { access_token: string; refresh_token: string } }>(
        `${API_URL}/auth/refresh`,
        { refresh_token: _refreshToken },
        { timeout: API_TIMEOUT_MS },
      );

      const { access_token, refresh_token } = data.data;
      setTokens(access_token, refresh_token);
      processQueue(null, access_token);

      originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      return Promise.reject(normalizeAxiosError(refreshError as AxiosError));
    } finally {
      _isRefreshing = false;
    }
  },
);

/* ─────────────────────────────────────────────
   Normalización de errores
───────────────────────────────────────────── */
export interface ApiErrorPayload {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(public readonly payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
  }

  get status(): number {
    return this.payload.status;
  }
  get code(): string {
    return this.payload.code;
  }
  get details(): unknown {
    return this.payload.details;
  }

  isNotFound(): boolean {
    return this.payload.status === 404;
  }
  isUnauthorized(): boolean {
    return this.payload.status === 401;
  }
  isConflict(): boolean {
    return this.payload.status === 409;
  }
  isRateLimit(): boolean {
    return this.payload.status === 429;
  }
  isServerError(): boolean {
    return this.payload.status >= 500;
  }
}

function normalizeAxiosError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data as Record<string, unknown> | undefined;

  const errorObj = body?.error as Record<string, unknown> | undefined;
  const message =
    (errorObj?.message as string | undefined) ??
    (body?.message as string | undefined) ??
    error.message ??
    'Error de conexión con el servidor';

  return new ApiError({
    status,
    code: (errorObj?.code as string | undefined) ?? 'NETWORK_ERROR',
    message,
    details: errorObj?.details,
  });
}

/* ─────────────────────────────────────────────
   Helpers tipados
───────────────────────────────────────────── */
export async function apiGet<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(path, config);
  return response.data;
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(path, body, config);
  return response.data;
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<T>(path, body, config);
  return response.data;
}
