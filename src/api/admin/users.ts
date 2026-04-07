import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/libs/api'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/libs/toastUtils'
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
	roles?: { id: string; name: string }[]
	locationId?: string | null
	location?: { id: string; name: string; shopId: string } | null
	createdAt?: string
	updatedAt?: string
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

export function useRegisterUsers() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (payload: Record<string, unknown>) => (await api.post('/auth/register', payload)).data,
		onSuccess: () => {
			toast.success('User registered successfully')
			qc.invalidateQueries({ queryKey: userAdminKeys.all })
			qc.invalidateQueries({ queryKey: dashboardKeys.all })
		},
		onError: error => toast.error(getApiErrorMessage(error, 'Failed to register user'))
	})
}

export function addUser() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (payload: Record<string, unknown>) => (await api.post('/users', payload)).data,
		onSuccess: () => {
			toast.success('User added successfully')
			qc.invalidateQueries({ queryKey: userAdminKeys.all })
			qc.invalidateQueries({ queryKey: dashboardKeys.all })
		},
		onError: error => toast.error(getApiErrorMessage(error, 'Failed to add user'))
	})
}

export function useUpdateUserProfile() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async ({
			id,
			data
		}: {
			id: string
			data: { firstName?: string; lastName?: string; email?: string; phone?: string }
		}) => (await api.patch(`/users/${id}`, data)).data,
		onSuccess: () => {
			toast.success('User profile updated successfully')
			qc.invalidateQueries({ queryKey: userAdminKeys.all })
			qc.invalidateQueries({ queryKey: dashboardKeys.all })
		},
		onError: error => toast.error(getApiErrorMessage(error, 'Failed to update user profile'))
	})
}

export function useActivateUser() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => (await api.patch(`/users/${id}`, { status: 'ACTIVE' })).data,
		onSuccess: () => {
			toast.success('User activated successfully')
			qc.invalidateQueries({ queryKey: userAdminKeys.all })
			qc.invalidateQueries({ queryKey: dashboardKeys.all })
		},
		onError: error => toast.error(getApiErrorMessage(error, 'Failed to activate user'))
	})
}
export function useDeactivateUser() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => (await api.delete(`/users/${id}`)).data,
		onSuccess: () => {
			toast.success('User deactivated successfully')
			qc.invalidateQueries({ queryKey: userAdminKeys.all })
			qc.invalidateQueries({ queryKey: dashboardKeys.all })
		},
		onError: error => toast.error(getApiErrorMessage(error, 'Failed to deactivate user'))
	})
}



export function useUpdateUserRole() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, userId }: { id: string; userId: string }) =>
			(await api.post(`/roles/${id}/assign`, { userId })).data,
		onSuccess: () => {
			toast.success('User role updated successfully')
			qc.invalidateQueries({ queryKey: userAdminKeys.all })
			qc.invalidateQueries({ queryKey: dashboardKeys.all })
		},
		onError: error => toast.error(getApiErrorMessage(error, 'Failed to update user role'))
	})
}

export function useUpdateUserLocation() {
	const qc = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, locationId }: { id: string; locationId: string | null }) =>
			(await api.patch(`/users/${id}`, { locationId })).data,
		onSuccess: () => {
			toast.success('Location updated successfully')
			qc.invalidateQueries({ queryKey: userAdminKeys.all })
			qc.invalidateQueries({ queryKey: dashboardKeys.all })
		},
		onError: error => toast.error(getApiErrorMessage(error, 'Failed to update location'))
	})
}

