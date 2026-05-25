export interface ApiError {
  error: string;
}

export interface PaginatedResponse<T> {
  annotations: T[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface CursorResponse<T> {
  entries: T[];
  cursor: number;
}
