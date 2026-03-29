

import { api } from "@/libs/api"; 
import {  ProductsResponse, ProductVariant, ProductVariationsResponse } from '../../types/products';
import { useQuery } from "@tanstack/react-query";
import { QueryParams } from "@/types/common";

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

export const getProductVariations = async (params: QueryParams): Promise<ProductVariationsResponse> => {
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

  const response = await api.get(`/products/variants${queryString}`);
  return response.data;
};

export const useProductVariations = (params: QueryParams) => {
  return useQuery<ProductVariationsResponse, Error>({
    queryKey: ["product-variations", params],
    queryFn: () => getProductVariations(params),
    staleTime: 1000 * 2, // 1 min cache
  });
};