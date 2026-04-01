import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import type { QueryParams } from '@/types/common'
import { buildQuery } from './query'
import type { ApiListResponse, RoleAdmin } from './types'

export const roleAdminKeys = {
	all: ['admin-roles'] as const,
	list: (params: QueryParams) => [...roleAdminKeys.all, params] as const,
	detail: (id: string) => [...roleAdminKeys.all, 'detail', id] as const
}

export function useAdminRoles(params: QueryParams) {
	return useQuery<ApiListResponse<RoleAdmin>, Error>({
		queryKey: roleAdminKeys.list(params),
		queryFn: async () => (await api.get(`/roles${buildQuery(params)}`)).data,
		staleTime: 1000 * 30
	})
}

export function useCreateRole() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (payload: { name: string; description?: string }) =>
			(await api.post('/roles', payload)).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: roleAdminKeys.all })
	})
}

export function useUpdateRole() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: { name?: string; description?: string } }) =>
			(await api.patch(`/roles/${id}`, payload)).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: roleAdminKeys.all })
	})
}

export function useDeleteRole() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => (await api.delete(`/roles/${id}`)).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: roleAdminKeys.all })
	})
}

export function useAssignPermissionsToRole() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async ({
			roleId,
			permissions
		}: {
			roleId: string
			permissions: Array<{
				permissionId: string
				createAction?: boolean
				readAction?: boolean
				updateAction?: boolean
				deleteAction?: boolean
			}>
		}) => (await api.post(`/roles/${roleId}/permissions`, { permissions })).data,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: roleAdminKeys.all })
		}
	})
}

export function useRemovePermissionsFromRole() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
			(await api.delete(`/roles/${roleId}/permissions`, { data: { permissionIds } })).data,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: roleAdminKeys.all })
		}
	})
}
