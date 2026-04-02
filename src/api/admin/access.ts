import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/api'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/libs/toastUtils'
import type { QueryParams } from '@/types/common'

import { buildQuery } from './query'
import type { ApiListResponse, PermissionAdmin, RoleAdmin } from './types'

export const accessKeys = {
  rolesAll: ['admin-roles'] as const,
  rolesList: (params: QueryParams) => [...accessKeys.rolesAll, params] as const,
  permissionsAll: ['admin-permissions'] as const,
  permissionsList: (params: QueryParams) => [...accessKeys.permissionsAll, params] as const
}

export function useAdminRoles(params: QueryParams) {
  return useQuery<ApiListResponse<RoleAdmin>, Error>({
    queryKey: accessKeys.rolesList(params),
    queryFn: async () => (await api.get(`/roles${buildQuery(params)}`)).data,
    staleTime: 1000 * 30
  })
}

export function useAdminPermissions(params: QueryParams) {
  return useQuery<ApiListResponse<PermissionAdmin>, Error>({
    queryKey: accessKeys.permissionsList(params),
    queryFn: async () => (await api.get(`/permissions${buildQuery(params)}`)).data,
    staleTime: 1000 * 30
  })
}

export function useRoleMutations() {
  const qc = useQueryClient()

  return {
    createRole: useMutation({
      mutationFn: async (payload: { name: string; description?: string }) => (await api.post('/roles', payload)).data,
			onSuccess: () => {
				toast.success('Role created successfully')
				qc.invalidateQueries({ queryKey: accessKeys.rolesAll })
			},
			onError: error => toast.error(getApiErrorMessage(error, 'Failed to create role'))
    }),
    updateRole: useMutation({
      mutationFn: async ({ id, payload }: { id: string; payload: { name?: string; description?: string } }) =>
        (await api.patch(`/roles/${id}`, payload)).data,
			onSuccess: () => {
				toast.success('Role updated successfully')
				qc.invalidateQueries({ queryKey: accessKeys.rolesAll })
			},
			onError: error => toast.error(getApiErrorMessage(error, 'Failed to update role'))
    }),
    deleteRole: useMutation({
      mutationFn: async (id: string) => (await api.delete(`/roles/${id}`)).data,
			onSuccess: () => {
				toast.success('Role deleted successfully')
				qc.invalidateQueries({ queryKey: accessKeys.rolesAll })
			},
			onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete role'))
    }),
    assignPermissions: useMutation({
      mutationFn: async ({
        id,
        permissions
      }: {
        id: string
        permissions: Array<{
          permissionId: string
          createAction?: boolean
          readAction?: boolean
          updateAction?: boolean
          deleteAction?: boolean
        }>
      }) => (await api.post(`/roles/${id}/permissions`, { permissions })).data,
			onSuccess: () => {
				toast.success('Permissions assigned successfully')
				qc.invalidateQueries({ queryKey: accessKeys.rolesAll })
			},
			onError: error => toast.error(getApiErrorMessage(error, 'Failed to assign permissions'))
    })
  }
}

export function usePermissionMutations() {
  const qc = useQueryClient()

  return {
    createPermission: useMutation({
      mutationFn: async (payload: { resource: string; description?: string }) =>
        (await api.post('/permissions', payload)).data,
			onSuccess: () => {
				toast.success('Permission created successfully')
				qc.invalidateQueries({ queryKey: accessKeys.permissionsAll })
			},
			onError: error => toast.error(getApiErrorMessage(error, 'Failed to create permission'))
    }),
    updatePermission: useMutation({
      mutationFn: async ({ id, payload }: { id: string; payload: { resource?: string; description?: string } }) =>
        (await api.patch(`/permissions/${id}`, payload)).data,
			onSuccess: () => {
				toast.success('Permission updated successfully')
				qc.invalidateQueries({ queryKey: accessKeys.permissionsAll })
			},
			onError: error => toast.error(getApiErrorMessage(error, 'Failed to update permission'))
    }),
    deletePermission: useMutation({
      mutationFn: async (id: string) => (await api.delete(`/permissions/${id}`)).data,
			onSuccess: () => {
				toast.success('Permission deleted successfully')
				qc.invalidateQueries({ queryKey: accessKeys.permissionsAll })
			},
			onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete permission'))
    })
  }
}
