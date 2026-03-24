'use client'
// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports

// Component Imports
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import { useShopSummary } from '@/api/shops/useShopSummary'
import HorizontalWithSubtitle2, { UserDataType } from '@/components/card-statistics/horixontalWithSubtitle2'

const BranchesCards = () => {
  const { data: shopSummary, isLoading } = useShopSummary()

  // Prepare data for cards from shopSummary
  const cardsData: UserDataType[] = [
    {
      title: 'Total Shops',
      stats: shopSummary ? shopSummary.totalShops.toString() : '-',
      avatarIcon: 'ri-store-3-line',
      avatarColor: 'primary',
      trend: 'positive',
      // trendNumber: '0%',
      subtitle: 'All shops count'
    },
    {
      title: 'Active Shops',
      stats: shopSummary ? shopSummary.activeShops.toString() : '-',
      avatarIcon: 'ri-store-2-line',
      avatarColor: 'success',
      trend: 'positive',
      // trendNumber: '0%',
      subtitle: 'Active shops'
    },
    {
      title: 'Locations',
      stats: shopSummary ? shopSummary.locationsCount.toString() : '-',
      avatarIcon: 'ri-map-pin-line',
      avatarColor: 'info',
      trend: 'positive',
      subtitle: 'Locations under all shops'
    },
    // Optionally, you could add another card (empty or from future data)
    // {
    //   title: 'Reserved',
    //   stats: '-',
    //   avatarIcon: 'ri-store-2-line',
    //   avatarColor: 'warning',
    //   trend: 'positive',
    //   trendNumber: '0%',
    //   subtitle: ''
    // }
  ]

  return (
    <Grid container spacing={6}>
      {cardsData.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle2 {...item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default BranchesCards
