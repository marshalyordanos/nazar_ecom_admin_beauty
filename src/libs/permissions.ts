import type { AuthUser } from '@/libs/backendAuth'
import { getStoredAuthUser } from '@/libs/backendAuth'

export type PermissionAction = 'create' | 'read' | 'update' | 'delete'

export function can(
  resource: string,
  action: PermissionAction,
  user?: AuthUser | null
): boolean {
  const u = user !== undefined ? user : getStoredAuthUser()
  if (!u) return false
  if (u.isSuperAdmin) return true
  const row = u.permissions?.find(p => p.resource === resource)
  if (!row) return false
  return Boolean(row[action])
}
