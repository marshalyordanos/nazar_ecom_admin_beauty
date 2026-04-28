'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useState, useMemo } from 'react'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { useDashboardSalesTrends } from '@/api/admin/dashboard'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const ApexLineChart = () => {
  const shops = useSelector((state: RootState) => state.shopReducer.shops) as { id?: string }[]
  const shopId = Array.isArray(shops) && shops.length > 0 ? shops[0]?.id : undefined
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day')

  // Fetch sales trends data based on selected groupBy value (day or month)
  const { data: salesTrends } = useDashboardSalesTrends(shopId, groupBy, { enabled: !!shopId, days: 90 })

  // Vars
  const divider = 'var(--mui-palette-divider)'
  const disabledText = 'var(--mui-palette-text-disabled)'

  // Map salesTrends data to chart series and categories
  const { chartSeries, chartCategories } = useMemo(() => {
    // Fallback if salesTrends is missing or invalid
    const arr = Array.isArray(salesTrends?.series) ? salesTrends.series : []
    if (arr.length === 0) {
      return {
        chartSeries: [{ name: 'Revenue (ETB)', data: [] as number[] }],
        chartCategories: [] as string[],
      }
    }

    // When groupBy is 'day', format date as YYYY-MM-DD, show last 15 days, else groupBy 'month', show last 8 months
    let points: any[] = arr
    let categories: string[]

    if (groupBy === 'day') {
      points = arr.slice(-15)
      categories = points.map((p: any) => {
        const d = new Date(p.period)
        return `${d.getDate()}/${d.getMonth() + 1}`
      })
    } else {
      points = arr.slice(-8)
      categories = points.map((p: any) => {
        // p.period is "YYYY-MM"
        const [year, month] = p.period.split('-')
        return `${month}/${year}`
      })
    }
    return {
      chartSeries: [
        {
          name: 'Revenue (ETB)',
          data: points.map((p: any) => Number(p.revenue ?? 0)),
        },
      ],
      chartCategories: categories,
    }
  }, [salesTrends, groupBy])

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    colors: ['#ff9f43'],
    stroke: { curve: 'straight' },
    dataLabels: { enabled: false },
    markers: {
      strokeWidth: 7,
      strokeOpacity: 1,
      colors: ['#ff9f43'],
      strokeColors: ['#fff']
    },
    grid: {
      padding: { top: -10 },
      borderColor: divider,
      xaxis: {
        lines: { show: true }
      }
    },
    tooltip: {
      custom(data: any) {
        return `<div class='bar-chart'>
          <span>${data.series[data.seriesIndex][data.dataPointIndex]}</span>
        </div>`
      }
    },
    yaxis: {
      labels: {
        style: { colors: disabledText, fontSize: '13px' }
      }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: divider },
      crosshairs: {
        stroke: { color: divider }
      },
      labels: {
        style: { colors: disabledText, fontSize: '13px' }
      },
      categories: chartCategories
    }
  }

  return (
    <Card>
      <CardHeader
        title='Sales Trends'
        subheader='Sales trends by day or month'
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] }
        }}
        action={
          <ToggleButtonGroup
            exclusive
            size="small"
            value={groupBy}
            onChange={(_, val) => { if (val) setGroupBy(val); }}
            color="primary"
            sx={{ ml: 2 }}
          >
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <CardContent>
        <AppReactApexCharts type='line' width='100%' height={400} options={options} series={chartSeries} />
      </CardContent>
    </Card>
  )
}

export default ApexLineChart
