/** Envoltura estándar de respuesta exitosa del backend */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/** Envoltura estándar de respuesta de error del backend */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

/** Metadatos de paginación */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Envoltura estándar de respuesta de lista paginada */
export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  timestamp: string;
}
