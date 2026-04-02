import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import { getApiErrorMessage } from '@/libs/toastUtils'
import { toast } from 'react-toastify'
import type { QueryParams } from '@/types/common'

import { buildQuery } from './query'
import type { ApiListResponse, ShipmentAdmin } from './types'

export const shipmentKeys = {
  all: ['admin-shipments'] as const,
  list: (params: QueryParams) => [...shipmentKeys.all, params] as const
}

export function useAdminShipments(params: QueryParams & { orderId?: string }) {
  return useQuery<ApiListResponse<ShipmentAdmin>, Error>({
    queryKey: shipmentKeys.list(params),
    queryFn: async () => {
      const qs = buildQuery({ ...params, extra: { orderId: params.orderId } })

      
return (await api.get(`/shipments${qs}`)).data
    },
    staleTime: 1000 * 30
  })
}

export function useTrackShipment() {
  return useMutation({
    mutationFn: async (id: string) => (await api.get(`/shipments/${id}/track`)).data,
    onSuccess: () => toast.success('Shipment tracking updated successfully'),
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to track shipment'))
  })
}

export function useUpdateShipment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      (await api.post(`/shipments/${id}/update-status`, payload)).data,
    onSuccess: () => {
      toast.success('Shipment status updated successfully')
      qc.invalidateQueries({ queryKey: shipmentKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to update shipment status'))
  })
}
