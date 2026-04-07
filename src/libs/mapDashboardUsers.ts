import type { UsersType } from '@/types/apps/userTypes'

type ApiUserRow = {
  id: string
  email: string
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  status: string
  roles?: { id: string; name: string }[]
}

const roleMap: Record<string, UsersType['role']> = {
  admin: 'admin',
  user: 'subscriber',
  author: 'author',
  editor: 'editor',
  maintainer: 'maintainer'
}

const statusMap: Record<string, UsersType['status']> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'inactive'
}

export function mapApiUsersToDashboardTable(users: ApiUserRow[]): UsersType[] {
  return users.map((u, idx) => {
    const roleName = (u.roles?.[0]?.name ?? 'user').toLowerCase()
    const role = (roleMap[roleName] ?? 'subscriber') as UsersType['role']
    const st = statusMap[u.status] ?? 'pending'
    const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
    return {
      id: idx + 1,
      fullName,
      username: u.email,
      email: u.email,
      role,
      status: st,
      avatar: u.avatarUrl ?? '',
      company: '—',
      country: '—',
      contact: u.phone ?? '—',
      currentPlan: 'basic'
    }
  })
}
