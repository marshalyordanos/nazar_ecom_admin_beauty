import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/libs/toastUtils'
import type { QueryParams } from '@/types/common'
import type { ApiListResponse } from '@/api/admin/types'
import { buildQuery } from '@/api/admin/query'

export type SaleFromShopRow = {
  id: string
  locationId: string
  variantId: string
  quantity: number
  price: number
  total: number
  createdAt: string
  updatedAt: string
  variant: {
    id: string
    sku: string
    price: number
    product: { id: string; name: string }
  }
  location: {
    id: string
    name: string
    shop: { id: string; name: string }
  }
}

export type SalesFromShopStats = {
  totalRecords: number
  totalRevenue: number
  totalQuantity: number
  revenueThisMonth: number
}

export type SalesFromShopListParams = QueryParams & {
  shopId?: string
  locationId?: string
}

export const salesKeys = {
  all: ['sales'] as const,
  list: (params: SalesFromShopListParams) => [...salesKeys.all, 'list', params] as const,
  stats: () => [...salesKeys.all, 'stats'] as const
}

function invalidateSalesRelated(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: salesKeys.all })
  qc.invalidateQueries({ queryKey: ['product-variations'] })
  qc.invalidateQueries({ queryKey: ['shops'] })
}

export function useSalesFromShopList(params: SalesFromShopListParams) {
  const { shopId, locationId, ...queryParams } = params

  return useQuery<ApiListResponse<SaleFromShopRow>, Error>({
    queryKey: salesKeys.list(params),
    queryFn: async () =>
      (
        await api.get(
          `/shops/sales-from-shop${buildQuery({
            ...queryParams,
            extra: {
              ...(shopId ? { shopId } : {}),
              ...(locationId ? { locationId } : {})
            }
          })}`
        )
      ).data,
    staleTime: 1000 * 30
  })
}

export function useSalesFromShopStats() {
  return useQuery<SalesFromShopStats, Error>({
    queryKey: salesKeys.stats(),
    queryFn: async () => (await api.get('/shops/sales-from-shop/stats')).data,
    staleTime: 1000 * 60
  })
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
      invalidateSalesRelated(qc)
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to record sale'))
  })
}

export function useUpdateSaleFromShop() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: string
      payload: { quantity?: number; price?: number }
    }) => (await api.patch(`/shops/sales-from-shop/${id}`, payload)).data,
    onSuccess: () => {
      toast.success('Sale updated successfully')
      invalidateSalesRelated(qc)
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to update sale'))
  })
}

export function useDeleteSaleFromShop() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/shops/sales-from-shop/${id}`)).data,
    onSuccess: () => {
      toast.success('Sale deleted successfully')
      invalidateSalesRelated(qc)
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete sale'))
  })
}
