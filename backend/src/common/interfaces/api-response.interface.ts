export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  pagination: PaginationMeta;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  code: string;
  timestamp: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
