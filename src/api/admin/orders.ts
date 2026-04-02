import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import { getApiErrorMessage } from '@/libs/toastUtils'
import type { QueryParams } from '@/types/common'
import { toast } from 'react-toastify'

import { buildQuery } from './query'
import type { ApiListResponse, OrderAdmin } from './types'
import { dashboardKeys } from './dashboard'

export const orderKeys = {
  all: ['admin-orders'] as const,
  list: (params: QueryParams) => [...orderKeys.all, params] as const
}

export function useAdminOrders(params: QueryParams & { shopId?: string }) {
  return useQuery<ApiListResponse<OrderAdmin>, Error>({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const qs = buildQuery({ ...params, extra: { shopId: params.shopId } })
      const response = await api.get(`/orders/admin/list${qs}`)

      
return response.data
    },
    staleTime: 1000 * 30
  })
}

export function useCompleteOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/orders/${id}/complete`)).data,
    onSuccess: () => {
      toast.success('Order completed successfully')
      qc.invalidateQueries({ queryKey: orderKeys.all })
      qc.invalidateQueries({ queryKey: dashboardKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to complete order'))
  })
}

export function useCancleOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/orders/${id}/cancel`)).data,
    onSuccess: () => {
      toast.success('Order cancelled successfully')
      qc.invalidateQueries({ queryKey: orderKeys.all })
      qc.invalidateQueries({ queryKey: dashboardKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to cancel order'))
  })
}


export function useCreateAdminOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/orders/admin/create', payload)).data,
    onSuccess: () => {
      toast.success('Order created successfully')
      qc.invalidateQueries({ queryKey: orderKeys.all })
      qc.invalidateQueries({ queryKey: dashboardKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to create order'))
  })
}
