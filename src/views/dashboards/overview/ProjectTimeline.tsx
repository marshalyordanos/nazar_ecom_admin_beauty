'use client'

// Next Imports
import { useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import { useSelector } from 'react-redux'

import OptionMenu from '@core/components/option-menu'
import { useDashboardSalesTrends } from '@/api/admin/dashboard'
import type { RootState } from '@/redux-store'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const DISPLAY_LAST_DAYS = 30
const DISPLAY_LAST_MONTHS = 12

type TrendPoint = {
  period: string
  revenue?: number
  pendingPayments?: number
  pendingAmount?: number
  completedPayments?: number
  failedPayments?: number
  failedAmount?: number
  refundedPayments?: number
  refundedAmount?: number
  cancelledOrders?: number
}

function formatBirr(n: number): string {
  if (!Number.isFinite(n)) return '0 Br'
  const r = Math.round(n)
  return `${r.toLocaleString()} Br`
}

function defaultYearOptions(): number[] {
  const y = new Date().getFullYear()
  return [y, y - 1, y - 2, y - 3, y - 4]
}

const ProjectTimeline = () => {
  const shops = useSelector((state: RootState) => state.shopReducer.shops) as { id?: string }[]
  const shopId = Array.isArray(shops) && shops.length > 0 ? shops[0]?.id : undefined

  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day')
  const [chartType, setChartType] = useState<'mixed' | 'bar'>('mixed')
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear())

  const { data: salesTrends, isLoading, isError, error, refetch } = useDashboardSalesTrends(shopId, groupBy, {
    enabled: !!shopId,
    year: selectedYear,
    days: 400,
  })

  const theme = useTheme()

  const availableYears = useMemo(() => {
    const fromApi = salesTrends?.availableYears
    if (Array.isArray(fromApi) && fromApi.length > 0) {
      return fromApi.map(Number).sort((a, b) => b - a)
    }
    return defaultYearOptions()
  }, [salesTrends?.availableYears])

  useEffect(() => {
    if (!Array.isArray(salesTrends?.availableYears) || salesTrends.availableYears.length === 0) return
    const ys = new Set(salesTrends.availableYears.map(Number))
    if (!ys.has(selectedYear)) {
      const best = Math.max(...salesTrends.availableYears.map(Number))
      setSelectedYear(best)
    }
  }, [salesTrends?.availableYears, selectedYear])

  const rawPoints = useMemo(() => {
    const arr: TrendPoint[] = Array.isArray(salesTrends?.series) ? salesTrends.series : []
    return arr
  }, [salesTrends])

  const displayPoints = useMemo(() => {
    if (!rawPoints.length) return []
    if (groupBy === 'day') return rawPoints.slice(-DISPLAY_LAST_DAYS)
    return rawPoints.slice(-DISPLAY_LAST_MONTHS)
  }, [rawPoints, groupBy])

  const hasNumericData = useMemo(() => {
    return displayPoints.some(
      p =>
        Number(p.revenue ?? 0) !== 0 ||
        Number(p.pendingPayments ?? 0) !== 0 ||
        Number(p.completedPayments ?? 0) !== 0 ||
        Number(p.failedPayments ?? 0) !== 0 ||
        Number(p.refundedPayments ?? 0) !== 0 ||
        Number(p.cancelledOrders ?? 0) !== 0
    )
  }, [displayPoints])

  const { maxRevenue, maxCount } = useMemo(() => {
    let mr = 0
    let mc = 0
    for (const p of displayPoints) {
      mr = Math.max(mr, Number(p.revenue ?? 0))
      mc = Math.max(
        mc,
        Number(p.pendingPayments ?? 0),
        Number(p.completedPayments ?? 0),
        Number(p.failedPayments ?? 0),
        Number(p.refundedPayments ?? 0),
        Number(p.cancelledOrders ?? 0)
      )
    }
    return { maxRevenue: mr, maxCount: mc }
  }, [displayPoints])

  const categories = useMemo(() => {
    return displayPoints.map((p: TrendPoint) => {
      if (groupBy === 'day') {
        const d = new Date(`${p.period}T12:00:00`)
        if (Number.isNaN(d.getTime())) return p.period
        return d.toISOString().slice(0, 10)
      }
      if (groupBy === 'month') return p.period
      return p.period
    })
  }, [displayPoints, groupBy])

  const apexSeries = useMemo(() => {
    const rev = displayPoints.map(p => Number(p.revenue ?? 0))
    const pend = displayPoints.map(p => Number(p.pendingPayments ?? 0))
    const comp = displayPoints.map(p => Number(p.completedPayments ?? 0))
    const cancel = displayPoints.map(p => Number(p.cancelledOrders ?? 0))
    const fail = displayPoints.map(p => Number(p.failedPayments ?? 0))
    const refd = displayPoints.map(p => Number(p.refundedPayments ?? 0))

    if (chartType === 'bar') {
      return [
        { name: 'Revenue (ETB)', data: rev },
        { name: 'Pending payments', data: pend },
        { name: 'Completed payments', data: comp },
        { name: 'Cancelled orders', data: cancel },
        { name: 'Failed payments', data: fail },
        { name: 'Refunded payments', data: refd },
      ]
    }

    return [
      { name: 'Revenue (ETB)', type: 'column' as const, data: rev },
      { name: 'Pending payments', type: 'line' as const, data: pend },
      { name: 'Completed payments', type: 'line' as const, data: comp },
      { name: 'Cancelled orders', type: 'line' as const, data: cancel },
      { name: 'Failed payments', type: 'line' as const, data: fail },
      { name: 'Refunded payments', type: 'line' as const, data: refd },
    ]
  }, [displayPoints, chartType])

  const options: ApexOptions = useMemo(() => {
    const isBar = chartType === 'bar'
    const pointsRef = displayPoints
    const catsRef = categories

    return {
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false },
        type: isBar ? 'bar' : 'line',
        stacked: false,
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        custom: (opts: any) => {
          const i = opts.dataPointIndex as number
          if (i < 0 || !pointsRef[i]) return ''
          const pt = pointsRef[i]
          const label = catsRef[i] ?? pt.period
          const rows = [
            `<div style="font-weight:600;margin-bottom:6px">${label}</div>`,
            `<div><span style="color:#2563eb">●</span> Paid revenue: <b>${formatBirr(Number(pt.revenue ?? 0))}</b> <span style="opacity:.85">(${Number(pt.completedPayments ?? 0)} payments)</span></div>`,
            `<div><span style="color:#f59e0b">●</span> Pending: <b>${Number(pt.pendingPayments ?? 0)}</b> <span style="opacity:.85">(${formatBirr(Number(pt.pendingAmount ?? 0))})</span></div>`,
            `<div><span style="color:#dc2626">●</span> Cancelled orders: <b>${Number(pt.cancelledOrders ?? 0)}</b></div>`,
            `<div><span style="color:#7c3aed">●</span> Failed: <b>${Number(pt.failedPayments ?? 0)}</b> <span style="opacity:.85">(${formatBirr(Number(pt.failedAmount ?? 0))})</span></div>`,
            `<div><span style="color:#64748b">●</span> Refunded: <b>${Number(pt.refundedPayments ?? 0)}</b> <span style="opacity:.85">(${formatBirr(Number(pt.refundedAmount ?? 0))})</span></div>`,
          ]
          return `<div style="padding:10px 12px;font-size:12px;line-height:1.45">${rows.join('')}</div>`
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: isBar ? '55%' : '42%',
          borderRadius: isBar ? 4 : 6,
          dataLabels: { position: 'top' },
        },
      },
      stroke: {
        width: isBar ? 0 : [0, 3, 3, 3, 3, 3],
        curve: 'smooth',
      },
      markers: {
        size: isBar ? 0 : [0, 5, 5, 5, 5, 5],
        strokeWidth: isBar ? 0 : 2,
        hover: { size: isBar ? 0 : 6 },
      },
      colors: ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#7c3aed', '#64748b'],
      dataLabels: {
        enabled: true,
        offsetY: isBar ? -4 : -8,
        style: { fontSize: '10px', fontWeight: 600, colors: ['#334155'] },
        formatter: (val: number, opts: any) => {
          const si = opts.seriesIndex as number
          if (si === 0) return val > 0 ? formatBirr(val) : ''
          const n = Math.round(Number(val))
          return n > 0 ? String(n) : ''
        },
      },
      states: {
        hover: { filter: { type: 'none' } },
        active: { filter: { type: 'none' } },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: theme.direction === 'rtl' ? 'right' : 'left',
        fontSize: '12px',
      },
      grid: {
        strokeDashArray: 6,
        borderColor: 'var(--mui-palette-divider)',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: {
          top: 22,
          left: 12,
          right: 12,
          bottom: 8,
        },
      },
      xaxis: {
        type: 'category',
        categories,
        tickPlacement: 'on',
        axisTicks: { show: false },
        axisBorder: { show: false },
        labels: {
          style: {
            colors: 'var(--mui-palette-text-disabled)',
            fontSize: '10px',
          },
          rotate: -45,
          trim: true,
          hideOverlappingLabels: true,
        },
      },
      yaxis: [
        {
          seriesName: 'Revenue (ETB)',
          min: 0,
          max: maxRevenue > 0 ? maxRevenue * 1.08 : 1,
          title: { text: 'Revenue (ETB)', style: { fontSize: '11px' } },
          labels: {
            formatter: (val: number) => {
              if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
              if (val >= 1_000) return `${(val / 1_000).toFixed(1)}k`
              return String(Math.round(val))
            },
          },
        },
        {
          opposite: true,
          seriesName: [
            'Pending payments',
            'Completed payments',
            'Cancelled orders',
            'Failed payments',
            'Refunded payments',
          ],
          min: 0,
          max: maxCount > 0 ? Math.max(3, Math.ceil(maxCount * 1.15)) : 1,
          decimalsInFloat: 0,
          title: { text: 'Payment & order counts', style: { fontSize: '11px' } },
          labels: {
            formatter: (val: number) => String(Math.round(Number(val))),
          },
        },
      ],
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { animations: { speed: 300 } },
            legend: { position: 'bottom', horizontalAlign: 'center' },
          },
        },
      ],
    } as ApexOptions
  }, [categories, theme.direction, chartType, maxRevenue, maxCount, displayPoints])

  const chartTopType = chartType === 'bar' ? 'bar' : 'line'

  const rangeHint =
    groupBy === 'day'
      ? `Showing latest ${DISPLAY_LAST_DAYS} days in ${selectedYear}`
      : `Showing latest ${DISPLAY_LAST_MONTHS} months in ${selectedYear}`

  return (
    <Card>
      <CardHeader
        title='Revenue & payments'
        subheader={`${rangeHint}. Bars: ETB amounts. Lines: payment / order counts (hover for full detail).`}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <FormControl size='small' sx={{ minWidth: 100 }}>
              <InputLabel id='sales-trend-year'>Year</InputLabel>
              <Select
                labelId='sales-trend-year'
                label='Year'
                value={availableYears.includes(selectedYear) ? selectedYear : availableYears[0] ?? selectedYear}
                onChange={(e: SelectChangeEvent<number>) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map(y => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
              <ToggleButton value='mixed'>Bars + lines</ToggleButton>
              <ToggleButton value='bar'>All bars</ToggleButton>
            </ToggleButtonGroup>

            <OptionMenu
              options={[
                { text: 'Refresh', menuItemProps: { onClick: () => void refetch() } },
                'Update',
                'Share',
              ]}
            />
          </Box>
        }
      />
      <CardContent>
        {!shopId ? (
          <Alert severity='warning'>
            No shop selected. Load shops in the app (shop switcher) so dashboard metrics can load.
          </Alert>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isError ? (
          <Alert severity='error'>{error instanceof Error ? error.message : 'Failed to load trends'}</Alert>
        ) : !displayPoints.length || !hasNumericData ? (
          <Typography variant='body2' color='text.secondary'>
            No payment or order activity in {selectedYear} for this shop.
          </Typography>
        ) : (
          <AppReactApexCharts
            height={380}
            width='100%'
            type={chartTopType}
            series={apexSeries as any}
            options={options}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default ProjectTimeline
