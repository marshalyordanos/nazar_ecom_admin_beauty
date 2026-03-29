import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import type { QueryParams } from '@/types/common'


export const salesKeys = {
    all: ['sales'] as const,
    list: (params: QueryParams) => [...salesKeys.all, 'list', params] as const,
  }
  
export function useSaleFromShop() {
    const qc = useQueryClient()
  
    return useMutation({
      mutationFn: async (payload: {
        variantId: string
        locationId: string
        quantity: number
      }) => (await api.post('/shops/sales-from-shop', payload)).data,
      onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.all })
    })
  }
  