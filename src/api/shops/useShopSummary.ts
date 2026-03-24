import { api } from "@/libs/api"; 
import { useQuery } from "@tanstack/react-query";
import { ShopSummary } from "@/types/shop";

export const getShopSummary = async (): Promise<ShopSummary> => {
 
  const response = await api.get(`/dashboard/shops/summary`);
  return response.data;
};

export const useShopSummary = () => {
  return useQuery<ShopSummary, Error>({
    queryKey: ["shops-summary"],
    queryFn: () => getShopSummary(),
    staleTime: 1000 * 2, // 1 min cache
    // enabled: isEnabled, // 👈 important

  });
};