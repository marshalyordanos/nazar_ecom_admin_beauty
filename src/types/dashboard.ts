/** GET /dashboard/summary → { data } */
export type GlobalDashboardSummary = {
  users: {
    total: number
    active: number
    suspended: number
    verifiedEmails: number
    percentChange: number
  }
  inventory: {
    totalStock: number
    reservedQuantity: number
    lowStockAlerts: number
    totalVariants: number
    percentChange: number
  }
  orders: {
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    totalRevenue: number
    percentChange: number
    revenueChange: number
  }
  payments: {
    totalPayments: number
    paidPayments: number
    failedPayments: number
    totalPaymentAmount: number
    percentChange: number
    amountChange: number
  }
}

/** GET /dashboard/global/revenue-series etc. → { data } */
export type GlobalSeriesResponse = {
  days: number
  categories: string[]
  series: Array<{ name: string; data: number[] }>
  totalRevenue?: number
  totalOrders?: number
  totalAmount?: number
}

export type GlobalOrderStatusDistribution = {
  labels: string[]
  values: number[]
}

export type DashboardSummaryPayload = { data: GlobalDashboardSummary }
