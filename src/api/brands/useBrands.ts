import { api } from "@/libs/api"; 
import { BrandResponse} from '../../types/brand';
import { QueryParams } from '@/types/common';
import { useQuery } from "@tanstack/react-query";

export const getBrands = async (params: QueryParams): Promise<BrandResponse> => {
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


  if (params.sort) {
    const sortStrings = Object.entries(params.sort).map(([key, val]) => `${key}:${val}`);
    searchParams.push(`sort=${sortStrings.join(",")}`);
  }

  if (params.page) searchParams.push(`page=${params.page}`);
  if (params.pageSize) searchParams.push(`pageSize=${params.pageSize}`);

  const queryString = searchParams.length ? `?${searchParams.join("&")}` : "";

  const response = await api.get(`/brands${queryString}`);
  return response.data;
};

export const useBrands = (params: QueryParams) => {
  return useQuery<BrandResponse, Error>({
    queryKey: ["brands", params],
    queryFn: () => getBrands(params),
    staleTime: 1000 * 60, // 1 min cache
  });
};