import { api } from "@/libs/api"; 
import {  ProductVariantsSummary } from '../../types/products';
import { useQuery } from "@tanstack/react-query";

export const getProductVariationSummary = async (shopId: string): Promise<ProductVariantsSummary> => {
 
  const response = await api.get(`/dashboard/products/variants/summary?shopId=${shopId}`);
  return response.data;
};

export const useProductVariationSummary = (shopId: string) => {
  return useQuery<ProductVariantsSummary, Error>({
    queryKey: ["product-variants-summary", shopId],
    queryFn: () => getProductVariationSummary(shopId),
    staleTime: 1000 * 2, // 1 min cache

  });
};
