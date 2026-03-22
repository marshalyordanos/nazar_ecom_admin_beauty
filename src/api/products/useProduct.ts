import { api } from "@/libs/api"; 
import { ProductsResponse, ProductsQueryParams, Product } from '../../types/products';
import { useQuery } from "@tanstack/react-query";

export const getProduct = async (id:string): Promise<Product> => {
 
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const useProduct = (id:string,isEnabled: boolean) => {
  return useQuery<Product, Error>({
    queryKey: ["products", id],
    queryFn: () => getProduct(id),
    staleTime: 1000 * 2, // 1 min cache
    enabled: isEnabled, // 👈 important

  });
};