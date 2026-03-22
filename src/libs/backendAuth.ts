'use client'

export type AuthUser = {
  id?: string
  email?: string
  firstName?: string
  lastName?: string
  roles?: string[]
  isSuperAdmin?: boolean
}

const ACCESS_TOKEN_COOKIE = 'accessToken'
const REFRESH_TOKEN_COOKIE = 'refreshToken'
const USER_STORAGE_KEY = 'authUser'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) return null

  const segments = document.cookie.split(';')
  const prefix = `${name}=`

  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed.startsWith(prefix)) continue
    const raw = trimmed.slice(prefix.length)
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  return null
}

function setCookie(name: string, value: string, maxAgeSeconds?: number) {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax`

  if (typeof maxAgeSeconds === 'number') cookie += `; max-age=${maxAgeSeconds}`
  if (isSecure) cookie += '; secure'
  document.cookie = cookie
}

function clearCookie(name: string) {
  // Max-Age=0 deletes the cookie.
  document.cookie = `${name}=; path=/; samesite=lax; max-age=0`
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)

  return window.atob(base64 + padding)
}

export function decodeAccessToken(accessToken: string): { email?: string; userId?: string; exp?: number } | null {
  try {
    const parts = accessToken.split('.')

    if (parts.length < 2) {
      return null
    }

    const payloadJson = base64UrlDecode(parts[1])
    const payload = JSON.parse(payloadJson) as { email?: string; userId?: string; exp?: number }

    return payload
  } catch {
    return null
  }
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(USER_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as AuthUser

    return parsed
  } catch {
    return null
  }
}

export function setStoredAuthUser(user: AuthUser) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredAuthUser() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(USER_STORAGE_KEY)
}

export function getAccessTokenFromCookies(): string | null {
  return getCookie(ACCESS_TOKEN_COOKIE)
}

export function getRefreshTokenFromCookies(): string | null {
  return getCookie(REFRESH_TOKEN_COOKIE)
}

export function clearAuthCookies() {
  clearCookie(ACCESS_TOKEN_COOKIE)
  clearCookie(REFRESH_TOKEN_COOKIE)
  clearStoredAuthUser()
}

export async function loginWithBackend(email: string, password: string): Promise<AuthUser> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL

  if (!apiBase) throw new Error('NEXT_PUBLIC_API_URL is not set')

  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailPhone: email, password })
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message || data?.error || 'Login failed'

    throw new Error(typeof message === 'string' ? message : 'Login failed')
  }

  const accessToken = data.accessToken as string | undefined
  const refreshToken = data.refreshToken as string | undefined
  const user = data.user as AuthUser | undefined

  if (!accessToken || !refreshToken || !user) throw new Error('Invalid login response')

  const expiresIn = typeof data.expiresIn === 'number' ? data.expiresIn : undefined

  persistAuthTokens(accessToken, refreshToken, expiresIn)
  setStoredAuthUser(user)

  return user
}

/** Call after login or token refresh so axios and guards see new cookies. */
export function persistAuthTokens(
  accessToken: string,
  refreshToken: string,
  expiresInSeconds?: number
) {
  const decoded = decodeAccessToken(accessToken)
  const nowSeconds = Math.floor(Date.now() / 1000)

  // Never use max-age=0 — it deletes the cookie immediately in the browser.
  let accessMaxAgeSeconds: number | undefined
  if (typeof decoded?.exp === 'number') {
    const ttl = decoded.exp - nowSeconds
    if (ttl > 0) accessMaxAgeSeconds = ttl
  }
  if (accessMaxAgeSeconds === undefined && typeof expiresInSeconds === 'number' && expiresInSeconds > 0) {
    accessMaxAgeSeconds = expiresInSeconds
  }

  // Refresh token lifetime in backend defaults to 60 days.
  const refreshMaxAgeSeconds = 60 * 24 * 60 * 60

  setCookie(ACCESS_TOKEN_COOKIE, accessToken, accessMaxAgeSeconds)
  setCookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshMaxAgeSeconds)
}

export async function logoutWithBackend() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  const refreshToken = getRefreshTokenFromCookies()

  try {
    if (apiBase && refreshToken) {
      await fetch(`${apiBase}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })
    }
  } catch {
    // Ignore logout request failures; we still clear local auth state.
  } finally {
    clearAuthCookies()
  }
}

