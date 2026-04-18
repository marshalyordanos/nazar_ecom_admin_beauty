'use client'

// Next Imports
import { useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import { useSelector } from 'react-redux'

import OptionMenu from '@core/components/option-menu'
import { useDashboardSalesTrends } from '@/api/admin/dashboard'
import type { RootState } from '@/redux-store'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const ProjectTimeline = () => {
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)

  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day')
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar')

  const { data: salesTrends } = useDashboardSalesTrends(shop?.[0]?.id, groupBy)

  const theme = useTheme()

  const points = useMemo(() => {
    const arr = Array.isArray(salesTrends?.series) ? salesTrends.series : []

    return arr.slice(-5)
  }, [salesTrends])

  const categories = useMemo(() => {
    return points.map((p: any) => {
      const date = new Date(p.period)

      if (groupBy === 'day') return date.toISOString().slice(0, 10)
      if (groupBy === 'month') return date.toISOString().slice(0, 7)

      return date.toISOString().slice(0, 10)
    })
  }, [points, groupBy])

  const series = useMemo(() => {
    return [
      {
        name: 'Revenue',
        data: points.map((p: any) => Number(p.revenue ?? 0))
      }
    ]
  }, [points])

  const options: ApexOptions = useMemo(() => {
    return {
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false }
      },
      tooltip: { enabled: true },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '40%', // slightly wider for better alignment
          borderRadius: 6
        }
      },
      stroke: {
        width: chartType === 'line' ? 3 : 2,
        curve: 'smooth'
      },
      markers: {
        size: chartType === 'line' ? 3 : 0,
        strokeWidth: chartType === 'line' ? 2 : 0,
        hover: { size: chartType === 'line' ? 4 : 0 }
      },
      colors: ['var(--mui-palette-primary-main)'],
      dataLabels: { enabled: false },
      states: {
        hover: { filter: { type: 'none' } },
        active: { filter: { type: 'none' } }
      },
      legend: { show: false },
      grid: {
        strokeDashArray: 6,
        borderColor: 'var(--mui-palette-divider)',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: {
          top: -2,
          left: 15,
          right: 30,
          bottom: 10
        }
      },
      xaxis: {
        type: 'category',
        categories,
        tickPlacement: 'on',
        tickAmount: categories.length,
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: {
          style: {
            colors: 'var(--mui-palette-text-disabled)',
            fontSize: '10px'
          },
          rotate: -45,
          trim: true,
          hideOverlappingLabels: true
        }
      },
      yaxis: {
        labels: {
          show: true,
          align: theme.direction === 'rtl' ? 'right' : 'left',
          style: {
            fontSize: '0.8125rem',
            colors: 'var(--mui-palette-text-primary)'
          }
        }
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { animations: { speed: 300 } }
          }
        }
      ]
    }
  }, [categories, theme.direction, chartType])

  return (
    <Card>
      <CardHeader
        title='Revenue Analysis'
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ToggleButtonGroup
              size='small'
              color='primary'
              exclusive
              value={groupBy}
              onChange={(_, v) => v && setGroupBy(v)}
            >
              <ToggleButton value='day'>Day</ToggleButton>
              <ToggleButton value='month'>Month</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              size='small'
              color='secondary'
              exclusive
              value={chartType}
              onChange={(_, v) => v && setChartType(v)}
            >
              <ToggleButton value='line'>Line</ToggleButton>
              <ToggleButton value='bar'>Bar</ToggleButton>
            </ToggleButtonGroup>

            <OptionMenu options={['Refresh', 'Update', 'Share']} />
          </Box>
        }
      />
      <CardContent>
        {series[0].data.length ? (
          <AppReactApexCharts
            height={315}
            width='100%'
            type={chartType}
            series={series as any}
            options={options}
          />
        ) : (
          <Typography variant='body2' color='text.secondary'>
            No data to display
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default ProjectTimeline