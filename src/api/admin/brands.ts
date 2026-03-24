import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import type { QueryParams } from '@/types/common'
import type { Brand } from '@/types/brand'

import { buildQuery } from './query'
import type { ApiListResponse } from './types'

export const brandAdminKeys = {
  all: ['admin-brands'] as const,
  list: (params: QueryParams) => [...brandAdminKeys.all, params] as const
}

export function useAdminBrands(params: QueryParams) {
  return useQuery<ApiListResponse<Brand>, Error>({
    queryKey: brandAdminKeys.list(params),
    queryFn: async () => (await api.get(`/brands${buildQuery(params)}`)).data,
    staleTime: 1000 * 30
  })
}

export function useCreateBrand() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) =>
      (await api.post('/brands', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: brandAdminKeys.all })
  })
}

export function useUpdateBrand() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) =>
      (await api.patch(`/brands/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: brandAdminKeys.all })
  })
}

export function useDeleteBrand() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/brands/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: brandAdminKeys.all })
  })
}
