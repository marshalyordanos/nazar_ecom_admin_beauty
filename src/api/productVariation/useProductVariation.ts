

import { api } from "@/libs/api"; 
import {  ProductVariant } from '../../types/products';
import { useQuery } from "@tanstack/react-query";

export const getProductVariationById = async (variantId: string): Promise<ProductVariant> => {
 
  const response = await api.get(`/products/variants/${variantId}`);
  return response.data;
};

export const useProductVariation = (variantId: string) => {
  return useQuery<ProductVariant, Error>({
    queryKey: ["product-variants-summary", variantId],
    queryFn: () =>  getProductVariationById(variantId),
    staleTime: 1000 * 2, // 1 min cache

  });
};