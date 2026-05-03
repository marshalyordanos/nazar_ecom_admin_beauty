'use client'

import { useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import tableStyles from '@core/styles/table.module.css'
import {
  useAdminPayments,
  useCapturePayment,
  useRefundPayment,
  usePaymentsAdminSummary
} from '@/api/admin/payments'
import HorizontalWithSubtitle from '@components/card-statistics/HorizontalWithSubtitle'
import MutationBlockingOverlay from '@/components/loading/MutationBlockingOverlay'

const filterBarSx = {
  '& .MuiInputBase-root': { minHeight: 48 },
  '& .MuiInputLabel-root': { lineHeight: 1.2 }
} as const

// Payment status map for styled chips
const paymentStatusObj = {
  PENDING: { title: 'Pending', color: 'warning' },
  PAID: { title: 'Paid', color: 'success' },
  REFUNDED: { title: 'Refunded', color: 'secondary' },
  FAILED: { title: 'Failed', color: 'error' },
} as const

// Util: Format currency (could improve if desired)
const formatCurrency = (amount: number, currency: string) =>
  `${typeof amount === "number" ? amount.toLocaleString() : amount} ${currency}`

// Option menu for row actions, similar to Orders
const OptionMenu = ({
  options = [],
  iconButtonProps = {},
  iconClassName = '',
}: {
  options: {
    text: string
    icon?: string
    menuItemProps?: any
  }[]
  iconButtonProps?: any
  iconClassName?: string
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <IconButton
        {...iconButtonProps}
        onClick={handleOpen}
        className={iconClassName}
        size={iconButtonProps?.size || 'small'}
      >
        <span className="ri-more-2-line text-base" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((opt, idx) => (
          <MenuItem
            key={opt.text || idx}
            {...opt.menuItemProps}
            onClick={e => {
              handleClose()
              opt.menuItemProps?.onClick?.(e)
            }}
          >
            {opt.icon && <span className={`mr-2 ${opt.icon}`} />}
            {opt.text}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

// Actions for payments, with confirmation dialogs like Orders
function PaymentActions({
  row,
  captureMut,
  refundMut
}: {
  row: any,
  captureMut: ReturnType<typeof useCapturePayment>,
  refundMut: ReturnType<typeof useRefundPayment>
}) {
  const [openDialog, setOpenDialog] = useState<'CAPTURE' | 'REFUND' | null>(null)
  const [loading, setLoading] = useState(false);

  const canCapture = row.status === 'PENDING'
  const canRefund = row.status === 'PAID'

  return (
    <>
      <OptionMenu
        iconButtonProps={{ size: 'medium'}}
        iconClassName="text-textSecondary text-[22px]"
        options={[
          {
            text: 'Capture Payment',
            icon: 'ri-checkbox-circle-line',
            menuItemProps: {
              disabled: !canCapture || captureMut.isPending || loading,
              onClick: () => setOpenDialog('CAPTURE')
            }
          },
          {
            text: 'Refund Payment',
            icon: 'ri-rotate-reverse-line',
            menuItemProps: {
              disabled: !canRefund || refundMut.isPending || loading,
              onClick: () => setOpenDialog('REFUND')
            }
          }
        ]}
      />

      <Dialog
        open={openDialog === 'CAPTURE'}
        onClose={() => setOpenDialog(null)}
      >
        <DialogTitle>Confirm Capture Payment</DialogTitle>
        <DialogContent>
          Are you sure you want to <span className="font-bold text-success">capture</span> this payment for order&nbsp;
          <span className="font-bold">{row.order?.orderNumber || row.orderId}</span>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            disabled={captureMut.isPending || loading}
            startIcon={captureMut.isPending || loading ? <CircularProgress color='inherit' size={18} /> : undefined}
            onClick={async () => {
              setLoading(true)
              try {
                await captureMut.mutateAsync(row.id)
                setOpenDialog(null)
              } catch (_) {}
              setLoading(false)
            }}
          >
            {captureMut.isPending || loading ? 'Processing…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog === 'REFUND'}
        onClose={() => setOpenDialog(null)}
      >
        <DialogTitle>Confirm Refund Payment</DialogTitle>
        <DialogContent>
          Are you sure you want to <span className="font-bold text-warning">refund</span> this payment for order&nbsp;
          <span className="font-bold">{row.order?.orderNumber || row.orderId}</span>? This cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Back</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={refundMut.isPending || loading}
            startIcon={refundMut.isPending || loading ? <CircularProgress color='inherit' size={18} /> : undefined}
            onClick={async () => {
              setLoading(true)
              try {
                await refundMut.mutateAsync(row.id)
                setOpenDialog(null)
              } catch (_) {}
              setLoading(false)
            }}
          >
            {refundMut.isPending || loading ? 'Processing…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const

const PaymentsManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const summaryParams = useMemo(() => {
    const filter: Record<string, string> = {}
    if (dateFrom) filter.createdAt_gte = new Date(`${dateFrom}T00:00:00.000Z`).toISOString()
    if (dateTo) filter.createdAt_lte = new Date(`${dateTo}T23:59:59.999Z`).toISOString()
    if (statusFilter) filter.status = statusFilter

    return {
      page: 1,
      pageSize: 1,
      ...(search.trim() ? { search: { all: search.trim() } } : {}),
      ...(Object.keys(filter).length ? { filter } : {})
    }
  }, [search, dateFrom, dateTo, statusFilter])

  const { data: summaryPayload, isLoading: sumLoading, isError: sumError } = usePaymentsAdminSummary(summaryParams)
  const pay = summaryPayload?.data

  const params = useMemo(() => {
    const filter: Record<string, string> = {}
    if (dateFrom) filter.createdAt_gte = new Date(`${dateFrom}T00:00:00.000Z`).toISOString()
    if (dateTo) filter.createdAt_lte = new Date(`${dateTo}T23:59:59.999Z`).toISOString()
    if (statusFilter) filter.status = statusFilter

    return {
      page: page + 1,
      pageSize,
      ...(search.trim() ? { search: { all: search.trim() } } : {}),
      ...(Object.keys(filter).length ? { filter } : {})
    }
  }, [page, pageSize, search, dateFrom, dateTo, statusFilter])

  const { data, isLoading, isFetching } = useAdminPayments(params)
  const captureMut = useCapturePayment()
  const refundMut = useRefundPayment()

  const rows = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  const hasActiveFilters = Boolean(dateFrom || dateTo || statusFilter || search.trim())

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setStatusFilter('')
    setSearch('')
    setPage(0)
  }

  return (
    <div className="p-0 md:p-6">
      <Grid container spacing={6} className='mb-6'>
        {sumLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Grid key={`pay-s-${i}`} size={{ xs: 12, sm: 6, md: 4 }}>
              <div className='p-4 border rounded'>
                <div className='h-6 w-32 bg-actionHover rounded mb-2' />
                <div className='h-5 w-24 bg-actionHover rounded mb-1' />
                <div className='h-4 w-20 bg-actionHover rounded' />
              </div>
            </Grid>
          ))
        ) : pay ? (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <HorizontalWithSubtitle
                title='Payments (filtered)'
                stats={String(pay.totalPayments)}
                avatarIcon='ri-bill-line'
                avatarColor='primary'
                trend=''
                subtitle='Matching current filters'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <HorizontalWithSubtitle
                title='Paid volume'
                stats={pay.paidVolume.toFixed(2)}
                avatarIcon='ri-check-double-line'
                avatarColor='success'
                trend=''
                subtitle={`${pay.paidPayments} successful · ${pay.successfulRatePercent.toFixed(0)}% success rate`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <HorizontalWithSubtitle
                title='Total recorded'
                stats={pay.totalPaymentAmount.toFixed(2)}
                avatarIcon='ri-money-dollar-circle-line'
                avatarColor='info'
                trend=''
                subtitle={`Avg ${pay.avgPaymentAmount.toFixed(2)} per payment`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <HorizontalWithSubtitle
                title='Pending'
                stats={String(pay.pendingPayments)}
                avatarIcon='ri-time-line'
                avatarColor='warning'
                trend=''
                subtitle={`Volume ${pay.pendingVolume.toFixed(2)}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <HorizontalWithSubtitle
                title='Failed'
                stats={String(pay.failedPayments)}
                avatarIcon='ri-close-circle-line'
                avatarColor='error'
                trend=''
                subtitle='Declined or errored'
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <HorizontalWithSubtitle
                title='Refunded'
                stats={String(pay.refundedPayments)}
                avatarIcon='ri-exchange-dollar-line'
                avatarColor='secondary'
                trend=''
                subtitle={`Volume ${pay.refundedVolume.toFixed(2)}`}
              />
            </Grid>
          </>
        ) : sumError ? (
          <Grid size={{ xs: 12 }}>
            <Typography color='error'>Failed to load payments summary</Typography>
          </Grid>
        ) : null}
      </Grid>
      <Typography variant="h4" className="mb-6 font-medium">Payment Management</Typography>
      <Card sx={{ position: 'relative', overflow: 'hidden' }}>
        <MutationBlockingOverlay
          open={captureMut.isPending || refundMut.isPending}
          message='Updating payment…'
        />
        <CardContent>
          <Box
            className="flex flex-col gap-3 mb-4 rounded-lg border border-solid border-divider"
            sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: 'action.hover' }}
          >
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-end">
              <TextField
                size="medium"
                type="date"
                label="From"
                InputLabelProps={{ shrink: true }}
                sx={{ ...filterBarSx, minWidth: 168 }}
                value={dateFrom}
                onChange={e => {
                  setDateFrom(e.target.value)
                  setPage(0)
                }}
              />
              <TextField
                size="medium"
                type="date"
                label="To"
                InputLabelProps={{ shrink: true }}
                sx={{ ...filterBarSx, minWidth: 168 }}
                value={dateTo}
                onChange={e => {
                  setDateTo(e.target.value)
                  setPage(0)
                }}
              />
              <FormControl size="medium" sx={{ ...filterBarSx, minWidth: 180 }}>
                <InputLabel id="pay-status-filter">Status</InputLabel>
                <Select
                  labelId="pay-status-filter"
                  label="Status"
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {PAYMENT_STATUSES.map(s => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant='outlined'
                color='secondary'
                size='medium'
                disabled={!hasActiveFilters}
                startIcon={<span className='ri-filter-off-line text-lg' />}
                onClick={clearFilters}
                sx={{ minHeight: 48, alignSelf: { xs: 'stretch', sm: 'flex-end' } }}
              >
                Clear filters
              </Button>
            </div>
            <TextField
              size="medium"
              placeholder="Search payment, user, order, status etc"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="max-sm:w-full sm:max-w-lg"
              sx={filterBarSx}
            />
          </Box>
          <div className="overflow-x-auto">
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>User</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Paid At</th>
                  <th>Created</th>
                  <th>Options</th>
                </tr>
              </thead>
              {isLoading || isFetching ? (
                <tbody>
                  <tr>
                    <td colSpan={8} className="text-center">
                      Loading...
                    </td>
                  </tr>
                </tbody>
              ) : rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={8} className="text-center">
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {rows.map((row: any) => (
                    <tr key={row.id}>
                      {/* Order number */}
                      <td>
                        <Typography variant="body2" color="primary.main" className="font-medium">
                          {row.order?.orderNumber || row.orderId}
                        </Typography>
                      </td>
                      {/* User info */}
                      <td>
                        <Typography variant="body2">
                          {row.order?.user ? (
                            <>
                              <span className="font-medium">{row.order.user.firstName} {row.order.user.lastName}</span>
                              <br />
                              <span className="text-xs">{row.order.user.email}</span>
                            </>
                          ) : (
                            <span className="text-xs">{row.order?.userId || '-'}</span>
                          )}
                        </Typography>
                      </td>
                      {/* Provider */}
                      <td>
                        <Typography variant="body2">
                          {row.provider || '-'}
                        </Typography>
                      </td>
                      {/* Status with color chip */}
                      <td>
                        <Chip
                          size="small"
                          color={paymentStatusObj[row.status as keyof typeof paymentStatusObj]?.color ?? 'secondary'}
                          label={paymentStatusObj[row.status as keyof typeof paymentStatusObj]?.title ?? row.status}
                          variant="tonal"
                        />
                      </td>
                      {/* Amount */}
                      <td>
                        <Typography variant="body2" className="font-bold">
                          {formatCurrency(row.amount, row.currency)}
                        </Typography>
                      </td>
                      {/* Paid At */}
                      <td>
                        <Typography variant="caption" title={row.paidAt || ''}>
                          {row.paidAt ? new Date(row.paidAt).toLocaleString() : <span className="text-xs">-</span>}
                        </Typography>
                      </td>
                      {/* Created */}
                      <td>
                        <Typography variant="caption" title={row.createdAt}>
                          {new Date(row.createdAt).toLocaleDateString()}
                        </Typography>
                      </td>
                      {/* Actions */}
                      <td>
                        <PaymentActions row={row} captureMut={captureMut} refundMut={refundMut} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={pageSize}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
            rowsPerPageOptions={[10, 25, 50]}
            className='border-bs'
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentsManagement
