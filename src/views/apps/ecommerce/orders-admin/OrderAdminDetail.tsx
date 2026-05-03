'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { useAdminOrder } from '@/api/admin/orders'
import type { Locale } from '@/configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'

const orderStatusObj = {
  PENDING: { title: 'Pending', color: 'warning' },
  PAID: { title: 'Paid', color: 'info' },
  PROCESSING: { title: 'Processing', color: 'primary' },
  SHIPPED: { title: 'Shipped', color: 'info' },
  COMPLETED: { title: 'Completed', color: 'success' },
  CANCELLED: { title: 'Cancelled', color: 'error' },
  REFUNDED: { title: 'Refunded', color: 'secondary' }
} as const

const paymentStatusObj = {
  PENDING: { title: 'Pending', color: 'warning' },
  PAID: { title: 'Paid', color: 'success' },
  REFUNDED: { title: 'Refunded', color: 'secondary' },
  FAILED: { title: 'Failed', color: 'error' }
} as const

function formatMoney(amount: number, currency: string) {
  return `${typeof amount === 'number' ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount} ${currency}`
}

function VariantOpts({ values }: { values: any[] }) {
  if (!values?.length) return null
  return (
    <Stack direction='row' flexWrap='wrap' gap={0.5} sx={{ mt: 0.75 }}>
      {values.map((opt: any) => (
        <Chip
          key={opt.id}
          size='small'
          variant='outlined'
          label={
            opt.optionValue?.option?.name && opt.optionValue?.value
              ? `${opt.optionValue.option.name}: ${opt.optionValue.value}`
              : opt.optionValue?.value ?? ''
          }
        />
      ))}
    </Stack>
  )
}

type Props = { orderId: string }

const OrderAdminDetail = ({ orderId }: Props) => {
  const params = useParams()
  const lang = (params?.lang as Locale) || 'en'
  const listHref = getLocalizedUrl('/apps/ecommerce/orders-admin', lang)

  const { data: order, isLoading, isError, error } = useAdminOrder(orderId)

  if (isLoading) {
    return (
      <Box className='p-0 md:p-6'>
        <Skeleton variant='rounded' height={48} sx={{ mb: 3, maxWidth: 280 }} />
        <Grid container spacing={4}>
          <Grid size={{ xs: 12 }}>
            <Skeleton variant='rounded' height={120} />
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Skeleton variant='rounded' height={320} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Skeleton variant='rounded' height={280} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  if (isError || !order) {
    return (
      <Box className='p-0 md:p-6'>
        <Button component={Link} href={listHref} variant='outlined' startIcon={<i className='ri-arrow-left-line' />} sx={{ mb: 3 }}>
          Back to orders
        </Button>
        <Typography color='error'>
          {(error as Error)?.message || 'Order could not be loaded.'}
        </Typography>
      </Box>
    )
  }

  const user = order.user
  const initials =
    user?.firstName || user?.lastName
      ? `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
      : '?'

  const items = Array.isArray(order.items) ? order.items : []

  return (
    <Box className='p-0 md:p-6'>
      <Stack direction='row' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={2} sx={{ mb: 4 }}>
        <Stack direction='row' alignItems='center' gap={2} flexWrap='wrap'>
          <Button component={Link} href={listHref} variant='outlined' color='secondary' startIcon={<i className='ri-arrow-left-line' />}>
            Orders
          </Button>
          <Box>
            <Typography variant='h4' className='font-semibold'>
              {order.orderNumber}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Placed {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
        <Chip
          size='medium'
          variant='tonal'
          color={orderStatusObj[order.status as keyof typeof orderStatusObj]?.color ?? 'secondary'}
          label={orderStatusObj[order.status as keyof typeof orderStatusObj]?.title ?? order.status}
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12 }}>
          <Card variant='outlined' sx={{ borderRadius: 2, background: theme => theme.palette.background.paper }}>
            <CardContent sx={{ py: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} divider={<Divider flexItem orientation='vertical' />} spacing={3}>
                <Box flex={1}>
                  <Typography variant='overline' color='text.secondary'>
                    Shop
                  </Typography>
                  <Typography variant='h6' className='font-medium'>
                    {order.shop?.name ?? '—'}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant='overline' color='text.secondary'>
                    Currency
                  </Typography>
                  <Typography variant='h6'>{order.currency}</Typography>
                </Box>
                {order.pickupLocation && (
                  <Box flex={1}>
                    <Typography variant='overline' color='text.secondary'>
                      Pickup
                    </Typography>
                    <Typography variant='body1' className='font-medium'>
                      {order.pickupLocation.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {[order.pickupLocation.addressLine1, order.pickupLocation.city].filter(Boolean).join(', ')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant='outlined' sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant='h6' className='font-semibold mb-4'>
                Line items
              </Typography>
              <Stack divider={<Divider flexItem />} spacing={0}>
                {items.map((item: any) => {
                  const img = item.variant?.image || item.variant?.media?.[0]?.url
                  const slug = item.variant?.product?.slug
                  return (
                    <Stack
                      key={item.id}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      sx={{ py: 2.5, alignItems: { sm: 'flex-start' } }}
                    >
                      <Avatar
                        variant='rounded'
                        src={img || undefined}
                        alt={item.productName}
                        sx={{ width: 72, height: 72, bgcolor: 'action.hover', flexShrink: 0 }}
                      >
                        {!img ? <i className='ri-image-line text-2xl text-textSecondary' /> : null}
                      </Avatar>
                      <Box flex={1} minWidth={0}>
                        <Typography variant='subtitle1' className='font-semibold' noWrap title={item.productName}>
                          {item.productName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' display='block'>
                          SKU {item.variant?.sku || item.variantName || '—'}
                          {slug ? ` · /${slug}` : ''}
                        </Typography>
                        <VariantOpts values={item.variant?.variantOptionValues ?? []} />
                        <Stack direction='row' flexWrap='wrap' gap={2} sx={{ mt: 1.5 }}>
                          <Typography variant='body2'>
                            <span className='text-textSecondary'>Qty </span>
                            <strong>{item.quantity}</strong>
                          </Typography>
                          <Typography variant='body2'>
                            <span className='text-textSecondary'>Unit </span>
                            <strong>{formatMoney(item.price, order.currency)}</strong>
                          </Typography>
                          <Typography variant='body2'>
                            <span className='text-textSecondary'>Line total </span>
                            <strong>{formatMoney(item.total, order.currency)}</strong>
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card variant='outlined' sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant='overline' color='text.secondary'>
                  Customer
                </Typography>
                <Stack direction='row' spacing={2} alignItems='center' sx={{ mt: 1 }}>
                  <Avatar sx={{ width: 52, height: 52 }}>{initials}</Avatar>
                  <Box minWidth={0}>
                    <Typography variant='subtitle1' className='font-semibold'>
                      {user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email : order.userId}
                    </Typography>
                    {user?.email && (
                      <Typography variant='body2' color='text.secondary' noWrap title={user.email}>
                        {user.email}
                      </Typography>
                    )}
                    {user?.phone && (
                      <Typography variant='body2' color='text.secondary'>
                        {user.phone}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant='outlined' sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant='overline' color='text.secondary'>
                  Shipping address
                </Typography>
                {order.address ? (
                  <Typography variant='body1' sx={{ mt: 1.5, whiteSpace: 'pre-line' }}>
                    <strong>{order.address.name}</strong>
                    {'\n'}
                    {order.address.phone}
                    {'\n'}
                    {order.address.addressLine1}
                    {order.address.addressLine2 ? `\n${order.address.addressLine2}` : ''}
                    {'\n'}
                    {[order.address.city, order.address.state, order.address.postalCode].filter(Boolean).join(', ')}
                    {'\n'}
                    {order.address.country}
                  </Typography>
                ) : (
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    No address on file
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant='outlined' sx={{ borderRadius: 2, background: theme => theme.palette.action.hover }}>
              <CardContent>
                <Typography variant='overline' color='text.secondary'>
                  Order totals
                </Typography>
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  <Stack direction='row' justifyContent='space-between'>
                    <Typography color='text.secondary'>Subtotal</Typography>
                    <Typography>{formatMoney(order.subtotal, order.currency)}</Typography>
                  </Stack>
                  <Stack direction='row' justifyContent='space-between'>
                    <Typography color='text.secondary'>Discount</Typography>
                    <Typography>{formatMoney(order.discountTotal ?? 0, order.currency)}</Typography>
                  </Stack>
                  <Stack direction='row' justifyContent='space-between'>
                    <Typography color='text.secondary'>Tax</Typography>
                    <Typography>{formatMoney(order.taxTotal ?? 0, order.currency)}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction='row' justifyContent='space-between' alignItems='baseline'>
                    <Typography variant='subtitle1' className='font-semibold'>
                      Grand total
                    </Typography>
                    <Typography variant='h6' className='font-bold'>
                      {formatMoney(order.grandTotal, order.currency)}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ mt: { xs: 0, lg: -2 } }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined' sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant='h6' className='font-semibold mb-3'>
                    Payments
                  </Typography>
                  <Stack spacing={2}>
                    {(order.payments ?? []).length === 0 && (
                      <Typography variant='body2' color='text.secondary'>
                        No payments
                      </Typography>
                    )}
                    {(order.payments ?? []).map((p: any) => (
                      <Stack
                        key={p.id}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ sm: 'center' }}
                        justifyContent='space-between'
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: 'background.default',
                          border: theme => `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Box>
                          <Typography variant='subtitle2' className='font-semibold'>
                            {p.provider}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}
                          </Typography>
                        </Box>
                        <Stack direction='row' alignItems='center' gap={1} flexWrap='wrap'>
                          <Typography variant='subtitle1' className='font-semibold'>
                            {formatMoney(p.amount, p.currency)}
                          </Typography>
                          <Chip
                            size='small'
                            variant='tonal'
                            color={paymentStatusObj[p.status as keyof typeof paymentStatusObj]?.color ?? 'default'}
                            label={paymentStatusObj[p.status as keyof typeof paymentStatusObj]?.title ?? p.status}
                          />
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined' sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant='h6' className='font-semibold mb-3'>
                    Shipments
                  </Typography>
                  <Stack spacing={2}>
                    {(order.shipments ?? []).length === 0 && (
                      <Typography variant='body2' color='text.secondary'>
                        No shipments yet
                      </Typography>
                    )}
                    {(order.shipments ?? []).map((s: any) => (
                      <Stack
                        key={s.id}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor: 'background.default',
                          border: theme => `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Stack direction='row' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={1}>
                          <Typography variant='subtitle2' className='font-semibold'>
                            {s.carrier || 'Carrier TBD'}
                          </Typography>
                          <Chip size='small' label={s.status} variant='outlined' />
                        </Stack>
                        <Typography variant='body2' sx={{ mt: 1 }}>
                          Tracking:{' '}
                          <span className='font-mono'>{s.trackingNumber || '—'}</span>
                        </Typography>
                        {(s.shippedAt || s.deliveredAt) && (
                          <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
                            {s.shippedAt ? `Shipped ${new Date(s.shippedAt).toLocaleString()}` : ''}
                            {s.deliveredAt ? ` · Delivered ${new Date(s.deliveredAt).toLocaleString()}` : ''}
                          </Typography>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderAdminDetail
