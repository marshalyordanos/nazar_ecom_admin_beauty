'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import MuiLinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import { useSelector } from 'react-redux'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { useDashboardEcommerceHighlights } from '@/api/admin/dashboard'
import type { RootState } from '@/redux-store'

// Styled Components
const LinearProgress = styled(MuiLinearProgress)(() => ({
  '&.MuiLinearProgress-colorWarning': { backgroundColor: 'var(--mui-palette-primary-main)' },
  '& .MuiLinearProgress-bar': {
    borderStartEndRadius: 0,
    borderEndEndRadius: 0
  }
}))

const formatK = (num: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num)

const TotalVisits = () => {
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)
  const { data, isLoading } = useDashboardEcommerceHighlights(shop?.[0]?.id, 3)

  const visits = data?.visitsSummary?.totalVisits ?? 0
  const orders = data?.visitsSummary?.totalOrders ?? 0
  const conversionRate = data?.visitsSummary?.conversionRate ?? 0
  const visitsPercentChange = data?.visitsSummary?.visitsChangePct ?? 0
  const progressBarValue = Math.min(Math.max(conversionRate, 0), 100)
  const isPositive = visitsPercentChange >= 0

  if (isLoading) {
    return (
      <Card className='flex flex-col justify-between bs-full'>
        <CardContent className='flex justify-between items-start'>
          <div className='flex flex-col gap-2'>
            <Skeleton variant='text' width={90} animation={false} />
            <Skeleton variant='text' width={110} height={40} animation={false} />
          </div>
          <div className='flex flex-col items-end gap-2'>
            <Skeleton variant='text' width={60} animation={false} />
            <Skeleton variant='text' width={28} animation={false} />
          </div>
        </CardContent>
        <CardContent className='flex flex-col gap-4'>
          <Skeleton variant='rounded' height={92} animation={false} />
          <Skeleton variant='rounded' height={8} animation={false} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='flex flex-col justify-between bs-full'>
      <CardContent className='flex justify-between items-start'>
        <div className='flex flex-col'>
          <Typography>Total Visits</Typography>
          <Typography variant='h4'>{formatK(visits)}</Typography>
        </div>
        <div className={isPositive ? 'flex items-center text-success' : 'flex items-center text-error'}>
          <Typography color={isPositive ? 'success.main' : 'error.main'}>
            {`${isPositive ? '+' : ''}${visitsPercentChange.toFixed(1)}%`}
          </Typography>
          <i className={isPositive ? 'ri-arrow-up-s-line text-xl' : 'ri-arrow-down-s-line text-xl'}></i>
        </div>
      </CardContent>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-x-2'>
              <CustomAvatar size={24} variant='rounded' skin='light' className='rounded-md' color='warning'>
                <i className='ri-pie-chart-2-line text-base' />
              </CustomAvatar>
              <Typography>Order</Typography>
            </div>
            <Typography variant='h4'>{conversionRate.toFixed(1)}%</Typography>
            <Typography>{formatK(orders)}</Typography>
          </div>
          <Divider flexItem orientation='vertical' sx={{ '& .MuiDivider-wrapper': { p: 0, py: 2 } }}>
            <CustomAvatar skin='light' color='secondary' size={28} className='bg-actionSelected'>
              <Typography variant='body2'>VS</Typography>
            </CustomAvatar>
          </Divider>
          <div className='flex flex-col items-end gap-2'>
            <div className='flex items-center gap-x-2'>
              <Typography>Visits</Typography>
              <CustomAvatar size={24} variant='rounded' skin='light' className='rounded-md' color='primary'>
                <i className='ri-mac-line text-base' />
              </CustomAvatar>
            </div>
            <Typography variant='h4'>100%</Typography>
            <Typography>{formatK(visits)}</Typography>
          </div>
        </div>
        <LinearProgress value={progressBarValue} color='warning' variant='determinate' className='bs-2' />
      </CardContent>
    </Card>
  )
}

export default TotalVisits
