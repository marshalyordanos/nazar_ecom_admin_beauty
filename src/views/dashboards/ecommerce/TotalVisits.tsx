'use client'

// MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import MuiLinearProgress from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Components
const LinearProgress = styled(MuiLinearProgress)(() => ({
  '&.MuiLinearProgress-colorWarning': { backgroundColor: 'var(--mui-palette-primary-main)' },
  '& .MuiLinearProgress-bar': {
    borderStartEndRadius: 0,
    borderEndEndRadius: 0
  }
}))

const TotalVisits = ({ totalVisit, totalOrder }: { totalVisit: number, totalOrder: number }) => {
  // Calculate conversion rates and percentage change
  const visits = totalVisit ?? 0
  const orders = totalOrder ?? 0

  // Conversion rate: orders/visits * 100, but guard for divide-by-zero
  const conversionRate = visits > 0 ? (orders / visits) * 100 : 0

  // Show values as smart as possible for UI
  // Use K suffix for thousands for main big font
  const formatK = (num: number) =>
    num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString()

  // We'll show percentage increase if possible, else just "—"
  // Example static: +18.2%, here just show "-" since no historical value is provided
  // (Would normally pass a previous count for comparison)
  const visitsPercentChange = null // or calculate if you have data

  // For progress bar, we can use conversionRate clamped to [0,100]
  const progressBarValue =
    conversionRate > 100 ? 100 : conversionRate < 0 ? 0 : conversionRate

  return (
    <Card className='flex flex-col justify-between bs-full'>
      <CardContent className='flex justify-between items-start'>
        <div className='flex flex-col'>
          <Typography>Total Visits</Typography>
          <Typography variant='h4'>{formatK(visits)}</Typography>
        </div>
        <div className='flex items-center text-success'>
          <Typography color='success.main'>
            {visitsPercentChange !== null ? (
              visitsPercentChange > 0
                ? `+${visitsPercentChange.toFixed(1)}%`
                : `${visitsPercentChange.toFixed(1)}%`
            ) : '—'}
          </Typography>
          <i className='ri-arrow-up-s-line text-xl'></i>
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
