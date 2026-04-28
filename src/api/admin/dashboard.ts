
import { useQuery } from '@tanstack/react-query'

import { api } from '@/libs/api'

// ------------------------
// Types for Dashboard Data
// ------------------------

export type DashboardSummary = {
  users: { total: number; active: number; suspended: number; verifiedEmails: number; percentChange: number }
  inventory: { totalStock: number; reservedQuantity: number; lowStockAlerts: number; totalVariants: number; percentChange: number }
  orders: { totalOrders: number; completedOrders: number; pendingOrders: number; totalRevenue: number; percentChange: number; revenueChange: number }
  payments: { totalPayments: number; paidPayments: number; failedPayments: number; totalPaymentAmount: number; percentChange: number; amountChange: number }
}

// ALL dashboard router endpoints covered (from @dashboard.router.ts)
// If a new router is added, add it here and in the keys below!
export const dashboardKeys = {
  // Main summaries
  overview: ['dashboard-overview'] as const,
  summary: ['dashboard-summary'] as const,
  shopKpi: ['dashboard-shop-kpi'] as const,
  summaryWithDetails: ['dashboard-summary-with-details'] as const,

  // Users
  userSummary: ['dashboard-users-summary'] as const,
  userVerification: ['dashboard-users-verification'] as const,

  // Orders
  orderSummaryExtended: ['dashboard-orders-summary-extended'] as const,
  orderRevenueSummary: ['dashboard-orders-revenue-summary'] as const,
  ordersDaily: ['dashboard-orders-daily'] as const,
  ordersStatusDistribution: ['dashboard-orders-status-distribution'] as const,
  ordersFulfillment: ['dashboard-orders-fulfillment'] as const,
  ordersValueDistribution: ['dashboard-orders-value-distribution'] as const,
  ordersAbandoned: ['dashboard-orders-abandoned'] as const,

  // Payments
  paymentSummary: ['dashboard-payments-summary'] as const,
  paymentMethods: ['dashboard-payments-methods'] as const,
  paymentsDaily: ['dashboard-payments-daily'] as const,

  // Products
  productSummary: ['dashboard-products-summary'] as const,
  variantSummary: ['dashboard-variants-summary'] as const,
  productsPerformance: ['dashboard-products-performance'] as const,
  productsConversion: ['dashboard-products-conversion'] as const,
  productsMostViewed: ['dashboard-products-most-viewed'] as const,
  categories: ['dashboard-products-categories'] as const,
  brands: ['dashboard-products-brands'] as const,

  // Inventory
  inventorySummary: ['dashboard-inventory-summary'] as const,
  inventoryLowStock: ['dashboard-inventory-low-stock'] as const,
  inventoryOutOfStock: ['dashboard-inventory-out-of-stock'] as const,
  inventoryValuation: ['dashboard-inventory-valuation'] as const,
  inventoryTurnover: ['dashboard-inventory-turnover'] as const,
  inventoryAlerts: ['dashboard-inventory-alerts'] as const,
  inventoryLocation: ['dashboard-inventory-location'] as const,

  // Shops
  shopSummary: ['dashboard-shops-summary'] as const,
  shopLocationSummary: ['dashboard-shops-location-summary'] as const,

  // Coupons
  couponSummary: ['dashboard-coupons-summary'] as const,
  couponUsageSummary: ['dashboard-coupons-usage-summary'] as const,
  couponsPerformance: ['dashboard-coupons-performance'] as const,
  couponsActive: ['dashboard-coupons-active'] as const,
  couponsExpired: ['dashboard-coupons-expired'] as const,

  // Reviews
  reviewSummary: ['dashboard-reviews-summary'] as const,
  reviewsRatingsDistribution: ['dashboard-reviews-ratings-distribution'] as const,
  reviewsRecent: ['dashboard-reviews-recent'] as const,
  reviewsPending: ['dashboard-reviews-pending'] as const,

  // Notifications
  notificationSummary: ['dashboard-notification-summary'] as const,
  notificationsUnread: ['dashboard-notifications-unread'] as const,

  // Activities / Logs
  activitiesOrders: ['dashboard-activities-orders'] as const,
  activitiesUsers: ['dashboard-activities-users'] as const,
  activitiesInventory: ['dashboard-activities-inventory'] as const,

  // Search
  searchSummary: ['dashboard-search-summary'] as const,
  searchTopQueries: ['dashboard-search-top-queries'] as const,
  searchNoResults: ['dashboard-search-no-results'] as const,

  // Sales Analytics
  salesTrends: ['dashboard-sales-trends'] as const,
  salesByChannel: ['dashboard-sales-by-channel'] as const,
  salesForecast: ['dashboard-sales-forecast'] as const,
  salesRefunds: ['dashboard-sales-refunds'] as const,

  // Customer Analytics
  customersGrowth: ['dashboard-customers-growth'] as const,
  customersRetention: ['dashboard-customers-retention'] as const,
  customersLtv: ['dashboard-customers-ltv'] as const,
  customersSegments: ['dashboard-customers-segments'] as const,
  customersCards: ['dashboard-customers-cards'] as const,

  // System/Health
  healthSummary: ['dashboard-health-summary'] as const,
  syncStatus: ['dashboard-sync-status'] as const,
  topProducts: ['dashboard-top-products'] as const,
  ecommerceHighlights: ['dashboard-ecommerce-highlights'] as const,
  recentOrders: ['dashboard-recent-orders'] as const,
  lowInventory:['dashboard-low-inventory'] as const,
  recentActivities:['dashboard-recent-activities'] as const,
  all:['dashboard-all'] as const,
}

// All hooks below are refactored to accept an optional shopId parameter and pass it as query string

// Helper to build a query string for shopId (used everywhere shopId is passed)
function getQuery(param?: string) {
  return param ? `?shopId=${param}` : ''
}

export function useDashboardOverview(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.overview, shopId],
    queryFn: async () => (await api.get(`/dashboard/overview${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.summary, shopId],
    queryFn: async () => (await api.get(`/dashboard/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardShopKpi(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.shopKpi, shopId],
    queryFn: async () => (await api.get(`/dashboard/shop-kpi?shopId=${shopId}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSummaryWithDetails(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.summaryWithDetails, shopId],
    queryFn: async () => (await api.get(`/dashboard/summary-with-details${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardUserSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.userSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/users/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardUserVerification(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.userVerification, shopId],
    queryFn: async () => (await api.get(`/dashboard/users/verification${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardOrderSummaryExtended(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.orderSummaryExtended, shopId],
    queryFn: async () => (await api.get(`/dashboard/orders/summary-extended${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardOrderRevenueSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.orderRevenueSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/orders/revenue-summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardOrdersDaily(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.ordersDaily, shopId],
    queryFn: async () => (await api.get(`/dashboard/orders/daily${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardOrdersStatusDistribution(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.ordersStatusDistribution, shopId],
    queryFn: async () => (await api.get(`/dashboard/orders/status-distribution${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardOrdersFulfillment(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.ordersFulfillment, shopId],
    queryFn: async () => (await api.get(`/dashboard/orders/fulfillment${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardOrdersValueDistribution(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.ordersValueDistribution, shopId],
    queryFn: async () => (await api.get(`/dashboard/orders/value-distribution${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardOrdersAbandoned(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.ordersAbandoned, shopId],
    queryFn: async () => (await api.get(`/dashboard/orders/abandoned${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardPaymentSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.paymentSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/payments/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardPaymentMethods(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.paymentMethods, shopId],
    queryFn: async () => (await api.get(`/dashboard/payments/methods${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardPaymentsDaily(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.paymentsDaily, shopId],
    queryFn: async () => (await api.get(`/dashboard/payments/daily${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardProductSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.productSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/products/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardVariantSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.variantSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/products/variants/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardProductsPerformance(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.productsPerformance, shopId],
    queryFn: async () => (await api.get(`/dashboard/products/performance${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardProductsConversion(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.productsConversion, shopId],
    queryFn: async () => (await api.get(`/dashboard/products/conversion${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardProductsMostViewed(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.productsMostViewed, shopId],
    queryFn: async () => (await api.get(`/dashboard/products/most-viewed${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCategories(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.categories, shopId],
    queryFn: async () => (await api.get(`/dashboard/products/categories${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardBrands(shopId?: string,days: number=90) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.brands, shopId,days],
    queryFn: async () => (await api.get(`/dashboard/products/brands${getQuery(shopId)}&days=${days}`)).data,
    staleTime: 1000 * 10,
    enabled: !!shopId && !!days
  })
}

export function useDashboardInventorySummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.inventorySummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/inventory/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardInventoryLowStock(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.inventoryLowStock, shopId],
    queryFn: async () => (await api.get(`/dashboard/inventory/low-stock/count${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardInventoryOutOfStock(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.inventoryOutOfStock, shopId],
    queryFn: async () => (await api.get(`/dashboard/inventory/out-of-stock${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardInventoryValuation(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.inventoryValuation, shopId],
    queryFn: async () => (await api.get(`/dashboard/inventory/valuation${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardInventoryTurnover(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.inventoryTurnover, shopId],
    queryFn: async () => (await api.get(`/dashboard/inventory/turnover${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardInventoryAlerts(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.inventoryAlerts, shopId],
    queryFn: async () => (await api.get(`/dashboard/inventory/alerts${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardInventoryByLocation(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.inventoryLocation, shopId],
    queryFn: async () => (await api.get(`/dashboard/inventory/location${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardShopSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.shopSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/shops/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardShopLocationSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.shopLocationSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/shops/locations/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCouponSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.couponSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/coupons/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCouponUsageSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.couponUsageSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/coupons/usage/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCouponsPerformance(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.couponsPerformance, shopId],
    queryFn: async () => (await api.get(`/dashboard/coupons/performance${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCouponsActive(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.couponsActive, shopId],
    queryFn: async () => (await api.get(`/dashboard/coupons/active${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCouponsExpired(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.couponsExpired, shopId],
    queryFn: async () => (await api.get(`/dashboard/coupons/expired${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardReviewSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.reviewSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/reviews/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardReviewsRatingsDistribution(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.reviewsRatingsDistribution, shopId],
    queryFn: async () => (await api.get(`/dashboard/reviews/ratings-distribution${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardReviewsRecent(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.reviewsRecent, shopId],
    queryFn: async () => (await api.get(`/dashboard/reviews/recent${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardReviewsPending(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.reviewsPending, shopId],
    queryFn: async () => (await api.get(`/dashboard/reviews/pending${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardNotificationSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.notificationSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/notifications/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardNotificationsUnread(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.notificationsUnread, shopId],
    queryFn: async () => (await api.get(`/dashboard/notifications/unread${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardActivitiesOrders(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.activitiesOrders, shopId],
    queryFn: async () => (await api.get(`/dashboard/activities/orders${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardActivitiesUsers(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.activitiesUsers, shopId],
    queryFn: async () => (await api.get(`/dashboard/activities/users${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardActivitiesInventory(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.activitiesInventory, shopId],
    queryFn: async () => (await api.get(`/dashboard/activities/inventory${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSearchSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.searchSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/search/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSearchTopQueries(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.searchTopQueries, shopId],
    queryFn: async () => (await api.get(`/dashboard/search/top-queries${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSearchNoResults(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.searchNoResults, shopId],
    queryFn: async () => (await api.get(`/dashboard/search/no-results${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSalesTrends(
  shopId?: string,
  groupBy: 'day' | 'week' | 'month' = 'day',
  options?: { enabled?: boolean; days?: number; year?: number | null }
) {
  const days = options?.days ?? 90
  const year = options?.year
  const enabled = (options?.enabled !== false) && !!shopId
  const yearKey = year != null && Number.isFinite(year) ? year : 'rolling'
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.salesTrends, shopId, groupBy, days, yearKey],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (shopId) params.set('shopId', shopId)
      params.set('groupBy', groupBy)
      if (year != null && Number.isFinite(year)) params.set('year', String(year))
      else params.set('days', String(days))
      return (await api.get(`/dashboard/sales/trends?${params.toString()}`)).data
    },
    staleTime: 1000 * 10,
    enabled,
  })
}

export function useDashboardSalesByChannel(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.salesByChannel, shopId],
    queryFn: async () => (await api.get(`/dashboard/sales/by-channel${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSalesForecast(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.salesForecast, shopId],
    queryFn: async () => (await api.get(`/dashboard/sales/forecast${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSalesRefunds(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.salesRefunds, shopId],
    queryFn: async () => (await api.get(`/dashboard/sales/refunds${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCustomersGrowth(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.customersGrowth, shopId],
    queryFn: async () => (await api.get(`/dashboard/customers/growth${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCustomersRetention(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.customersRetention, shopId],
    queryFn: async () => (await api.get(`/dashboard/customers/retention${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCustomersLtv(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.customersLtv, shopId],
    queryFn: async () => (await api.get(`/dashboard/customers/lifetime-value${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCustomersSegments(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.customersSegments, shopId],
    queryFn: async () => (await api.get(`/dashboard/customers/segments${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardCustomerCards(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.customersCards, shopId],
    queryFn: async () => (await api.get(`/dashboard/customers/cards${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardHealthSummary(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.healthSummary, shopId],
    queryFn: async () => (await api.get(`/dashboard/health/summary${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardSyncStatus(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.syncStatus, shopId],
    queryFn: async () => (await api.get(`/dashboard/sync/status${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

// Duplicate/legacy variant kept for compatibility but lets you send shopId in the same way
export function useCustomerDashboardCards(shopId?: string) {
	return useQuery<any, Error>({
		queryKey: [...dashboardKeys.customersCards, shopId],
		queryFn: async () => (await api.get(`/dashboard/customers/cards${getQuery(shopId)}`)).data,
		staleTime: 1000 * 1
	})
}

export function useDashboardTopProducts(shopId?: string,limit: number=5) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.topProducts, shopId],
    queryFn: async () => (await api.get(`/dashboard/top-products${getQuery(shopId)}&limit=${limit}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardEcommerceHighlights(shopId?: string, limit: number = 3) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.ecommerceHighlights, shopId, limit],
    queryFn: async () =>
      (
        await api.get(`/dashboard/ecommerce/highlights${getQuery(shopId)}${shopId ? '&' : '?'}limit=${limit}`)
      ).data,
    staleTime: 1000 * 10,
    enabled: !!shopId
  })
}

export function useDashboardRecentOrders(shopId?: string,limit: number=5) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.recentOrders, shopId],
    queryFn: async () => (await api.get(`/dashboard/recent-orders${getQuery(shopId)}&limit=${limit}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardLowInventory(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.lowInventory, shopId],
    queryFn: async () => (await api.get(`/dashboard/low-inventory${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}

export function useDashboardRecentActivities(shopId?: string) {
  return useQuery<any, Error>({
    queryKey: [...dashboardKeys.recentActivities, shopId],
    queryFn: async () => (await api.get(`/dashboard/recent-activities${getQuery(shopId)}`)).data,
    staleTime: 1000 * 10
  })
}