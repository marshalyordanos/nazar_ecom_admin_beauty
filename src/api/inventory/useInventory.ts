import { api } from "@/libs/api"; 
import { ProductsResponse, ProductsQueryParams } from '../../types/products';
import { useQuery } from "@tanstack/react-query";
import { InventoryDetailResponse, InventoryListResponse } from "@/types/inventory";
import { QueryParams } from "@/types/common";

export const getInventory = async (params: QueryParams): Promise<InventoryListResponse> => {
  const searchParams: string[] = [];

  if (params.search) {
    const searchStrings = Object.entries(params.search).map(([key, val]) => `${key}:${val}`);
    searchParams.push(`search=${searchStrings.join(",")}`);
  }

  if (params.filter) {
    const filterStrings = Object.entries(params.filter)
      .filter(([_, val]) => !(Array.isArray(val) ? val.length === 0 : val === "")) // skip empty arrays or empty strings
      .map(([key, val]) =>
        Array.isArray(val) ? `${key}:[${val.join("|")}]` : `${key}:${val}`
      );
    if (filterStrings.length > 0) {
      searchParams.push(`filter=${filterStrings.join(",")}`);
    }
  }


  if (params.track) {
    searchParams.push(`track=${params.track}`);
  }

  if (params.sort) {
    const sortStrings = Object.entries(params.sort).map(([key, val]) => `${key}:${val}`);
    searchParams.push(`sort=${sortStrings.join(",")}`);
  }

  if (params.page) searchParams.push(`page=${params.page}`);
  if (params.pageSize) searchParams.push(`pageSize=${params.pageSize}`);

  const queryString = searchParams.length ? `?${searchParams.join("&")}` : "";

  const response = await api.get(`/inventory${queryString}`);
  return response.data;
};

export const useInventory = (params: QueryParams) => {
  return useQuery<InventoryListResponse, Error>({
    queryKey: ["inventory", params],
    queryFn: () => getInventory(params),
    staleTime: 1000 * 2, // 1 min cache
  });
};

export const getInventoryDetail = async (id: string): Promise<InventoryDetailResponse> => {
  const response = await api.get(`/inventory/${id}`);
  return response.data;
};

export const useInventoryDetail = (id: string) => {
  return useQuery<InventoryDetailResponse, Error>({
    queryKey: ["inventory", id],
    queryFn: () => getInventoryDetail(id),
    staleTime: 1000 * 2, // 1 min cache
  });
};