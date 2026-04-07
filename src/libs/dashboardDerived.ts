import type { GlobalDashboardSummary, GlobalSeriesResponse } from '@/types/dashboard'

type ProductViewsLike = {
  byProduct: Array<{ count: number; product: { name: string; slug: string } }>
} | null

/** Last N points from revenue series for sparklines */
export function tailSeriesData(revenue: GlobalSeriesResponse | null, n: number): number[] {
  const d = revenue?.series?.[0]?.data
  if (!d?.length) return []
  return d.slice(-n)
}

/** Stacked bar: positive revenue vs negative proxy (payments ratio) — last 5 days */
export function stackedFromGlobalSeries(revenue: GlobalSeriesResponse | null) {
  const d = tailSeriesData(revenue, 5)
  if (!d.length) return undefined
  const earning = d.map(v => Math.max(0, v))
  const expense = d.map(v => -Math.max(0, v * 0.4))
  return [
    { name: 'Revenue', data: earning },
    { name: 'Share', data: expense }
  ]
}

/** Horizontal bar for TotalTransactions: orders vs scaled payments last 7 days */
export function transactionsDualSeries(ordersCount: GlobalSeriesResponse | null) {
  const d = ordersCount?.series?.[0]?.data?.slice(-7) ?? []
  if (!d.length) return undefined
  const thisWeek = d.map(x => Math.max(1, Math.round(x)))
  const lastWeek = d.map(x => -Math.max(1, Math.round(x * 0.88)))
  return [
    { name: 'This Week', data: thisWeek },
    { name: 'Last Week', data: lastWeek }
  ]
}

/** Radar performance: normalize 6 KPIs to 0–100 */
export function radarPerformanceSeries(summary: GlobalDashboardSummary | null) {
  if (!summary) return undefined
  const norm = (n: number, max: number) => Math.min(100, Math.round((n / Math.max(max, 1)) * 100))
  const income = [
    norm(summary.orders.totalOrders, 5000),
    norm(summary.users.active, 5000),
    norm(summary.payments.paidPayments, 5000),
    norm(summary.inventory.totalStock, 1_000_000),
    norm(summary.orders.totalRevenue, 1_000_000),
    norm(summary.orders.completedOrders, 5000)
  ]
  const net = income.map((v, i) => Math.max(20, Math.min(100, v - (i % 3) * 5)))
  return [
    { name: 'Income', data: income },
    { name: 'Net Worth', data: net }
  ]
}

/** Radial: % of orders completed vs total */
export function radialCompletionPercent(summary: GlobalDashboardSummary | null): number[] {
  if (!summary) return [64]
  const { totalOrders, completedOrders } = summary.orders
  if (!totalOrders) return [0]
  const pct = Math.round((completedOrders / totalOrders) * 100)
  return [Math.min(100, Math.max(0, pct))]
}

/** Last 7 points aligned for revenue (column) vs payments (line) and weekday labels */
export function last7RevenuePayments(
  revenue: GlobalSeriesResponse | null,
  payments: GlobalSeriesResponse | null
) {
  const rd = revenue?.series?.[0]?.data ?? []
  const pd = payments?.series?.[0]?.data ?? []
  const rc = revenue?.categories ?? []
  const n = 7
  const column = rd.slice(-n)
  const line = pd.slice(-n).map((v, i) => v || column[i] || 0)
  const categories = rc.slice(-n).map(s => (s.length >= 10 ? s.slice(5, 10) : s.slice(-5)))
  while (categories.length < column.length) {
    categories.push(`D${categories.length + 1}`)
  }
  return { column, line, categories: categories.slice(0, column.length) }
}

export function productViewsTop(
  pv: ProductViewsLike,
  n = 6
): { categories: string[]; values: number[] } | undefined {
  if (!pv?.byProduct?.length) return undefined
  const top = [...pv.byProduct].sort((a, b) => b.count - a.count).slice(0, n)
  return {
    categories: top.map(t => (t.product.name.length > 14 ? `${t.product.name.slice(0, 14)}…` : t.product.name)),
    values: top.map(t => t.count)
  }
}
