import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import type { QueryParams } from '@/types/common'
import type { Brand } from '@/types/brand'

import type { ApiListResponse, PermissionAdmin } from '../admin/types'
import { buildQuery } from '../admin/query'

export const permissionsKeys = {
  all: ['permissions'] as const,
  list: (params: QueryParams) => [...permissionsKeys.all, params] as const
}

export function useGetAllPermissions(params: QueryParams) {
  return useQuery<ApiListResponse<PermissionAdmin>, Error>({
    queryKey: permissionsKeys.list(params),
    queryFn: async () => (await api.get(`/permissions${buildQuery(params)}`)).data,
    staleTime: 1000 * 30
  })
}