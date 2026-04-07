'use client'

import { useCallback, useEffect, useState } from 'react'

import { api } from '@/libs/api'
import type {
  GlobalDashboardSummary,
  GlobalOrderStatusDistribution,
  GlobalSeriesResponse
} from '@/types/dashboard'

export type ApiUserRow = {
  id: string
  email: string
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  avatarUrl?: string | null
  status: string
  roles?: { id: string; name: string }[]
}

export type ProductViewsPayload = {
  byProduct: Array<{ count: number; product: { name: string; slug: string } }>
}

export type SearchLogsPayload = {
  logs: Array<{ query: string; createdAt: string }>
  byQuery: Record<string, number>
}

export type AdminDashboardBundle = {
  summary: GlobalDashboardSummary | null
  revenue: GlobalSeriesResponse | null
  ordersCount: GlobalSeriesResponse | null
  payments: GlobalSeriesResponse | null
  statusDist: GlobalOrderStatusDistribution | null
  users: ApiUserRow[]
  productViews: ProductViewsPayload | null
  searchLogs: SearchLogsPayload | null
  loading: boolean
  error: string | null
  reload: () => void
}

const days = '30'

export function useAdminDashboardData(userPageSize = 12): AdminDashboardBundle {
  const [summary, setSummary] = useState<GlobalDashboardSummary | null>(null)
  const [revenue, setRevenue] = useState<GlobalSeriesResponse | null>(null)
  const [ordersCount, setOrdersCount] = useState<GlobalSeriesResponse | null>(null)
  const [payments, setPayments] = useState<GlobalSeriesResponse | null>(null)
  const [statusDist, setStatusDist] = useState<GlobalOrderStatusDistribution | null>(null)
  const [users, setUsers] = useState<ApiUserRow[]>([])
  const [productViews, setProductViews] = useState<ProductViewsPayload | null>(null)
  const [searchLogs, setSearchLogs] = useState<SearchLogsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const [
        sumRes,
        revRes,
        ordRes,
        payRes,
        stRes,
        usersRes,
        pvRes,
        srRes
      ] = await Promise.allSettled([
        api.get<{ data: GlobalDashboardSummary }>('/dashboard/summary'),
        api.get<{ data: GlobalSeriesResponse }>(`/dashboard/global/revenue-series?days=${days}`),
        api.get<{ data: GlobalSeriesResponse }>(`/dashboard/global/orders-count-series?days=${days}`),
        api.get<{ data: GlobalSeriesResponse }>(`/dashboard/global/payments-series?days=${days}`),
        api.get<{ data: GlobalOrderStatusDistribution }>('/dashboard/global/order-status-distribution'),
        api.get<{ data: ApiUserRow[] }>(`/users?page=1&pageSize=${userPageSize}`),
        api.get<{ views?: unknown; byProduct?: ProductViewsPayload['byProduct'] }>(
          '/analytics/product-views?limit=50'
        ),
        api.get<{ logs?: SearchLogsPayload['logs']; byQuery?: Record<string, number> }>(
          '/analytics/searches?limit=50'
        )
      ])

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data.data)
      else setSummary(null)

      if (revRes.status === 'fulfilled') setRevenue(revRes.value.data.data)
      else setRevenue(null)

      if (ordRes.status === 'fulfilled') setOrdersCount(ordRes.value.data.data)
      else setOrdersCount(null)

      if (payRes.status === 'fulfilled') setPayments(payRes.value.data.data)
      else setPayments(null)

      if (stRes.status === 'fulfilled') setStatusDist(stRes.value.data.data)
      else setStatusDist(null)

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.data ?? [])
      else setUsers([])

      if (pvRes.status === 'fulfilled') {
        const body = pvRes.value.data
        const bp = body.byProduct
        setProductViews(Array.isArray(bp) && bp.length ? { byProduct: bp } : null)
      } else setProductViews(null)

      if (srRes.status === 'fulfilled') {
        const body = srRes.value.data
        if (body.logs?.length) setSearchLogs({ logs: body.logs, byQuery: body.byQuery ?? {} })
        else setSearchLogs(null)
      } else setSearchLogs(null)

      const critical = [sumRes, usersRes].find(r => r.status === 'rejected')
      if (critical?.status === 'rejected') {
        const reason = critical.reason
        setError(reason instanceof Error ? reason.message : 'Failed to load dashboard')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [userPageSize])

  useEffect(() => {
    void reload()
  }, [reload])

  return {
    summary,
    revenue,
    ordersCount,
    payments,
    statusDist,
    users,
    productViews,
    searchLogs,
    loading,
    error,
    reload
  }
}
