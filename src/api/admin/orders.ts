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
  list: (params: QueryParams) => [...orderKeys.all, 'list', params] as const,
  summary: (params: QueryParams & { shopId?: string }) => [...orderKeys.all, 'summary', params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const
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

export type OrdersAdminSummaryData = {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  paidOrders: number
  processingOrders: number
  shippedOrders: number
  cancelledOrders: number
  refundedOrders: number
  totalRevenue: number
  totalSubtotal: number
  totalDiscounts: number
  totalTax: number
  avgOrderValue: number
  lineItemsCount: number
  estimatedProfit: number
  estimatedMarginPercent: number
}

export function useOrdersAdminSummary(params: QueryParams & { shopId?: string }) {
  return useQuery<{ data: OrdersAdminSummaryData }, Error>({
    queryKey: orderKeys.summary(params),
    queryFn: async () => {
      const qs = buildQuery({ ...params, extra: { shopId: params.shopId } })

      return (await api.get(`/orders/admin/summary${qs}`)).data
    },
    staleTime: 1000 * 15
  })
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id!),
    queryFn: async () => (await api.get(`/orders/admin/${id}`)).data,
    enabled: Boolean(id),
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
