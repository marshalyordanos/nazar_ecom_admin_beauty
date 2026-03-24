import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import type { QueryParams } from '@/types/common'

import { buildQuery } from './query'
import type { ApiListResponse, PaymentAdmin } from './types'

export const paymentKeys = {
  all: ['admin-payments'] as const,
  list: (params: QueryParams) => [...paymentKeys.all, params] as const
}

export function useAdminPayments(params: QueryParams & { orderId?: string }) {
  return useQuery<ApiListResponse<PaymentAdmin>, Error>({
    queryKey: paymentKeys.list(params),
    queryFn: async () => {
      const qs = buildQuery({ ...params, extra: { orderId: params.orderId } })

      
return (await api.get(`/payments${qs}`)).data
    },
    staleTime: 1000 * 30
  })
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  return () => qc.invalidateQueries({ queryKey: paymentKeys.all })
}

export function useCapturePayment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/payments/${id}/capture`)).data,
    onSuccess: invalidate(qc)
  })
}

export function useRefundPayment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/payments/${id}/refund`)).data,
    onSuccess: invalidate(qc)
  })
}
