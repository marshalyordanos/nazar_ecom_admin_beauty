'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import { useSelector } from 'react-redux'

import Sales from '@views/dashboards/ecommerce/Sales'
import CardStatWithImage from '@components/card-statistics/Character'
import WeeklySalesBg from '@views/dashboards/ecommerce/WeeklySalesBg'
import TotalVisits from '@views/dashboards/ecommerce/TotalVisits'
import SalesMonth from '@views/dashboards/ecommerce/SalesMonth'
import ActivityTimeline from '@views/dashboards/ecommerce/ActivityTimeline'
import TopReferralSources from '@views/dashboards/ecommerce/TopReferralSources'

import type { RootState } from '@/redux-store'
import { useDashboardProductSummary, useDashboardRecentActivities, useDashboardSummaryWithDetails } from '@/api/admin/dashboard'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/user-list` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getUserData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/user-list`)

  if (!res.ok) {
    throw new Error('Failed to fetch userData')
  }

  return res.json()
} */

const DashboardECommerce = () => {
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)
  const { data: productSummary, isLoading: isProductSummaryLoading } = useDashboardProductSummary(shop?.[0]?.id)
  const { data: summaryWithDetails } = useDashboardSummaryWithDetails(shop?.[0]?.id)
  const { data: recentActivities, isLoading: isRecentActivitiesLoading } = useDashboardRecentActivities(shop?.[0]?.id)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Sales isLoading={isProductSummaryLoading} productSummary={productSummary} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatWithImage
          stats={productSummary?.totalSearchLogs ?? '-'}
          title='All Time Product Searches'

          // trendNumber='15.6%'
          chipColor='primary'
          chipText='all time'
          src='/images/illustrations/characters/10.png'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatWithImage
          stats={productSummary?.totalViewCount ?? '-'}
          title='All Time Product Views'
          trend='negative'

          // trendNumber='25.5%'
          chipColor='success'
          chipText='all time'
          src='/images/illustrations/characters/11.png'
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <WeeklySalesBg  />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TotalVisits />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SalesMonth thisMonthSale = {summaryWithDetails?.sales?.thisMonthSale ?? 0} />
      </Grid>
      
      <Grid size={{ xs: 12, md: 12 }}>
        <TopReferralSources />
      </Grid>
      <Grid size={{ xs: 12, md: 12 }}>
        <ActivityTimeline isLoading={isRecentActivitiesLoading} recentActivities={recentActivities} />
      </Grid>
      {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <OrdersImpressions />
      </Grid> */}
      {/* <Grid size={{ xs: 12, md: 5 }} className='max-md:order-2'>
        <MarketingSales />
      </Grid> */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 4 }} className='max-md:order-1'>
        <LiveVisitors />
      </Grid> */}
      <Grid size={{ xs: 12, md: 12 }} className='max-md:order-3'>
        {/* <UserTable tableData={data} loading={dataLoading} /> */}
      </Grid>
      {/* <Grid size={{ xs: 12, md: 4 }} className='max-md:order-3'>
        <VisitsByDay />
      </Grid> */}
    </Grid>
  )
}

export default DashboardECommerce
