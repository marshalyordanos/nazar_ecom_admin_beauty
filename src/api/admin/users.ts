import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/libs/api'
import type { QueryParams } from '@/types/common'
import { buildQuery } from './query'
import type { ApiListResponse } from './types'
import { dashboardKeys } from './dashboard'

export type UserAdmin = {
	id: string
	email: string
	firstName?: string | null
	lastName?: string | null
	username?: string | null
	avatar?: string | null
	avatarUrl?: string | null
	phone?: string | null
	status?: string | null
	role?: string | null
	currentPlan?: string | null
	roles?: { name: string }[]
	createdAt?: string
}

export const userAdminKeys = {
	all: ['admin-users'] as const,
	list: (params: QueryParams) => [...userAdminKeys.all, params] as const,
	detail: (id: string) => [...userAdminKeys.all, 'detail', id] as const
}

export function useAdminUsers(params: QueryParams) {
	return useQuery<ApiListResponse<UserAdmin>, Error>({
		queryKey: userAdminKeys.list(params),
		queryFn: async () => (await api.get(`/users${buildQuery(params)}`)).data,
		placeholderData: previousData => previousData,
		staleTime: 1000 * 15
	})
}

export function useUpdateUserRole() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, role }: { id: string; role: string | null }) =>
			(await api.patch(`/users/${id}`, { role })).data,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: userAdminKeys.all })
			qc.invalidateQueries({ queryKey: dashboardKeys.all })
		}
	})
}

