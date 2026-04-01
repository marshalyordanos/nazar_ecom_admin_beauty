'use client'
// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { UserDataType } from '@components/card-statistics/HorizontalWithSubtitle'

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useDashboardSummary } from '@/api/admin/dashboard'

// Vars
const LoadingCard = () => (
  <div className='flex flex-col gap-2 p-4 border rounded'>
    <Skeleton variant='text' width={120} height={24} />
    <Skeleton variant='text' width={90} height={20} />
    <Skeleton variant='text' width={70} height={18} />
  </div>
)

const UserListCards = () => {
  const { data, isLoading, isError } = useDashboardSummary()
  const users = data?.data?.users

  const cards: UserDataType[] = users
    ? [
        {
          title: 'Users',
          stats: String(users.total),
          avatarIcon: 'ri-group-line',
          avatarColor: 'primary',
          trend: users.percentChange >= 0 ? 'positive' : 'negative',
          trendNumber: `${Math.abs(users.percentChange).toFixed(1)}%`,
          subtitle: 'Total Users'
        },
        {
          title: 'Active',
          stats: String(users.active),
          avatarIcon: 'ri-user-follow-line',
          avatarColor: 'success',
          trend: users.percentChange >= 0 ? 'positive' : 'negative',
          trendNumber: `${Math.abs(users.percentChange).toFixed(1)}%`,
          subtitle: 'Current period'
        },
        {
          title: 'Suspended',
          stats: String(users.suspended),
          avatarIcon: 'ri-user-forbid-line',
          avatarColor: 'error',
          trend: users.percentChange >= 0 ? 'negative' : 'positive',
          trendNumber: `${Math.abs(users.percentChange).toFixed(1)}%`,
          subtitle: 'Current period'
        },
        {
          title: 'Verified Emails',
          stats: String(users.verifiedEmails),
          avatarIcon: 'ri-mail-check-line',
          avatarColor: 'info',
          trend: users.percentChange >= 0 ? 'positive' : 'negative',
          trendNumber: `${Math.abs(users.percentChange).toFixed(1)}%`,
          subtitle: 'Current period'
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
