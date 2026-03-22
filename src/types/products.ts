import { Pagination } from "./pagination";

export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    barcode: string;
    price: number;
    comparePrice: number;
    costPrice: number;
    weight: number;
    status: string;
    image: string;
    media: any[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Product {
    id: string;
    shopId: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    brandId: string;
    categoryId: string;
    isFeatured: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    brand: {
      id: string;
      name: string;
      slug: string;
    };
    category: {
      id: string;
      name: string;
      slug: string;
      image: string;
      track: string;
    };
    variants: ProductVariant[];
  }
  
 
  
  export interface ProductsResponse {
    data: Product[];
    pagination: Pagination;
  }
  
  export interface ProductsQueryParams {
    search?: Record<string, string>; 
    filter?: Record<string, string | string[]>; 
    sort?: Record<string, "asc" | "desc">;
    page?: number;
    pageSize?: number;
    track?: string;
  }


  export type ProductSummary = {
    totalProducts: number;
    active: number;
    draft: number;
    archived: number;
  };