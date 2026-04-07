'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import Award from '@views/dashboards/overview/Award'
import CardStatVertical from '@components/card-statistics/Vertical'
import StackedBarChart from '@views/dashboards/overview/StackedBarChart'
import DonutChart from '@views/dashboards/overview/DonutChart'
import OrganicSessions from '@views/dashboards/overview/OrganicSessions'
import ProjectTimeline from '@views/dashboards/overview/ProjectTimeline'
import SocialNetworkVisits from '@views/dashboards/overview/SocialNetworkVisits'
import MonthlyBudget from '@views/dashboards/overview/MonthlyBudget'
import MeetingSchedule from '@views/dashboards/overview/MeetingSchedule'
import ExternalLinks from '@views/dashboards/overview/ExternalLinks'
import PaymentHistory from '@views/dashboards/overview/PaymentHistory'
import SalesInCountries from '@views/dashboards/overview/SalesInCountries'
import UserTable from '@views/dashboards/overview/UserTable'

// Data Imports
import { getUserData } from '@/app/server/actions'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { useDashboardBrands, useDashboardOverview, useDashboardPaymentSummary, useDashboardShopKpi, useDashboardSummaryWithDetails, useDashboardTopProducts } from '@/api/admin/dashboard'
import { useEffect, useState } from 'react'
import HorizontalWithSubtitle from '@/components/card-statistics/HorizontalWithSubtitle'
import TopBrands from '@views/dashboards/overview/WeeklyOverview'
import ApexLineChart from '@views/dashboards/overview/MeetingSchedule'
import LowInventory from './LowInventory'
import { Typography } from '@mui/material'

// NOTE: Removed import of getServerMode from @core/utils/serverHelpers to avoid server-only code in client component

const OverviewDashboard = () => {
  // Get shop from Redux
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)

  // State for async values
  const [userData, setUserData] = useState<any>(null)
  // Remove serverMode state and related calls to avoid calling server-only code
  // const [serverMode, setServerMode] = useState<any>(null)

  // Fetch user data on client-mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataRes = await getUserData()
        setUserData(userDataRes)
        // Removed: serverModeRes and setServerMode
      } catch (e) {
        setUserData([])
        // Removed: setServerMode(null)
      }
    }
    fetchData()
  }, [])

  /**
   * shopKPI={
    "totalTransactions": 1,
    "revenue": 2599.98,
    "users": 2,
    "orders": 8,
    "products": 9,
    "alerts": 0,
    "customers": 3
}
   */
  const { data: shopKPI } = useDashboardShopKpi(shop[0]?.id)

  const { data: summaryWithDetails } = useDashboardSummaryWithDetails(shop?.[0]?.id)
  const {data:overviewData} = useDashboardOverview(shop?.[0]?.id)
  const {data:paymentSummary} = useDashboardPaymentSummary(shop?.[0]?.id)
  const {data:topProducts} = useDashboardTopProducts(shop?.[0]?.id,4)
  console.log("summaryWithDetails",summaryWithDetails)
  const cards:any = shopKPI
  ? [
      {
        title: 'Customers',
        stats: String(shopKPI?.customers),
        avatarIcon: 'ri-user-line',
        avatarColor: 'primary',
        // trend: shopKPI?.customers > 0 ? 'positive' : 'negative',
        // trendNumber: shopKPI?.customers,
        subtitle: 'Total Customers'
      },
      {
        title: 'Revenue',
        stats: String(shopKPI?.revenue)+' br.',
        avatarIcon: 'ri-money-cny-circle-line',
        avatarColor: 'success',
        // trend: shopKPI?.revenue > 0 ? 'positive' : 'negative',
        // trendNumber: shopKPI?.revenue,
        subtitle: 'Total Revenue'
      },
      {
        title: 'Total Transactions',
        stats: String(shopKPI?.totalTransactions) ,
        avatarIcon: 'ri-money-cny-circle-line',
        avatarColor: 'warning',
        // trend: shopKPI?.totalTransactions > 0 ? 'positive' : 'negative',
        // trendNumber: shopKPI?.totalTransactions,
        subtitle: 'Total Transactions'
      },
      {
        title: 'Orders',
        stats: String(shopKPI?.orders),
        avatarIcon: 'ri-shopping-cart-line',
        avatarColor: 'success',
        // trend: shopKPI?.orders > 0 ? 'positive' : 'negative',
        // trendNumber: shopKPI?.orders,
        subtitle: 'Total Orders'
      }
    ]
  : []
  return (
    <Grid container spacing={6}>
       {cards.map((item:any, i:number) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <HorizontalWithSubtitle {...item} />
        </Grid>
      ))}
      <Grid size={{ xs: 12, md: 4 }}>
        <Award shopKPI={shopKPI} />
      </Grid>
      <Grid size={{ xs: 12, md: 2, sm: 3 }}>
        <CardStatVertical
          stats={summaryWithDetails?.orders?.thisMonth ?? 0}
          title='Total Orders'
          trendNumber={
            summaryWithDetails?.orders && typeof summaryWithDetails.orders.growth === "number"
              ? (summaryWithDetails.orders.growth > 0 
                  ? `${summaryWithDetails.orders.growth}%`
                  : `${summaryWithDetails.orders.growth}%`)
              : '0%'
          }
          chipText='This Month vs Last Month'
          avatarColor='primary'
          avatarIcon='ri-shopping-cart-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <CardStatVertical
          stats={summaryWithDetails?.customers?.thisMonth ?? 0}
          title='Total Customers'
          trendNumber={
            summaryWithDetails?.customers && typeof summaryWithDetails.customers.growth === "number"
              ? (summaryWithDetails.customers.growth > 0 
                  ? `${summaryWithDetails.customers.growth}%`
                  : `${summaryWithDetails.customers.growth}%`)
              : '0%'
          }
          chipText='This Month vs Last Month'
          avatarColor='success'
          avatarIcon='ri-handbag-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <StackedBarChart data={summaryWithDetails?.sales} />
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 2 }}>
        <DonutChart orders={summaryWithDetails?.orders} overviewData={overviewData} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <OrganicSessions paymentSummary={paymentSummary} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <ProjectTimeline />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TopBrands />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <SocialNetworkVisits topProducts={topProducts} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <MonthlyBudget />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, md: 12}}>
        <ApexLineChart />
      </Grid>
      {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ExternalLinks />
      </Grid> */}
      {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <PaymentHistory serverMode={[] as any} />
      </Grid> */}
      {/* <Grid size={{ xs: 12, md: 4 }}>
        <SalesInCountries />
      </Grid> */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Typography variant='h5' >Low Inventory</Typography>
        <Typography className='mb-2' variant='subtitle1' >This is inverntery that are low in stock</Typography>

        <LowInventory  />
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
      <Typography variant='h5' >Recent Order</Typography>
      <Typography className='mb-2' variant='subtitle1' >This is recent orders </Typography>

        <UserTable  />
      </Grid>
    </Grid>
  )
}

export default OverviewDashboard
