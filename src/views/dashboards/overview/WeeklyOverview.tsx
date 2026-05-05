// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import { RootState } from '@/redux-store'
import { useSelector } from 'react-redux'
import { useDashboardBrands } from '@/api/admin/dashboard'
import { useState, useMemo } from 'react'

// Helper function to format number as currency with comma separators
const formatCurrency = (value: number) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Helper to compute total revenue and (optional) revenue change
const getSummary = (brands: any[]) => {
  const totalRevenue = brands?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0
  // For demo, static +12% and up arrow; real implementation could compare periods if data available
  return {
    totalRevenue,
    revenueChangePct: 12,
    isPositive: true
  }
}

const options = [
  { label: 'Last 7 Days', value: 7 },
  { label: 'Last Month', value: 30 },
  { label: 'Last Year', value: 365 }
]

const SKELETON_ROW_COUNT = 4

const TopBrands = () => {
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)
  const [selectedDays, setSelectedDays] = useState<number>(7)

  // refetches when shop or days change. Default 7 days.
  const { data: topBrandsRaw, isLoading } = useDashboardBrands(shop?.[0]?.id, selectedDays)
  const topBrands = Array.isArray(topBrandsRaw) ? topBrandsRaw : []
  const { totalRevenue, revenueChangePct, isPositive } = getSummary(topBrands)

  const rowCount = SKELETON_ROW_COUNT
  // Compute array for skeleton rows if less than rowCount, or skeletons if loading.
  const brandsToDisplay = useMemo(() => {
    if (isLoading) {
      // Show all skeleton rows
      return Array.from({ length: rowCount }, (_, i) => null)
    }
    // Pad with null for skeletons at end if less than rowCount
    const padCount = rowCount - topBrands.length
    return [
      ...topBrands,
      ...Array.from({ length: padCount > 0 ? padCount : 0 }, () => null)
    ]
  }, [isLoading, topBrands])

  // OptionMenu expects an `onChange` handler; assume custom OptionMenu supports value/label
  const handleChange = (selected: string) => {
    // Find corresponding days from label; fallback to 7 if not found.
    const found = options.find(opt => opt.label === selected)
    setSelectedDays(found?.value || 7)
  }

  return (
    <Card>
      <CardHeader
        title='Top Brands'
        action={
          <OptionMenu
            options={[
              { text: 'Last 7 Days',
                menuItemProps: {
                  onClick: () => handleChange('Last 7 Days')
                }
               },
              { text: 'Last Month',menuItemProps:{
                onClick: () => handleChange('Last Month')
              } },
              { text: 'Last Year',menuItemProps:{
                onClick: () => handleChange('Last Year')
              } }
            ]}
          />
        }
      />
      <CardContent className='flex flex-col gap-6'>
        <div>
          <div className='flex items-center'>
            <Typography variant='h4'>
              {isLoading
                ? <Skeleton variant='text' width={80} height={36} />
                : `${formatCurrency(totalRevenue)} ETB`}
            </Typography>
            {isLoading ? (
              <Skeleton variant='circular' width={32} height={32} sx={{ ml: 1, mr: 1 }} />
            ) : (
              <i
                className={`${
                  isPositive
                    ? 'ri-arrow-up-s-line text-success'
                    : 'ri-arrow-down-s-line text-error'
                } text-2xl`}
              />
            )}
            <Typography color={isPositive ? 'success.main' : 'error.main'}>
              {isLoading ? <Skeleton variant='text' width={30} /> : `${revenueChangePct}%`}
            </Typography>
          </div>
          <Typography>Total Top Brand Revenue</Typography>
        </div>
        <div className='flex flex-col gap-4 max-[1396px]:gap-6'>
          {brandsToDisplay.map((item: any, index: number) =>
            item ? (
              <div key={item.brandId || index} className='flex items-center gap-3'>
                <div className='flex items-center justify-center w-[34px] h-[34px] bg-default rounded'>
                  <i className='ri-shopping-bag-3-line text-lg text-primary' />
                </div>
                <div className='flex flex-wrap justify-between items-center gap-x-2 gap-y-1 is-full'>
                  <div className='flex flex-col gap-0.5'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.brandName}
                    </Typography>
                    <Typography>
                      Orders: {item.orderCount}
                    </Typography>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Typography color='text.primary' className='font-medium'>
                      {formatCurrency(item.revenue)} ETB
                    </Typography>
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
              <div key={`skeleton-row-${index}`} className='flex items-center gap-3'>
                <Skeleton variant='circular' width={34} height={34} />
                <div className='flex flex-wrap justify-between items-center gap-x-2 gap-y-1 is-full w-full'>
                  <div className='flex flex-col gap-0.5'>
                    <Skeleton variant='text' width={120} height={24} />
                    <Skeleton variant='text' width={60} height={18} />
                  </div>
                  <div className='flex items-center gap-2'>
                    <Skeleton variant='text' width={60} height={21} />
                    <Skeleton variant='rounded' width={44} height={26} />
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

export default TopBrands
