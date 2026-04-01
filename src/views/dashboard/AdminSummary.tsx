'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'

// API
import { useDashboardSummary } from '@/api/admin/dashboard'

const Stat = ({ label, value }: { label: string; value: string | number }) => (
	<div className='flex items-center justify-between'>
		<Typography color='text.secondary'>{label}</Typography>
		<Typography color='text.primary' className='font-medium'>
			{value}
		</Typography>
	</div>
)

const Percent = ({ value }: { value: number }) => (
	<div className='flex items-center gap-1'>
		<i className={`ri-arrow-${value >= 0 ? 'up' : 'down'}-s-line ${value >= 0 ? 'text-success' : 'text-error'}`} />
		<Typography color={value >= 0 ? 'success.main' : 'error.main'}>{`${value.toFixed(1)}%`}</Typography>
	</div>
)

const LoadingCard = () => (
	<Card>
		<CardContent className='flex flex-col gap-4'>
			<Skeleton variant='text' width={160} height={28} />
			<Skeleton variant='text' width={100} height={22} />
			<Skeleton variant='text' width={120} height={22} />
			<Skeleton variant='text' width={140} height={22} />
			<Skeleton variant='text' width={160} height={22} />
		</CardContent>
	</Card>
)

const AdminSummary = () => {
	const { data, isLoading, isError } = useDashboardSummary()
	const summary = data?.data

	return (
		<Grid container spacing={6}>
			{isLoading && (
				<>
					<Grid size={{ xs: 12, md: 6, lg: 3 }}>
						<LoadingCard />
					</Grid>
					<Grid size={{ xs: 12, md: 6, lg: 3 }}>
						<LoadingCard />
					</Grid>
					<Grid size={{ xs: 12, md: 6, lg: 3 }}>
						<LoadingCard />
					</Grid>
					<Grid size={{ xs: 12, md: 6, lg: 3 }}>
						<LoadingCard />
					</Grid>
				</>
			)}
			{isError && (
				<Grid size={{ xs: 12 }}>
					<Card>
						<CardContent>
							<Typography color='error.main'>Failed to load dashboard summary</Typography>
						</CardContent>
					</Card>
				</Grid>
			)}
			{summary && (
				<>
					<Grid size={{ xs: 12, md: 6, lg: 3 }}>
						<Card>
							<CardContent className='flex flex-col gap-3'>
								<Typography variant='h5'>Users</Typography>
								<Percent value={summary.users.percentChange} />
								<Stat label='Total' value={summary.users.total} />
								<Stat label='Active' value={summary.users.active} />
								<Stat label='Suspended' value={summary.users.suspended} />
								<Stat label='Verified emails' value={summary.users.verifiedEmails} />
							</CardContent>
						</Card>
					</Grid>
					<Grid size={{ xs: 12, md: 6, lg: 3 }}>
						<Card>
							<CardContent className='flex flex-col gap-3'>
								<Typography variant='h5'>Inventory</Typography>
								<Percent value={summary.inventory.percentChange} />
								<Stat label='Total stock' value={summary.inventory.totalStock} />
								<Stat label='Reserved' value={summary.inventory.reservedQuantity} />
								<Stat label='Low stock alerts' value={summary.inventory.lowStockAlerts} />
								<Stat label='Variants' value={summary.inventory.totalVariants} />
							</CardContent>
						</Card>
					</Grid>
					<Grid size={{ xs: 12, md: 6, lg: 3 }}>
						<Card>
							<CardContent className='flex flex-col gap-3'>
								<Typography variant='h5'>Orders</Typography>
								<Percent value={summary.orders.percentChange} />
								<Stat label='Total' value={summary.orders.totalOrders} />
								<Stat label='Completed' value={summary.orders.completedOrders} />
								<Stat label='Pending' value={summary.orders.pendingOrders} />
								<Stat label='Revenue' value={summary.orders.totalRevenue.toFixed(2)} />
							</CardContent>
						</Card>
					</Grid>
					<Grid size={{ xs: 12, md: 6, lg: 3 }}>
						<Card>
							<CardContent className='flex flex-col gap-3'>
								<Typography variant='h5'>Payments</Typography>
								<Percent value={summary.payments.percentChange} />
								<Stat label='Total' value={summary.payments.totalPayments} />
								<Stat label='Paid' value={summary.payments.paidPayments} />
								<Stat label='Failed' value={summary.payments.failedPayments} />
								<Stat label='Amount' value={summary.payments.totalPaymentAmount.toFixed(2)} />
							</CardContent>
						</Card>
					</Grid>
				</>
			)}
		</Grid>
	)
}

export default AdminSummary

