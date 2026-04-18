'use client'

import { useEffect, useMemo, useState } from 'react'
import type { SyntheticEvent } from 'react'

import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import { useSelector } from 'react-redux'

import CustomAvatar from '@core/components/mui/Avatar'

import { useDashboardEcommerceHighlights } from '@/api/admin/dashboard'
import type { RootState } from '@/redux-store'

import tableStyles from '@core/styles/table.module.css'

type HighlightType = {
  categoryId: string
  categoryName: string
  revenue: number
  orderCount: number
  totalViews: number
  image: string | null
  topProduct: {
    productId: string
    productName: string
    revenue: number
    orderCount: number
    views: number
    image: string | null
  } | null
}

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('en', { maximumFractionDigits: value >= 1000 ? 0 : 2 }).format(value)} Br`

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

const TopReferralSources = () => {
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)
  const { data, isLoading } = useDashboardEcommerceHighlights(shop?.[0]?.id, 4)

  const categories = useMemo<HighlightType[]>(() => {
    return Array.isArray(data?.categoryHighlights) ? data.categoryHighlights : []
  }, [data])

  const [value, setValue] = useState<string>('')

  useEffect(() => {
    if (!value && categories[0]?.categoryId) {
      setValue(categories[0].categoryId)
    }
  }, [categories, value])

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader title='Top Categories' subheader='Parent categories with their best-selling product' />
        <div className='p-5'>
          <div className='flex gap-4 overflow-hidden pb-4'>
            {[0, 1, 2].map(item => (
              <Skeleton key={item} variant='rounded' width={120} height={86} animation={false} />
            ))}
          </div>
          <Skeleton variant='rounded' height={190} animation={false} />
        </div>
      </Card>
    )
  }

  if (!categories.length) {
    return (
      <Card>
        <CardHeader title='Top Categories' subheader='Parent categories with their best-selling product' />
        <div className='p-6'>
          <Typography color='text.secondary'>No category sales data is available yet.</Typography>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Top Categories' subheader='Parent categories with their best-selling product' />
      <TabContext value={value || categories[0].categoryId}>
        <TabList
          variant='scrollable'
          scrollButtons='auto'
          onChange={handleChange}
          aria-label='top categories tabs'
          className='!border-be-0 pli-5'
          sx={{
            '& .MuiTab-root:not(:last-child)': { mr: 4 },
            '& .MuiTab-root:hover': { border: 0 },
            '& .MuiTabs-indicator': { display: 'none !important' }
          }}
        >
          {categories.map(category => (
            <Tab
              key={category.categoryId}
              disableRipple
              value={category.categoryId}
              className='p-0'
              label={
                <Avatar
                  variant='rounded'
                  src={category.image ?? undefined}
                  className='is-[120px] bs-[86px] border border-dashed border-[var(--mui-palette-divider)] bg-transparent rounded'
                >
                  <Typography variant='subtitle2' className='px-3 text-center'>
                    {category.categoryName}
                  </Typography>
                </Avatar>
              }
            />
          ))}
        </TabList>

        {categories.map(category => (
          <TabPanel key={category.categoryId} sx={{ p: 0 }} value={category.categoryId}>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead className='border-be border-bs'>
                  <tr>
                    <th className='uppercase bg-transparent'>Product</th>
                    <th className='uppercase bg-transparent'>Category</th>
                    <th className='uppercase bg-transparent text-end'>Orders</th>
                    <th className='uppercase bg-transparent text-end'>Revenue</th>
                    <th className='uppercase bg-transparent text-end'>Views</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className='flex items-center gap-3'>
                        <CustomAvatar
                          variant='rounded'
                          src={category.topProduct?.image ?? category.image ?? undefined}
                          alt={category.topProduct?.productName ?? category.categoryName}
                          size={42}
                        >
                          {(category.topProduct?.productName ?? category.categoryName).slice(0, 1)}
                        </CustomAvatar>
                        <div className='flex flex-col'>
                          <Typography color='text.primary' className='font-medium'>
                            {category.topProduct?.productName ?? 'No product'}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Best seller in this parent category
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Chip label={category.categoryName} color='primary' size='small' variant='tonal' />
                    </td>
                    <td className='text-end font-medium'>
                      {formatCompactNumber(category.topProduct?.orderCount ?? category.orderCount)}
                    </td>
                    <td className='text-end font-medium'>{formatCurrency(category.topProduct?.revenue ?? category.revenue)}</td>
                    <td className='text-end font-medium'>
                      {formatCompactNumber(category.topProduct?.views ?? category.totalViews)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabPanel>
        ))}
      </TabContext>
    </Card>
  )
}

export default TopReferralSources
