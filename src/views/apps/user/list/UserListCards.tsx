'use client'
// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useCustomerDashboardCards, useDashboardSummary } from '@/api/admin/dashboard'

// Vars
const LoadingCard = () => (
  <div className='flex flex-col gap-2 p-4 border rounded'>
    <Skeleton variant='text' width={120} height={24} />
    <Skeleton variant='text' width={90} height={20} />
    <Skeleton variant='text' width={70} height={18} />
  </div>
)

const UserListCards = () => {
  const { data, isLoading, isError } = useCustomerDashboardCards()
  console.log(data, 'data cards')
  const users = data

  const cards: UserDataType[] = users
    ? [
        {
          title: 'Customers',
          stats: String(data?.total_users?.value),
          avatarIcon: 'ri-user-line',
          avatarColor: 'primary',
          trend: data?.total_users?.trend === 'positive' ? 'positive' : 'negative',
          trendNumber: data?.total_users?.trendNumber,
          subtitle: 'Total Customers'
        },
        {
          title: 'Active',
          stats: String(data?.active_users?.value),
          avatarIcon: 'ri-user-line',
          avatarColor: 'success',
          trend: data?.active_users?.trend === 'positive' ? 'positive' : 'negative',
          trendNumber: data?.active_users?.trendNumber,
          subtitle: 'Active Customers'
        },
        {
          title: 'New Users',
          stats: String(data?.new_users?.value),
          avatarIcon: 'ri-user-add-line',
          avatarColor: 'warning',
          trend: data?.new_users?.trend === 'positive' ? 'positive' : 'negative',
          trendNumber: data?.new_users?.trendNumber,
          subtitle: 'New Customers This Month'
        },
        {
          title: 'Customer Orders',
          stats: String(data?.customers_with_orders?.value),
          avatarIcon: 'ri-shopping-bag-3-line',
          avatarColor: 'success',
          trend: data?.customers_with_orders?.trend === 'positive' ? 'positive' : 'negative',
          trendNumber: data?.customers_with_orders?.trendNumber,
          subtitle: 'Customers With Orders'
        }
      ]
    : []

  return (
    <Grid container spacing={6}>
      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => (
          <Grid key={`s-${i}`} size={{ xs: 12, sm: 6, md: 3 }}>
            <LoadingCard />
          </Grid>
        ))}
      {isError && (
        <Grid size={{ xs: 12 }}>
          <Typography color='error'>Failed to load user summary</Typography>
        </Grid>
      )}
      {cards.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default UserListCards
