export interface QueryParams {
    search?: Record<string, string>; 
    filter?: Record<string, string | string[]>; 
    sort?: Record<string, "asc" | "desc">;
    page?: number;
    pageSize?: number;
    track?: string;
  }