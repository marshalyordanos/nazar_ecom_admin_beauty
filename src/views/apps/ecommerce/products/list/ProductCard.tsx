'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import CircularProgress from '@mui/material/CircularProgress'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'

// Iconify for icons
import { Icon } from '@iconify/react'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { useProductSummary } from '@/api/products/useProductSummary'
import { RootState } from '@/redux-store'
import { useSelector } from 'react-redux'

type CardStat = {
  title: string
  value: number
  icon: string
  color: string
}

const PRODUCT_CARDS: CardStat[] = [
  {
    title: 'Total Products',
    value: 0,
    icon: 'mdi:package-variant-closed',
    color: '#0288d1', // blue (info)
  },
  {
    title: 'Active',
    value: 0,
    icon: 'mdi:check-circle-outline',
    color: '#43a047', // green (success)
  },
  {
    title: 'Draft',
    value: 0,
    icon: 'mdi:file-document-outline',
    color: '#ffc107', // amber (warning)
  },
  {
    title: 'Archived',
    value: 0,
    icon: 'mdi:archive-outline',
    color: '#e53935', // red (error)
  },
];

const ProductCard = () => {
  const shop:any = useSelector((state: RootState) => state.shopReducer.shops)
  console.log("shop id ", shop)
  const { data: productSummary, isLoading } = useProductSummary(shop[0]?.id)
  // Hooks
  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  // Build card data with summary values
  const data: CardStat[] = productSummary
    ? [
        {
          ...PRODUCT_CARDS[0],
          value: productSummary.totalProducts ?? 0
        },
        {
          ...PRODUCT_CARDS[1],
          value: productSummary.active ?? 0
        },
        {
          ...PRODUCT_CARDS[2],
          value: productSummary.draft ?? 0
        },
        {
          ...PRODUCT_CARDS[3],
          value: productSummary.archived ?? 0
        },
      ]
    : PRODUCT_CARDS

  return (
    <Card>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <CircularProgress />
          </div>
        ) : (
          <Grid container spacing={6}>
            {data.map((item, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                key={item.title}
                className={classnames({
                  '[&:nth-of-type(odd)>div]:pie-6 [&:nth-of-type(odd)>div]:border-ie': isBelowMdScreen && !isSmallScreen,
                  '[&:not(:last-child)>div]:pie-6 [&:not(:last-child)>div]:border-ie': !isBelowMdScreen
                })}
              >
                <div className='flex flex-col gap-1'>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-1'>
                      <Typography color="textSecondary">
                        {item.title}
                      </Typography>
                      <Typography variant='h4'>
                        {item.value}
                      </Typography>
                    </div>
                    <CustomAvatar variant='rounded' size={44} sx={{ backgroundColor: `${item.color}22` }}>
                      <Icon icon={item.icon} style={{ color: item.color, fontSize: 28 }} />
                    </CustomAvatar>
                  </div>
                </div>
                {isBelowMdScreen && !isSmallScreen && index < data.length - 2 && (
                  <Divider
                    className={classnames('mbs-6', {
                      'mie-6': index % 2 === 0
                    })}
                  />
                )}
                {isSmallScreen && index < data.length - 1 && <Divider className='mbs-6' />}
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}

export default ProductCard
