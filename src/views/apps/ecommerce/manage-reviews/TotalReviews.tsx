'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

type DataType = {
  rating: number
  value: number
}

type Props = {
  averageRating?: number
  totalReviews?: number
  thisWeekDelta?: number
  distribution?: DataType[]
  isLoading?: boolean
  isError?: boolean
}

// Vars
const totalReviewsData: DataType[] = [
  { rating: 5, value: 109 },
  { rating: 4, value: 40 },
  { rating: 3, value: 18 },
  { rating: 2, value: 12 },
  { rating: 1, value: 8 }
]

const TotalReviews = (props: Props) => {
  // Hooks
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const avg = typeof props.averageRating === 'number' ? props.averageRating : 4.89
  const total = typeof props.totalReviews === 'number' ? props.totalReviews : 187
  const weekDelta = typeof props.thisWeekDelta === 'number' ? props.thisWeekDelta : 5
  const data = props.distribution && props.distribution.length ? props.distribution : totalReviewsData
  const denom = data.reduce((acc, x) => acc + (x.value || 0), 0) || 1

  return (
    <Card>
      <CardContent>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <div className='flex flex-col items-start gap-2 is-full sm:is-6/12'>
            <div className='flex items-center gap-2'>
              <Typography variant='h3' color='primary.main'>
                {avg.toFixed(2)}
              </Typography>
              <i className='ri-star-smile-line text-[32px] text-primary' />
            </div>
            <Typography className='font-medium' color='text.primary'>
              Total {total} reviews
            </Typography>
            <Typography>All reviews are from genuine customers</Typography>
            <Chip label={`+${weekDelta} This week`} variant='tonal' size='small' color='primary' />
          </div>
          <Divider orientation={isSmallScreen ? 'horizontal' : 'vertical'} flexItem />
          <div className='flex flex-col gap-3 is-full sm:is-6/12'>
            {data.map((item, index) => (
              <div key={index} className='flex items-center gap-2'>
                <Typography variant='body2' className='text-nowrap'>
                  {item.rating} Star
                </Typography>
                <LinearProgress
                  color='primary'
                  value={Math.floor((item.value / denom) * 100)}
                  variant='determinate'
                  className='bs-2 is-full'
                />
                <Typography variant='body2'>{item.value}</Typography>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TotalReviews
