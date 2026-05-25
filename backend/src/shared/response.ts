export interface ResponseMeta {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  cursor?: number;
}

export const ok = <T>(data: T, meta?: ResponseMeta) =>
  meta !== undefined ? { data, meta } : { data };

export const err = (message: string) => ({ data: null, error: message });
