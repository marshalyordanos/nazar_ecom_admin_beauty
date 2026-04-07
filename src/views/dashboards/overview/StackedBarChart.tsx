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

// Helper to format currency values
const formatCurrency = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) return '$0'
  // Show as $x.xk if > 999
  if (value >= 1000 || value <= -1000) {
    return `$${(value / 1000).toFixed(1)}k`
  }
  return `$${value}`
}

// Helper to format percentage, e.g. 18% or -18%
const formatPercentage = (value: number) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%'
  // Show max 1 decimal if not integer
  return `${Math.round(value * 10) / 10}%`
}

const StackedBarChart = ({ data={thisMonth:10,prevMonth:20,growth:-50} }: any) => {
  // Hooks
  const theme = useTheme()
  console.log(data,'data--')
  // Fallback to 0 if no input
  const thisMonth = typeof data?.thisMonth === 'number' ? data.thisMonth : 0
  const prevMonth = typeof data?.prevMonth === 'number' ? data.prevMonth : 0

  // Calculate growth percentage. If data.growth provided, use it, else calculate
  // ((thisMonth - prevMonth) / Math.abs(prevMonth)) * 100
  let growth: number = 0
  if (typeof data?.growth === 'number') {
    growth = data.growth
  } else if (typeof prevMonth === 'number' && prevMonth !== 0) {
    growth = ((thisMonth - prevMonth) / Math.abs(prevMonth)) * 100
  }

  // Chart expects categories, so we provide ["Previous Month", "This Month"]
  const categories = ['Previous Month', 'This Month']

  // Series for Earning (show both months), Expense is unused but kept for reusability
  const series = [
    {
      name: 'Earning',
      data: [prevMonth, thisMonth]
    }
    // Expense series could be added here if required for future expansion
  ]
  
  const options: ApexOptions = {
    chart: {
      stacked: true,
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: {
        enabled: false
      }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 5,
      colors: ['var(--mui-palette-background-paper)']
    },
    colors: ['var(--mui-palette-text-primary)', 'var(--mui-palette-error-main)'],
    plotOptions: {
      bar: {
        borderRadius: 7,
        columnWidth: '65%',
        borderRadiusApplication: 'around',
        borderRadiusWhenStacked: 'all'
      }
    },
    grid: {
      padding: {
        top: -35,
        left: -30,
        right: -18,
        bottom: -25
      },
      yaxis: {
        lines: { show: false }
      }
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      categories,
      labels: { show: false },
      axisTicks: { show: false },
      crosshairs: { opacity: 0 },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.xl,
        options: {
          plotOptions: {
            bar: { borderRadius: 6 }
          }
        }
      },
      {
        breakpoint: 1380,
        options: {
          plotOptions: {
            bar: { columnWidth: '90%', borderRadius: 5 }
          }
        }
      },
      {
        breakpoint: 1201,
        options: {
          plotOptions: {
            bar: { columnWidth: '75%', borderRadius: 6 }
          }
        }
      },
      {
        breakpoint: 1100,
        options: {
          plotOptions: {
            bar: { columnWidth: '80%' }
          }
        }
      },
      {
        breakpoint: 1000,
        options: {
          plotOptions: {
            bar: { borderRadius: 5 }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          plotOptions: {
            bar: { columnWidth: '65%', borderRadius: 6 }
          }
        }
      },
      {
        breakpoint: 800,
        options: {
          plotOptions: {
            bar: { columnWidth: '75%' }
          }
        }
      },
      {
        breakpoint: 700,
        options: {
          plotOptions: {
            bar: { columnWidth: '90%', borderRadius: 5 }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          chart: {
            height: 124
          },
          plotOptions: {
            bar: { columnWidth: '27%', borderRadius: 9 }
          }
        }
      },
      {
        breakpoint: 450,
        options: {
          plotOptions: {
            bar: { columnWidth: '32%', borderRadius: 8 }
          }
        }
      }
    ]
  }

  // decide color for percentage: green for positive, red for negative
  const percentColor = growth >= 0 ? 'success.main' : 'error.main'

  // label for profit: could stay as 'Total Profit', or use something more dynamic based on the metric
  return (
    <Card className='bs-full flex flex-col'>
      <CardContent>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>{formatCurrency(thisMonth)}</Typography>
          <Typography color={percentColor}>
            {growth >= 0 ? '+' : ''}
            {formatPercentage(growth)}
          </Typography>
        </div>
        <div className='flex flex-col'>
          <Typography variant='subtitle1'>Total Profit</Typography>
          <div style={{ fontSize: 13, color: 'var(--mui-palette-text-secondary)' }}>
            Prev: {formatCurrency(prevMonth)}
          </div>
        </div>
      </CardContent>
      <CardContent className='flex grow items-center'>
        <AppReactApexCharts type='bar' height={84} width='100%' options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default StackedBarChart
