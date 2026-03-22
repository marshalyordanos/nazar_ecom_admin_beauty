import { Pagination } from "./category";

export interface BrandResponse {
    data: Brand[];
    pagination: Pagination;
  }
  
  export interface Brand {
    id: string;
    name: string;
    slug?: string;
    logoUrl?: string;
    description?: string;
    isFeatured?: boolean;
    createdAt?: string; // ISO date string
  }
  
  