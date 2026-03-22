import { api } from "@/libs/api"; 
import {  ProductSummary } from '../../types/products';
import { useQuery } from "@tanstack/react-query";

export const getProductSummary = async (shopId: string): Promise<ProductSummary> => {
 
  const response = await api.get(`/dashboard/products/summary?shopId=${shopId}`);
  return response.data;
};

export const useProductSummary = (shopId: string) => {
  return useQuery<ProductSummary, Error>({
    queryKey: ["products", shopId],
    queryFn: () => getProductSummary(shopId),
    staleTime: 1000 * 2, // 1 min cache

  });
};