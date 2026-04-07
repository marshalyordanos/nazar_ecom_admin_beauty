// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Type Imports
import type { ThemeColor } from '@core/types'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Types
type DataType = {
  icon: string
  stats: string | number
  title: string
  color: ThemeColor
}

type ProductSummaryType = {
  totalProducts?: number
  byStatus?: { [key: string]: number }
  active?: number
  draft?: number
  archived?: number
}

const getData = (summary?: ProductSummaryType): DataType[] => [
  {
    stats: summary?.totalProducts ?? '-',
    color: 'primary',
    title: 'Total Products',
    icon: 'ri-user-star-line',
  },
  {
    stats: summary?.active ?? '-',
    color: 'warning',
    icon: 'ri-pie-chart-2-line',
    title: 'Active Products',
  },
  {
    color: 'info',
    stats: summary?.draft ?? '-',
    title: 'Draft Products',
    icon: 'ri-arrow-left-right-line',
  },
  // To show archived as an additional metric, uncomment below:
  // {
  //   color: 'secondary',
  //   stats: summary?.archived ?? '-',
  //   title: 'Archived Products',
  //   icon: 'ri-archive-line',
  // },
]

const Sales = ({ isLoading, productSummary }: { isLoading: boolean, productSummary: any }) => {
  const data = getData(productSummary)
  return (
    <Card className='bs-full'>
      <CardHeader
        title='Product Overview'
        action={<OptionMenu options={['Refresh', 'Share', 'Update']} />}
        subheader={
          <div className='flex items-center gap-2'>
            <span>Total {productSummary?.totalProducts ?? 0} Products</span>
            <span className='flex items-center text-success font-medium'>
              +{productSummary?.active !== undefined && productSummary?.totalProducts !== undefined
                ? `${Math.round(
                    (productSummary.active / (productSummary.totalProducts || 1)) * 100
                  )}% Active`
                : '—'}
              <i className='ri-arrow-up-s-line text-xl' />
            </span>
          </div>
        }
      />
      <CardContent>
        <div className='flex flex-wrap justify-between gap-4'>
          {data.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color={item.color}>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{item.stats}</Typography>
                <Typography>{item.title}</Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default Sales
