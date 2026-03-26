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
    product: Product;
  inventories: {
    id: string;
    variantId: string;
    locationId: string;
    quantity: number;
    reservedQuantity: number;
    reorderLevel: number | null;
    createdAt: string;
    updatedAt: string;
    location: {
      id: string;
      shopId: string;
      name: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      latitude: number;
      longitude: number;
      phone: string;
      createdAt: string;
    };
  }[];

  variantOptionValues: {
    id: string;
    variantId: string;
    optionValueId: string;
    optionValue: {
      id: string;
      value: string;
      optionId: string;
      createdAt: string;
      option: {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
      };
    };
  }[];
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

  export type ProductVariantsSummary = {
    totalVariants: number;
    activeVariants: number;
    pricing: {
      minPrice: number;
      maxPrice: number;
      avgPrice: number;
      avgComparePrice: number;
      avgCostPrice: number;
      avgWeight: number;
    };
  };