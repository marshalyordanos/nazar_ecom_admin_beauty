import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/libs/toastUtils'
import type { QueryParams } from '@/types/common'


export const salesKeys = {
    all: ['sales'] as const,
    list: (params: QueryParams) => [...salesKeys.all, 'list', params] as const,
  }
  
export function useSaleFromShop() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      locationId: string
      items: { variantId: string; quantity: number }[]
    }) => (await api.post('/shops/sales-from-shop', payload)).data,
    onSuccess: () => {
      toast.success('Sale recorded successfully')
      qc.invalidateQueries({ queryKey: salesKeys.all })
      qc.invalidateQueries({ queryKey: ['product-variations'] })
      qc.invalidateQueries({ queryKey: ['shops'] })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to record sale'))
  })
}
  