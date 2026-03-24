import { api } from "@/libs/api"; 
import { QueryParams } from '@/types/common';
import { useQuery } from "@tanstack/react-query";
import { ProductOption } from "@/types/option";

export const getOptions = async (): Promise<ProductOption[]> => {
  const searchParams: string[] = [];


  const queryString = searchParams.length ? `?${searchParams.join("&")}` : "";

  const response = await api.get(`/products/options`);
  return response.data;
};

export const useOptions = () => {
  return useQuery<ProductOption[], Error>({
    queryKey: ["options"],
    queryFn: () => getOptions(),
    staleTime: 1000 * 2, // 1 min cache
  });
};