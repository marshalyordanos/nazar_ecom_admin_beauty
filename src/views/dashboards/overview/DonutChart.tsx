'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const DonutChart = ({ orders, overviewData }: { orders: any, overviewData: any }) => {
  // Hooks
  const theme = useTheme()

  // Prepare donut chart data from overviewData.ordersByStatus
  // Fallback to 0 if any value is missing
  const ordersByStatus = overviewData?.ordersByStatus || {}
  const pending = Number(ordersByStatus.PENDING) || 0
  const completed = Number(ordersByStatus.COMPLETED) || 0
  const refunded = Number(ordersByStatus.REFUNDED) || 0
  const total = pending + completed + refunded
  // Fallback for donut series, never empty array to avoid ApexCharts error
  const series = total > 0 ? [pending, completed, refunded] : [0, 0, 0]

  // Labels map to statuses (can update for display if needed)
  const labels = ['Pending', 'Completed', 'Refunded']

  const options: ApexOptions = {
    legend: { show: false },
    stroke: { width: 5, colors: ['var(--mui-palette-background-paper)'] },
    grid: {
      padding: {
        top: 10,
        left: 0,
        right: 0,
        bottom: 13
      }
    },
    colors: [
      'var(--mui-palette-warning-main)', // Pending - yellow/orange
      'var(--mui-palette-success-main)', // Completed - green
      'var(--mui-palette-error-main)',   // Refunded - red
    ],
    labels: labels,
    tooltip: {
      y: {
        formatter: (val: number) => {
          // Value is absolute, show also percentage if possible
          if (!total) return `${val}`
          const percent = ((val / total) * 100).toFixed(1)
          return `${val} (${percent}%)`
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: false },
            total: {
              label: '',
              show: true,
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--mui-palette-text-secondary)',
              // Show total orders in the center
              formatter: () =>
                typeof overviewData?.totalOrders === 'number'
                  ? `${overviewData.totalOrders} `
                  : '0'
            },
            value: {
              offsetY: 6,
              fontWeight: 600,
              fontSize: '0.9375rem',
              formatter: (val: any) => `${val}`,
              color: 'var(--mui-palette-text-primary)'
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 1309,
        options: {
          plotOptions: {
            pie: {
              offsetY: 20
            }
          }
        }
      },
      {
        breakpoint: 900,
        options: {
          plotOptions: {
            pie: {
              offsetY: 0
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          chart: {
            height: 165
          }
        }
      }
    ]
  }

  // Calculate growth, fallback to 0 if missing
  const growth =
    typeof orders?.growth === 'number'
      ? orders.growth
      : 0

  // Color for positive/negative growth
  const growthColor = growth > 0 ? 'success.main' : (growth < 0 ? 'error.main' : 'text.secondary')
  // Format growth with percent sign, always show sign for clarity
  const formattedGrowth =
    growth > 0 ? `+${growth}%`
    : growth < 0 ? `${growth}%`
    : '0%'

  // Show thisMonth orders in headline
  const thisMonthOrders = typeof orders?.thisMonth === 'number' ? orders.thisMonth : 0

  return (
    <Card className='bs-full'>
      <CardContent className='pbe-0'>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>{thisMonthOrders}</Typography>
          <Typography color={growthColor}>{formattedGrowth}</Typography>
        </div>
        <Typography variant='subtitle1'>This Month Orders</Typography>
        <AppReactApexCharts type='donut' height={127} width='100%' options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default DonutChart
