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
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
      {items.map((item, i) => (
        <Grid key={i} size={{ xs: 6, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: { xs: 1, sm: 2 },
                justifyContent: 'space-between',
                py: { xs: 1.5, sm: 2 },
                px: { xs: 1.5, sm: 2 }
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  gutterBottom
                  sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}
                >
                  {item.label}
                </Typography>
                {isLoading ? (
                  <Skeleton variant='text' width='60%' height={32} />
                ) : isError ? (
                  <Typography color='error' variant='caption'>
                    Failed to load
                  </Typography>
                ) : (
                  <>
                    <Typography variant='h6' sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.35rem' } }}>
                      {item.value}
                    </Typography>
                    {item.sub ? (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mt: 0.25
                        }}
                      >
                        {item.sub}
                      </Typography>
                    ) : null}
                  </>
                )}
              </Box>
              <Box
                sx={{
                  minWidth: { xs: 32, sm: 40 },
                  minHeight: { xs: 32, sm: 40 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: iconStyles[i].bg,
                  color: iconStyles[i].color,
                  boxShadow: { xs: 1, sm: 3 },
                  marginLeft: { xs: 0.5, sm: 2 },
                  flexShrink: 0,
                  '& .ri-2x': { fontSize: { xs: '1rem', sm: '1.5rem' } }
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
