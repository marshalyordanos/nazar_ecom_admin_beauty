export interface Category {
    id: string;
    name: string;
    slug?: string;
    description?: string | null;
    image?: string;
    parentId?: string | null;
    createdAt?: string;
    track?: string;
    parent?: {
      id: string;
      name: string;
      slug: string;
    };
    children?: Category[];
  }
  
  export interface Pagination {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  export interface CategoriesResponse {
    data: Category[];
    pagination: Pagination;
  }


  
  export interface CategoriesQueryParams {
    search?: Record<string, string>;
    filter?: Record<string, string | string[]>;
    sort?: Record<string, 'asc' | 'desc'>;
    page?: number;
    pageSize?: number;
    tree?: boolean;
  }