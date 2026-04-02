import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/libs/toastUtils'
import type { QueryParams } from '@/types/common'

import { buildQuery } from './query'
import type { ApiListResponse, ReviewAdmin } from './types'

export const reviewKeys = {
  all: ['admin-reviews'] as const,
  list: (params: QueryParams) => [...reviewKeys.all, params] as const
}

export function useAdminReviews(params: QueryParams & { productId?: string }) {
  return useQuery<ApiListResponse<ReviewAdmin>, Error>({
    queryKey: reviewKeys.list(params),
    queryFn: async () => {
      const productId = params.productId || ''
      const response = await api.get(`/reviews${buildQuery({ ...params, extra: { productId } })}`)

      
return response.data
    },
    staleTime: 1000 * 30
  })
}

export function useUpdateReview() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: string
      payload: { rating?: number; title?: string; comment?: string; status?: 'PENDING' | 'APPROVED' | 'REJECTED' }
    }) => (await api.put(`/reviews/${id}`, payload)).data,
    onSuccess: () => {
      toast.success('Review updated successfully')
      qc.invalidateQueries({ queryKey: reviewKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to update review'))
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/reviews/${id}`)).data,
    onSuccess: () => {
      toast.success('Review deleted successfully')
      qc.invalidateQueries({ queryKey: reviewKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete review'))
  })
}
