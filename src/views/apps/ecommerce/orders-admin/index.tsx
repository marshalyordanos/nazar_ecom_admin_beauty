'use client'

import { useMemo, useState } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
import MenuItem from '@mui/material/MenuItem'
import { useAdminOrders, useCompleteOrder, useCancleOrder, useCreateAdminOrder } from '@/api/admin/orders'

import classnames from 'classnames'
import tableStyles from '@core/styles/table.module.css'

// Custom OptionMenu implementation, following the style in inventory/index.tsx
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
        {/* fallback to vertical dots, can improve this if needed */}
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

const orderStatusObj = {
  PENDING: { title: 'Pending', color: 'warning' },
  PAID: { title: 'Paid', color: 'info' },
  PROCESSING: { title: 'Processing', color: 'primary' },
  SHIPPED: { title: 'Shipped', color: 'info' },
  COMPLETED: { title: 'Completed', color: 'success' },
  CANCELLED: { title: 'Cancelled', color: 'error' },
  REFUNDED: { title: 'Refunded', color: 'secondary' }
} as const

// Utility function to show options of a variant
function VariantOptions({ values }: { values: any[] }) {
  if (!values || values.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {values.map(opt => (
        <Chip
          key={opt.id}
          label={
            opt.optionValue?.option?.name && opt.optionValue?.value
              ? `${opt.optionValue.option.name}: ${opt.optionValue.value}`
              : opt.optionValue?.value
          }
          size="small"
          color="default"
          variant="outlined"
        />
      ))}
    </div>
  )
}

// Util: Format currency (very simple, could use Intl.NumberFormat)
const formatCurrency = (amount: number, currency: string) =>
  `${typeof amount === "number" ? amount.toLocaleString() : amount} ${currency}`

// Order actions menu and confirmation dialogs
function OrderActions({
  row,
  completeMut,
  cancelMut
}: {
  row: any,
  completeMut: ReturnType<typeof useCompleteOrder>,
  cancelMut: ReturnType<typeof useCancleOrder>
}) {
  const [openDialog, setOpenDialog] = useState<'COMPLETE' | 'CANCEL' | null>(null)
  const [loading, setLoading] = useState(false)

  // Disable logic
  const canComplete = row.status !== 'COMPLETED' && row.status !== 'CANCELLED'
  const canCancel = row.status === 'PENDING' || row.status === 'PAID'

  return (
    <>
      <OptionMenu
        iconButtonProps={{ size: 'medium' }}
        iconClassName='text-textSecondary text-[22px]'
        options={[
          {
            text: 'Complete Order',
            icon: 'ri-checkbox-circle-line',
            menuItemProps: {
              disabled: !canComplete || completeMut.isPending || loading,
              onClick: () => setOpenDialog('COMPLETE'),
            }
          },
          {
            text: 'Cancel Order',
            icon: 'ri-close-circle-line',
            menuItemProps: {
              disabled: !canCancel || cancelMut.isPending || loading,
              onClick: () => setOpenDialog('CANCEL'),
            }
          }
        ]}
      />

      <Dialog
        open={openDialog === 'COMPLETE'}
        onClose={() => setOpenDialog(null)}
      >
        <DialogTitle>Confirm Complete Order</DialogTitle>
        <DialogContent>
          Are you sure you want to mark this order (<span className="font-bold">{row.orderNumber}</span>) as <span className="font-bold text-success">completed</span>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            disabled={completeMut.isPending}
            onClick={async () => {
              setLoading(true)
              try {
                await completeMut.mutateAsync(row.id)
                setOpenDialog(null)
              } catch (_) { }
              setLoading(false)
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialog === 'CANCEL'}
        onClose={() => setOpenDialog(null)}
      >
        <DialogTitle>Confirm Cancel Order</DialogTitle>
        <DialogContent>
          Are you sure you want to cancel this order (<span className="font-bold">{row.orderNumber}</span>)? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Back</Button>
          <Button
            variant="contained"
            color="error"
            disabled={cancelMut.isPending}
            onClick={async () => {
              setLoading(true)
              try {
                await cancelMut.mutateAsync(row.id)
                setOpenDialog(null)
              } catch (_) { }
              setLoading(false)
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// This makes the table similar in style to ProductListTable
const OrdersAdminManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const [openCreate, setOpenCreate] = useState(false)
  const [payload, setPayload] = useState(
    '{\n  "shopId": "",\n  "userId": "",\n  "subtotal": 0,\n  "grandTotal": 0,\n  "currency": "USD",\n  "items": [],\n  "address": {\n    "name": "",\n    "phone": "",\n    "addressLine1": "",\n    "city": "",\n    "country": ""\n  }\n}'
  )

  const params = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      ...(search.trim() ? { search: { all: search.trim() } } : {})
    }),
    [page, pageSize, search]
  )
  const { data, isLoading, isFetching } = useAdminOrders(params)
  const completeMut = useCompleteOrder()
  const cancelMut = useCancleOrder()
  const createMut = useCreateAdminOrder()

  const rows = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  return (
    <div className="p-0 md:p-6">
      <Typography variant="h4" className="mb-6 font-medium">Order Management</Typography>
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
            <TextField
              size="small"
              placeholder="Search order number, user, product, status etc"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="max-sm:w-full"
            />
            {/* <Button variant="contained" onClick={() => setOpenCreate(true)}>
              Create Admin Order
            </Button> */}
          </div>
          <div className="overflow-x-auto">
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Status</th>
                  <th>User</th>
                  <th>Product(s)</th>
                  <th>Options</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Actions</th>
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
                          {row.orderNumber}
                        </Typography>
                      </td>
                      {/* Status with color chip */}
                      <td>
                        <Chip
                          size="small"
                          color={orderStatusObj[row.status as keyof typeof orderStatusObj]?.color ?? 'secondary'}
                          label={orderStatusObj[row.status as keyof typeof orderStatusObj]?.title ?? row.status}
                          variant="tonal"
                        />
                      </td>
                      {/* User info */}
                      <td>
                        <Typography variant="body2">
                          {row.user ? (
                            <>
                              <span className="font-medium">{row.user.firstName} {row.user.lastName}</span>
                              <br />
                              <span className="text-xs">{row.user.email}</span>
                            </>
                          ) : (
                            row.userId
                          )}
                        </Typography>
                      </td>
                      {/* Products cell: show all products (can be >1) */}
                      <td>
                        <div className="flex flex-col gap-2">
                          {Array.isArray(row.items) && row.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2 min-w-[180px]">
                              {/* Product image */}
                              {item.variant?.image && (
                                <img
                                  src={item.variant.image}
                                  alt={item.productName}
                                  width={33}
                                  height={33}
                                  className="rounded-md bg-actionHover"
                                />
                              )}
                              <div>
                                <Typography variant="body2" className='font-medium' title={item.productName}>
                                  {item.productName}
                                </Typography>
                                <Typography variant='caption' className="block">
                                  Qty: {item.quantity} × {formatCurrency(item.price, row.currency)}
                                </Typography>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      {/* Options for all items */}
                      <td>
                        <div className="flex flex-col gap-2">
                          {Array.isArray(row.items) && row.items.map((item: any) => (
                            <VariantOptions key={item.id} values={item.variant?.variantOptionValues || []} />
                          ))}
                        </div>
                      </td>
                      {/* Total */}
                      <td>
                        <Typography variant="body2" className="font-bold">
                          {formatCurrency(row.grandTotal, row.currency)}
                        </Typography>
                        {/* Show subtotal/tax/discount breakdown? */}
                      </td>
                      {/* Created */}
                      <td>
                        <Typography variant="caption" title={row.createdAt}>
                          {new Date(row.createdAt).toLocaleDateString()}
                        </Typography>
                      </td>
                      {/* Actions */}
                      <td>
                        <OrderActions row={row} completeMut={completeMut} cancelMut={cancelMut} />
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

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md">
        <DialogTitle>Create Order (Admin)</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={14}
            value={payload}
            onChange={e => setPayload(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                await createMut.mutateAsync(JSON.parse(payload))
                setOpenCreate(false)
              } catch (err) {
                // TODO: notification/error
              }
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default OrdersAdminManagement
