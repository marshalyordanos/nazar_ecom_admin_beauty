export interface Category {
  id: string
  name: string
  slug?: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  createdAt?: string
  track?: string | null
  parent?: {
    id: string
    name: string
    slug: string
  } | null
  children?: Pick<Category, 'id' | 'name' | 'slug'>[]
}

/** Response shape from GET /categories?tree=true */
export interface CategoryTreeNode {
  id: string
  parentId: string | null
  name: string
  slug: string
  description: string | null
  image: string | null
  track: string
  totalSalesAmount: number
  totalProductsSold: number
  totalProducts: number
  children?: CategoryTreeNode[]
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