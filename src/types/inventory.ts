import { Pagination } from "./pagination";

export interface Product {
    name: string;
    slug: string;
  }
  
  export interface Variant {
    id: string;
    productId: string;
    sku: string;
    barcode: string | null;
    price: number;
    comparePrice: number;
    costPrice: number;
    weight: number | null;
    status: "ACTIVE" | "ARCHIVED";
    image: string;
    createdAt: string;
    updatedAt: string;
    product?: Product; // only in list response
  }
  
  export interface Location {
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
  }

  export interface InventoryItem {
    id: string;
    variantId: string;
    locationId: string;
    quantity: number;
    reservedQuantity: number;
    reorderLevel: number | null;
    createdAt: string;
    updatedAt: string;
    variant: Variant;
    location: Location;
  }

  export interface InventoryListResponse {
    data: InventoryItem[];
    pagination: Pagination;
  }

  export interface InventoryMovement {
    id: string;
    variantId: string;
    locationId: string;
    inventoryId: string;
    type: "PURCHASE" | "SALE" | "ADJUSTMENT"; // extend if needed
    quantity: number;
    referenceId: string | null;
    createdAt: string;
    updatedAt: string;
  }

  export interface InventoryDetail {
    id: string;
    variantId: string;
    locationId: string;
    quantity: number;
    reservedQuantity: number;
    reorderLevel: number | null;
    createdAt: string;
    updatedAt: string;
    variant: Omit<Variant, "product">; // no product in detail
    location: Location;
    movements: InventoryMovement[];
  }

  export interface InventoryDetailResponse {
    data: InventoryDetail;
  }