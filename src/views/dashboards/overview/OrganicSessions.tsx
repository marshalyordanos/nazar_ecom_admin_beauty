'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import { useDashboardPaymentSummary } from '@/api/admin/dashboard'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const OrganicSessions = ({ paymentSummary }: { paymentSummary: any }) => {

  const theme = useTheme()

  // Map paymentSummary to data for the donut chart
  // We'll display Paid, Refunded, Pending, Failed in a fixed order
  // Fallback to 0 if missing
  const paid = typeof paymentSummary?.paid === "number" ? paymentSummary.paid : 0
  const refunded = typeof paymentSummary?.refunded === "number" ? paymentSummary.refunded : 0
  const pending = typeof paymentSummary?.pending === "number" ? paymentSummary.pending : 0
  const failed = typeof paymentSummary?.failed === "number" ? paymentSummary.failed : 0

  // Aggregate series and labels for payment types
  const series = [paid, refunded, pending, failed] // order: Paid, Refunded, Pending, Failed
  const labels = ["Paid", "Refunded", "Pending", "Failed"]

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    colors: [
      'var(--mui-palette-warning-main)', // Paid
      'rgba(var(--mui-palette-warning-mainChannel) / 0.8)', // Refunded
      'rgba(var(--mui-palette-warning-mainChannel) / 0.6)', // Pending
      'rgba(var(--mui-palette-warning-mainChannel) / 0.4)' // Failed
    ],
    grid: {
      padding: {
        bottom: -30
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '15px',
      offsetY: 5,
      itemMargin: {
        horizontal: 28,
        vertical: 6
      },
      labels: {
        colors: 'var(--mui-palette-text-secondary)'
      },
      markers: {
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 4 : -1,
        width: 10,
        height: 10
      }
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: { width: 4, lineCap: 'round', colors: ['var(--mui-palette-background-paper)'] },
    labels: labels,
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
        endAngle: 130,
        startAngle: -130,
        customScale: 0.9,
        donut: {
          size: '83%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.9375rem',
              color: 'var(--mui-palette-text-secondary)'
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '1.75rem',
              formatter: value => `${value} Br.`,
              color: 'var(--mui-palette-text-primary)'
            },
            total: {
              show: true,
              label: '2022',
              fontSize: '1rem',
              color: 'var(--mui-palette-text-secondary)',
              formatter: value => `${value.globals.seriesTotals.reduce((total: number, num: number) => total + num)} Br.`
            }
          }
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader
        title='Payment Summary'
        action={<OptionMenu options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      />
      <CardContent>
        <AppReactApexCharts type='donut' height={373} width='100%' options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default OrganicSessions
