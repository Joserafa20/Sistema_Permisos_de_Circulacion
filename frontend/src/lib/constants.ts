export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const SYSTEM_NAME = 'Sistema de Permisos de Circulación';

export const SYSTEM_SHORT_NAME = 'Pico y Placa';

/** Tiempo máximo de carga de documentos (10 MB — RN-53) */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Tipos MIME aceptados para documentos adjuntos */
export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
} as const;

/** Número máximo de documentos por solicitud */
export const MAX_DOCUMENTS = 5;

/** TTL del caché de TanStack Query para datos estáticos (motivos, config) */
export const STATIC_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutos

/** TTL del caché para datos dinámicos (estado solicitud) */
export const DYNAMIC_STALE_TIME_MS = 30 * 1000; // 30 segundos

/** Timeout del cliente Axios */
export const API_TIMEOUT_MS = 30_000;

/** Rutas del portal ciudadano */
export const ROUTES = {
  home: '/',
  solicitud: '/solicitud',
  estado: '/estado',
  verificar: '/verificar',
  contacto: '/contacto',
  ayuda: '/ayuda',
} as const;
