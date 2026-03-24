import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import type { QueryParams } from '@/types/common'

import { buildQuery } from './query'
import type { ApiListResponse, InventoryAdmin, InventoryMovementAdmin } from './types'

export const inventoryKeys = {
  all: ['admin-inventory'] as const,
  list: (params: QueryParams) => [...inventoryKeys.all, 'list', params] as const,
  movements: (params: QueryParams) => [...inventoryKeys.all, 'movements', params] as const
}

export function useAdminInventory(params: QueryParams) {
  return useQuery<ApiListResponse<InventoryAdmin>, Error>({
    queryKey: inventoryKeys.list(params),
    queryFn: async () => (await api.get(`/inventory${buildQuery(params)}`)).data,
    staleTime: 1000 * 30
  })
}

export function useAdminMovements(params: QueryParams) {
  return useQuery<ApiListResponse<InventoryMovementAdmin>, Error>({
    queryKey: inventoryKeys.movements(params),
    queryFn: async () => (await api.get(`/inventory/movements${buildQuery(params)}`)).data,
    staleTime: 1000 * 30
  })
}

export function useAddMovement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      variantId: string
      locationId: string
      type: string
      quantity: number
      referenceId?: string
    }) => (await api.post('/inventory/movements', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.all })
  })
}

export function useUpdateInventory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ variantId, payload }: { variantId: string; payload: Record<string, unknown> }) =>
      (await api.patch(`/inventory/${variantId}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.all })
  })
}
