'use client'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import Typography from '@mui/material/Typography'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import Skeleton from '@mui/material/Skeleton'
import type { TimelineProps } from '@mui/lab/Timeline'

import { useMemo } from 'react'

// Utility to format dates
function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff/3600) === 1 ? '' : 's'} ago`
  if (diff < 86400*7) return `${Math.floor(diff / 86400)} day${Math.floor(diff/86400) === 1 ? '' : 's'} ago`
  // fallback to full date
  return date.toLocaleDateString()
}

// Type helpers for safe data
type ActivityType = {
  type: string,
  data: any
}

const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const getTimelineDotColor = (activity: ActivityType) => {
  if (activity.type === 'inventory') {
    switch (activity.data.type) {
      case 'SALE':
        return 'success'
      case 'PURCHASE':
        return 'primary'
      case 'ADJUSTMENT':
        return 'info'
      default:
        return 'grey'
    }
  }
  if (activity.type === 'order') {
    if (activity.data.status === 'COMPLETED' || activity.data.status === 'PAID') {
      return 'success'
    }
    if (activity.data.status === 'PENDING') {
      return 'primary'
    }
    return 'grey'
  }
  return 'grey'
}

const getInventoryActivityText = (data: any) => {
  if (!data || !data.variant) return ''
  const type = data.type
  switch (type) {
    case 'SALE':
      return `Sold ${data.quantity} × ${data.variant.product?.name ?? ''} (${data.variant.sku})`
    case 'PURCHASE':
      return `Purchased ${data.quantity} × ${data.variant.product?.name ?? ''} (${data.variant.sku})`
    case 'ADJUSTMENT':
      return `Inventory adjusted (${data.variant.product?.name ?? ''} - ${data.variant.sku})`
    default:
      return `Inventory activity for ${data.variant.product?.name ?? ''} (${data.variant.sku})`
  }
}

const getOrderActivityText = (data: any) => {
  if (!data) return ''
  return `Order #${data.orderNumber} is ${data.status?.toLowerCase() ?? ''}`
}

// Skeleton loader for activity timeline
const SkeletonTimeline = () => {
  // Choose a typical loading quantity for skeletons
  const skeletonCount = 5
  return (
    <Timeline>
      {Array.from({ length: skeletonCount }).map((_, idx) => (
        <TimelineItem key={idx}>
          <TimelineSeparator>
            <TimelineDot>
              <Skeleton variant="circular" width={24} height={24} />
            </TimelineDot>
            {idx !== skeletonCount - 1 ? <TimelineConnector /> : null}
          </TimelineSeparator>
          <TimelineContent>
            <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
              <Skeleton variant="text" width={220} height={24} />
              <Skeleton variant="text" width={60} height={20} />
            </div>
            <Skeleton variant="text" width={180} height={20} className='mbe-2' />
            <div className='flex items-center gap-2.5 is-fit rounded-lg bg-actionHover plb-[5px] pli-2.5'>
              <Skeleton variant="rectangular" width={20} height={20} style={{ borderRadius: '4px' }} />
              <Skeleton variant="text" width={110} height={20} />
            </div>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

const ActivityTimeline = ({ isLoading, recentActivities }: { isLoading: boolean, recentActivities: any }) => {
  // Memoize sorted activities by date
  const activities = useMemo(() => {
    if (!Array.isArray(recentActivities)) return []
    // sort by createdAt descending
    return [...recentActivities].sort((a, b) => {
      const dateA = new Date(a.data?.createdAt || 0).getTime()
      const dateB = new Date(b.data?.createdAt || 0).getTime()
      return dateB - dateA
    })
  }, [recentActivities])

  return (
    <Card>
      <CardHeader title='Activity Timeline' />
      <CardContent className='pbs-2'>
        {isLoading ? (
          <SkeletonTimeline />
        ) : (
          <Timeline>
            {activities.map((activity: ActivityType, idx: number) => (
              <TimelineItem key={activity.data?.id || idx}>
                <TimelineSeparator>
                  <TimelineDot color={getTimelineDotColor(activity)} />
                  {idx !== activities.length - 1 ? <TimelineConnector /> : null}
                </TimelineSeparator>
                <TimelineContent>
                  <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                    <Typography className='font-medium' color='text.primary'>
                      {activity.type === 'inventory'
                        ? getInventoryActivityText(activity.data)
                        : activity.type === 'order'
                          ? getOrderActivityText(activity.data)
                          : 'Activity'
                      }
                    </Typography>
                    {activity.data?.createdAt && (
                      <Typography variant='caption'>{timeAgo(activity.data.createdAt)}</Typography>
                    )}
                  </div>
                  {activity.type === 'inventory' && (
                    <>
                      <Typography className='mbe-2'>
                        {activity.data.type === 'SALE'
                          ? `Inventory was reduced due to sale.`
                          : activity.data.type === 'PURCHASE'
                          ? `Stock was replenished by purchase.`
                          : activity.data.type === 'ADJUSTMENT'
                          ? `Stock count was manually adjusted.`
                          : null}
                      </Typography>
                      <div className='flex items-center gap-2.5 is-fit rounded-lg bg-actionHover plb-[5px] pli-2.5'>
                        {activity.data.variant?.image && typeof activity.data.variant.image === 'string' && (
                          <img
                            height={20}
                            style={{ borderRadius: '4px'}}
                            alt={activity.data.variant.product?.name || 'variant'}
                            src={activity.data.variant.image.startsWith('http') ? activity.data.variant.image : '/images/icons/pdf-document.png'}
                          />
                        )}
                        <Typography className='font-medium'>
                          {activity.data.variant?.product?.name || 'Product'} ({activity.data.variant?.sku || ''})
                        </Typography>
                      </div>
                    </>
                  )}

                  {activity.type === 'order' && (
                    <>
                      <Typography className='mbe-2'>
                        Order <span className='font-medium'>#{activity.data.orderNumber}</span> created with status <b>{activity.data.status}</b>.
                      </Typography>
                    </>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityTimeline
