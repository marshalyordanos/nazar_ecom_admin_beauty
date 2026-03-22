import { api } from "@/libs/api"; 
import { CategoriesResponse, CategoriesQueryParams } from '@/types/category';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export const getCategories = async (params: CategoriesQueryParams): Promise<CategoriesResponse> => {
  const searchParams: string[] = [];

  if (params.search) {
    const searchStrings = Object.entries(params.search).map(([k, v]) => `${k}:${v}`);
    searchParams.push(`search=${searchStrings.join(',')}`);
  }
  if (params.tree) {
    searchParams.push(`tree=${params.tree}`);
  }

  if (params.filter) {
    const filterStrings = Object.entries(params.filter).map(([k, v]) =>
      Array.isArray(v) ? `${k}:[${v.join('|')}]` : `${k}:${v}`
    );
    searchParams.push(`filter=${filterStrings.join(',')}`);
  }

  if (params.sort) {
    const sortStrings = Object.entries(params.sort).map(([k, v]) => `${k}:${v}`);
    searchParams.push(`sort=${sortStrings.join(',')}`);
  }

  if (params.page) searchParams.push(`page=${params.page}`);
  if (params.pageSize) searchParams.push(`pageSize=${params.pageSize}`);

  const queryString = searchParams.length ? `?${searchParams.join('&')}` : '';
  const response = await api.get(`/categories${queryString}`);
  return response.data;
};


export const useCategories = (params: CategoriesQueryParams) => {
    return useQuery<CategoriesResponse|any, Error>({
      queryKey: ["categories", params],
      queryFn: () => getCategories(params),
      staleTime: 1000 * 60, // 1 min cache
    });
  };