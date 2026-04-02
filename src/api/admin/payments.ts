import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import { getApiErrorMessage } from '@/libs/toastUtils'
import type { QueryParams } from '@/types/common'
import { toast } from 'react-toastify'

import { buildQuery } from './query'
import type { ApiListResponse, PaymentAdmin } from './types'
import { dashboardKeys } from './dashboard'

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
  return () => {
    qc.invalidateQueries({ queryKey: paymentKeys.all })
    qc.invalidateQueries({ queryKey: dashboardKeys.all })
  }
}

export function useCapturePayment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/payments/${id}/capture`)).data,
    onSuccess: () => {
      toast.success('Payment captured successfully')
      invalidate(qc)()
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to capture payment'))
  })
}

export function useRefundPayment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.post(`/payments/${id}/refund`)).data,
    onSuccess: () => {
      toast.success('Payment refunded successfully')
      invalidate(qc)()
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to refund payment'))
  })
}
