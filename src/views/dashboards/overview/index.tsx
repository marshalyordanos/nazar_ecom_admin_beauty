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
import WeeklyOverview from '@views/dashboards/overview/WeeklyOverview'
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
import { useDashboardOverview, useDashboardPaymentSummary, useDashboardSummaryWithDetails } from '@/api/admin/dashboard'
import { useEffect, useState } from 'react'

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

  const { data: summaryWithDetails } = useDashboardSummaryWithDetails(shop?.[0]?.id)
  const {data:overviewData} = useDashboardOverview(shop?.[0]?.id)
  const {data:paymentSummary} = useDashboardPaymentSummary(shop?.[0]?.id)
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Award />
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
        <WeeklyOverview />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <SocialNetworkVisits />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <MonthlyBudget />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <MeetingSchedule />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <ExternalLinks />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        {/* Remove serverMode prop to PaymentHistory, or pass null/undefined if needed */}
        <PaymentHistory serverMode={[] as any} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <SalesInCountries />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {/* <UserTable tableData={userData} /> */}
      </Grid>
    </Grid>
  )
}

export default OverviewDashboard
