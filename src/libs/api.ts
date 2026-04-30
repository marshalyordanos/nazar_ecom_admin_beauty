import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  persistAuthTokens,
  setStoredAuthUser,
  type AuthUser
} from '@/libs/backendAuth'

const baseURL = process.env.NEXT_PUBLIC_API_URL

export function getSocketBaseUrl(): string {
  return String(baseURL || '').replace(/\/api\/v1\/?$/, '')
}

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshInFlight: Promise<string> | null = null

function getLoginPath() {
  if (typeof window === 'undefined') return '/en/login'

  const seg = window.location.pathname.split('/').filter(Boolean)[0]

  return seg ? `/${seg}/login` : '/en/login'
}

async function doRefresh(): Promise<string> {
  const rt = getRefreshTokenFromCookies()

  if (!rt || !baseURL) {
    throw new Error('No refresh token')
  }

  try {
    const { data } = await axios.post<{
      accessToken: string
      refreshToken: string
      expiresIn?: number
    }>(`${baseURL}/auth/refresh`, {
      refreshToken: rt
    })

    if (!data?.accessToken || !data?.refreshToken) {
      throw new Error('Invalid refresh response')
    }

    persistAuthTokens(data.accessToken, data.refreshToken, data.expiresIn)

    return data.accessToken
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      clearAuthCookies()
      throw new Error('Session expired')
    }

    throw error
  }
}

function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string) {
  const value = `Bearer ${token}`
  const headers = config.headers

  if (headers && typeof (headers as { set?: (k: string, v: string) => void }).set === 'function') {
    ;(headers as { set: (k: string, v: string) => void }).set('Authorization', value)
  } else if (headers) {
    ;(headers as Record<string, string>).Authorization = value
  }
}

api.interceptors.request.use(config => {
  if (typeof window === 'undefined') {
    return config
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const h = config.headers
    if (h && typeof (h as { delete?: (k: string) => void }).delete === 'function') {
      ;(h as { delete: (k: string) => void }).delete('Content-Type')
    } else if (h && typeof h === 'object') {
      delete (h as Record<string, unknown>)['Content-Type']
    }
  }

  const token = getAccessTokenFromCookies()

  if (token) {
    setAuthorizationHeader(config, token)
  }

  return config
})

function requestUrl(config: InternalAxiosRequestConfig): string {
  const path = String(config.url || '')
  const b = String(config.baseURL || baseURL || '')
  if (path.startsWith('http')) return path
  const base = b.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined

    if (!original || original._retry) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const resolved = requestUrl(original)
    if (resolved.includes('/auth/refresh') || resolved.includes('/auth/login')) {
      return Promise.reject(error)
    }

    if (typeof window !== 'undefined' && !getRefreshTokenFromCookies()) {
      clearAuthCookies()
      window.location.assign(getLoginPath())
      return Promise.reject(error)
    }

    try {
      if (!refreshInFlight) {
        refreshInFlight = doRefresh().finally(() => {
          refreshInFlight = null
        })
      }

      const newAccess = await refreshInFlight

      original._retry = true
      setAuthorizationHeader(original, newAccess)

      return api(original)
    } catch {
      clearAuthCookies()

      if (typeof window !== 'undefined') {
        window.location.assign(getLoginPath())
      }

      return Promise.reject(error)
    }
  }
)
