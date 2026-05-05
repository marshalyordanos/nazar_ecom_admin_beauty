// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Helper function to format number as currency with comma separators
const formatCurrency = (value: number) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Helper to compute total revenue and (optional) revenue change
const getSummary = (topProducts: any[]) => {
  const totalRevenue = topProducts?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0
  // For demo, static +12% and up arrow; real implementation could compare periods if data available
  return {
    totalRevenue,
    revenueChangePct: 12,
    isPositive: true
  }
}

const SKELETON_ROW_COUNT = 4

const SocialNetworkVisits = ({ topProducts }: { topProducts: any[] }) => {
  const { totalRevenue, revenueChangePct, isPositive } = getSummary(topProducts || [])

  // Always display at least 4, fill missing rows with skeletons
  const actualRows = Array.isArray(topProducts) ? topProducts : []
  const padCount = SKELETON_ROW_COUNT - actualRows.length
  const rows = [
    ...actualRows,
    ...Array.from({ length: padCount > 0 ? padCount : 0 }, () => null)
  ]

  return (
    <Card>
      <CardHeader
        title='Top Products'
        action={<OptionMenu options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      />
      <CardContent className='flex flex-col gap-6'>
        <div>
          <div className='flex items-center'>
            <Typography variant='h4'>
              {
                // If loading or no data at all, show skeleton, else show value
                rows[0] === null
                  ? <Skeleton variant='text' width={80} height={36} />
                  : `${formatCurrency(totalRevenue)} ETB`
              }
            </Typography>
            {
              rows[0] === null
                ? <Skeleton variant='circular' width={32} height={32} sx={{ ml: 1, mr: 1 }} />
                : (
                  <i
                    className={`${
                      isPositive
                        ? 'ri-arrow-up-s-line text-success'
                        : 'ri-arrow-down-s-line text-error'
                    } text-2xl`}
                  />
                )
            }
            <Typography color={isPositive ? 'success.main' : 'error.main'}>
              {rows[0] === null
                ? <Skeleton variant='text' width={30} height={24} />
                : `${revenueChangePct}%`}
            </Typography>
          </div>
          <Typography>Total Top Product Revenue</Typography>
        <div className='mt-5 p-0'></div>

        </div>
        <div className='flex flex-col gap-4 max-[1396px]:gap-6'>
          {rows.map((item, index) =>
            item ? (
              <div key={item.variantId || index} className='flex items-center gap-3'>
                {/* You can replace this with product images if available */}
                <div className='flex items-center justify-center w-[34px] h-[34px] bg-default rounded'>
                  <i className='ri-shopping-bag-3-line text-lg text-primary' />
                </div>
                <div className='flex flex-wrap justify-between items-center gap-x-2 gap-y-1 is-full'>
                  <div className='flex flex-col gap-0.5'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.productName}
                    </Typography>
                    <Typography>
                      Orders: {item.orderCount}
                    </Typography>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Typography color='text.primary' className='font-medium'>
                      {formatCurrency(item.revenue)} ETB
                    </Typography>
                    {/* Demo Chip: Show +/– if revenue above/below avg; here we show positive if revenue > 0 */}
                    <Chip
                      label={item.revenue > 0 ? `+${item.orderCount}` : `-${item.orderCount}`}
                      color={item.revenue > 0 ? 'success' : 'error'}
                      variant='tonal'
                      size='small'
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Skeleton row for missing data
              <div key={`skeleton-${index}`} className="flex items-center gap-3">
                <Skeleton variant="circular" width={34} height={34} />
                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1 is-full w-full">
                  <div className="flex flex-col gap-0.5 w-[120px] max-w-[120px]">
                    <Skeleton variant="text" width={100} height={16} />
                    <Skeleton variant="text" width={60} height={14} />
                  </div>
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <Skeleton variant="text" width={40} height={20} />
                    <Skeleton variant="rounded" width={32} height={24} />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SocialNetworkVisits
