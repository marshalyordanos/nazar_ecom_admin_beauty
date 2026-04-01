import { useQuery } from '@tanstack/react-query'
import { api } from '@/libs/api'
import type { QueryParams } from '@/types/common'
import { buildQuery } from './query'
import type { ApiListResponse, PermissionAdmin } from './types'

export const permissionAdminKeys = {
	all: ['admin-permissions'] as const,
	list: (params: QueryParams) => [...permissionAdminKeys.all, params] as const
}

export function useAdminPermissions(params: QueryParams) {
	return useQuery<ApiListResponse<PermissionAdmin>, Error>({
		queryKey: permissionAdminKeys.list(params),
		queryFn: async () => (await api.get(`/permissions${buildQuery(params)}`)).data,
		staleTime: 1000 * 60
	})
}

