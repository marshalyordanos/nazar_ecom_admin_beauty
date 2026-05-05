// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

export type UserDataType = {
  title: string
  stats: string
  avatarIcon: string
  avatarColor?: ThemeColor
  trend: string
  trendNumber?: string
  subtitle: string
}

const HorizontalWithSubtitle = (props: UserDataType) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))

  const { title, stats, avatarIcon, avatarColor, trend: trend, trendNumber: trendNumber, subtitle: subtitle } = props

  return (
    <Card sx={isXs ? { '& .MuiCardContent-root': { py: 1.5, px: 2 } } : undefined}>
      <CardContent className='flex justify-between gap-1 items-start'>
        <div className={classnames('flex flex-col grow min-w-0', isXs ? 'gap-0.5' : 'gap-1')}>
          <Typography
            color='text.primary'
            variant={isXs ? 'caption' : 'body1'}
            className='font-semibold truncate'
          >
            {title}
          </Typography>
          <div className='flex items-baseline gap-1 flex-wrap'>
            <Typography variant={isXs ? 'h6' : 'h4'} className='font-semibold'>
              {stats}
            </Typography>
            {trendNumber ? (
              <Typography
                component='span'
                variant='caption'
                color={trend === 'negative' ? 'error.main' : 'success.main'}
              >
                {`(${trend === 'negative' ? '-' : '+'}${trendNumber})`}
              </Typography>
            ) : null}
          </div>
          <Typography
            variant={isXs ? 'caption' : 'body2'}
            color='text.secondary'
            sx={
              isXs
                ? {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }
                : undefined
            }
          >
            {subtitle}
          </Typography>
        </div>
        <CustomAvatar color={avatarColor} skin='light' variant='rounded' size={isXs ? 34 : 42}>
          <i className={classnames(avatarIcon, isXs ? 'text-xl' : 'text-[26px]')} />
        </CustomAvatar>
      </CardContent>
    </Card>
  )
}

export default HorizontalWithSubtitle
