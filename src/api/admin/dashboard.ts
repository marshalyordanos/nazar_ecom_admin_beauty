import { useQuery } from '@tanstack/react-query'
import { api } from '@/libs/api'

export type DashboardSummary = {
	users: { total: number; active: number; suspended: number; verifiedEmails: number; percentChange: number }
	inventory: { totalStock: number; reservedQuantity: number; lowStockAlerts: number; totalVariants: number; percentChange: number }
	orders: { totalOrders: number; completedOrders: number; pendingOrders: number; totalRevenue: number; percentChange: number; revenueChange: number }
	payments: { totalPayments: number; paidPayments: number; failedPayments: number; totalPaymentAmount: number; percentChange: number; amountChange: number }
}

export const dashboardKeys = {
	all: ['admin-dashboard-summary'] as const
}

export function useDashboardSummary() {
	return useQuery<{ data: DashboardSummary }, Error>({
		queryKey: dashboardKeys.all,
		queryFn: async () => (await api.get('/dashboard/summary')).data,
		staleTime: 1000 * 1
	})
}


export function useCustomerDashboardCards() {
	return useQuery<any, Error>({
		queryKey: dashboardKeys.all,
		queryFn: async () => (await api.get('/dashboard/customers/cards')).data,
		staleTime: 1000 * 1
	})
}