'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import type { SalesFromShopStats } from '@/api/sales/useSaleFromShop'

import { DEFAULT_CURRENCY_CODE } from '@/libs/currency'

type Props = {
  stats?: SalesFromShopStats
  isLoading: boolean
  isError: boolean
  currency?: string
}

// Make icons smaller by using ri-2x instead of ri-3x
const iconStyles = [
  { 
    icon: <i className="ri-list-ordered ri-2x" />, 
    bg: 'linear-gradient(135deg, #6C63FF, #48CDFF)', 
    color: '#fff' 
  },
  { 
    icon: <i className='ri-coins-line ri-2x' />, 
    bg: 'linear-gradient(135deg, #FF6B6B, #FFD36E)', 
    color: '#fff' 
  },
  { 
    icon: <i className="ri-inbox-archive-line ri-2x" />,
    bg: 'linear-gradient(135deg, #51C878, #5DE0E6)',
    color: '#fff'
  },
  { 
    icon: <i className="ri-calendar-todo-line ri-2x" />,
    bg: 'linear-gradient(135deg, #FE8F8F, #F9F871)',
    color: '#2D2D2D'
  }
]

const SalesFromShopStatsCards = ({ stats, isLoading, isError, currency = DEFAULT_CURRENCY_CODE }: Props) => {
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n)

  const items: { label: string; value: string; sub?: string }[] = [
    {
      label: 'Total sales lines',
      value: stats ? String(stats.totalRecords) : '—',
      sub: 'Total sales lines from all sales'
    },
    {
      label: 'Total revenue',
      value: stats ? fmtMoney(stats.totalRevenue) : '—',
      sub: 'Total revenue from all sales'
    },
    {
      label: 'Units sold',
      value: stats ? String(stats.totalQuantity) : '—',
      sub: 'Total units sold'
    },
    {
      label: 'Revenue this month',
      value: stats ? fmtMoney(stats.revenueThisMonth) : '—',
      sub: 'Revenue this month from all sales'
    }
  ]

  return (
    <Grid container spacing={4}>
      {items.map((item, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {item.label}
                </Typography>
                {isLoading ? (
                  <Skeleton variant='text' width='60%' height={40} />
                ) : isError ? (
                  <Typography color='error'>Failed to load</Typography>
                ) : (
                  <>
                    <Typography variant='h4' className='font-medium'>
                      {item.value}
                    </Typography>
                    {item.sub ? (
                      <Typography variant='caption' color='text.secondary'>
                        {item.sub}
                      </Typography>
                    ) : null}
                  </>
                )}
              </Box>
              <Box
                sx={{
                  minWidth: 40,
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: iconStyles[i].bg,
                  color: iconStyles[i].color,
                  boxShadow: 3,
                  marginLeft: 2
                }}
              >
                {iconStyles[i].icon}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default SalesFromShopStatsCards
