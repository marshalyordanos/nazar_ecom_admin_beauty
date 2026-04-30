import { Pagination } from "./category";

export interface ShopResponse {
    data: Shop[];
    pagination: Pagination;
  }
  
  export interface Shop {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    logoUrl: string;
    instagramUrl?: string | null;
    telegramUrl?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    xUrl?: string | null;
    description: string;
    currency: string;
    timezone: string;
    status: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    locations: Location[];
  }
  
  export interface Location {
    id: string;
    
    shopId: string;
    name: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    country: string;
    postalCode: string | null;
    latitude: number;
    longitude: number;
    phone: string;
    createdAt: string; // ISO date string
  }
  
  export interface ShopSummary {
    totalShops: number;
    activeShops: number;
    locationsCount: number;
  }