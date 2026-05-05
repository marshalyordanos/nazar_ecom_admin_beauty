'use client'

import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import type { TextFieldProps } from '@mui/material/TextField'

import MutationBlockingOverlay from '@/components/loading/MutationBlockingOverlay'
import CollapsibleFiltersSection from '@/components/layout/CollapsibleFiltersSection'

import type { SaleFromShopRow } from '@/api/sales/useSaleFromShop'
import type { Shop } from '@/types/shop'

import tableStyles from '@core/styles/table.module.css'

import { DEFAULT_CURRENCY_CODE } from '@/libs/currency'

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 400,
  ...props
}: {
  value: string
  onChange: (value: string) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const t = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(t)
    // Intentionally omit onChange from deps — parent should pass a stable callback (useCallback).
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

type Props = {
  rows: SaleFromShopRow[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  search: string
  onSearchChange: (v: string) => void
  shops: Shop[]
  shopFilter: string
  locationFilter: string
  onShopFilter: (id: string) => void
  onLocationFilter: (id: string) => void
  isLoading: boolean
  listError?: boolean
  currency?: string
  onEdit: (row: SaleFromShopRow, payload: { quantity?: number; price?: number }) => void | Promise<void>
  onDelete: (id: string) => void | Promise<void>
  isMutating?: boolean
}

const SalesFromShopTable = ({
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  shops,
  shopFilter,
  locationFilter,
  onShopFilter,
  onLocationFilter,
  isLoading,
  listError,
  currency = DEFAULT_CURRENCY_CODE,
  onEdit,
  onDelete,
  isMutating
}: Props) => {
  const [editRow, setEditRow] = useState<SaleFromShopRow | null>(null)
  const [editQty, setEditQty] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const locations = shops.find(s => s.id === shopFilter)?.locations ?? []

  useEffect(() => {
    if (editRow) {
      setEditQty(String(editRow.quantity))
      setEditPrice(String(editRow.price))
    }
  }, [editRow])

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n)

  const handleSaveEdit = async () => {
    if (!editRow) return
    const q = parseInt(editQty, 10)
    const p = parseFloat(editPrice)
    const payload: { quantity?: number; price?: number } = {}
    if (editQty !== '' && Number.isFinite(q) && q !== editRow.quantity) payload.quantity = q
    if (editPrice !== '' && Number.isFinite(p) && p !== editRow.price) payload.price = p
    if (Object.keys(payload).length === 0) {
      setEditRow(null)

      return
    }
    try {
      await Promise.resolve(onEdit(editRow, payload))
      setEditRow(null)
    } catch {
      // keep dialog open on failure
    }
  }

  return (
    <>
      <Card sx={{ position: 'relative', overflow: 'hidden' }}>
        <MutationBlockingOverlay open={Boolean(isMutating)} message='Updating sales…' />
        <div className='flex flex-col gap-4 p-4 md:p-5'>
          <Typography variant='h5' className='text-lg md:text-2xl'>
            Shop sales
          </Typography>
          <DebouncedInput
            value={search}
            onChange={onSearchChange}
            placeholder='Search product, SKU, shop, location…'
            className='is-full md:hidden'
          />
          <CollapsibleFiltersSection
            summaryHint={shopFilter || locationFilter ? ' · Branch filters' : undefined}
          >
            <div className='flex flex-wrap items-center gap-4 max-md:flex-col max-md:is-full'>
              <DebouncedInput
                value={search}
                onChange={onSearchChange}
                placeholder='Search product, SKU, shop, location…'
                className='hidden md:flex md:is-[280px]'
              />
              <FormControl size='small' className='min-is-[180px] max-md:is-full is-full md:is-auto'>
                <InputLabel id='sfs-shop'>Shop</InputLabel>
                <Select
                  labelId='sfs-shop'
                  label='Shop'
                  value={shopFilter}
                  onChange={e => onShopFilter(e.target.value)}
                >
                  <MenuItem value=''>All shops</MenuItem>
                  {shops.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size='small' className='min-is-[180px] max-md:is-full is-full md:is-auto' disabled={!shopFilter}>
                <InputLabel id='sfs-loc'>Location</InputLabel>
                <Select
                  labelId='sfs-loc'
                  label='Location'
                  value={locationFilter}
                  onChange={e => onLocationFilter(e.target.value)}
                >
                  <MenuItem value=''>All locations</MenuItem>
                  {locations.map(l => (
                    <MenuItem key={l.id} value={l.id}>
                      {l.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </CollapsibleFiltersSection>
        </div>
        <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Shop</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align='right'>Qty</TableCell>
                <TableCell align='right'>Price</TableCell>
                <TableCell align='right'>Total</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listError ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography color='error'>Could not load sales. Try again.</Typography>
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography color='text.secondary'>Loading…</Typography>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography color='text.secondary'>No sales found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {new Date(row.createdAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </TableCell>
                    <TableCell>{row.location.shop.name}</TableCell>
                    <TableCell>{row.location.name}</TableCell>
                    <TableCell>{row.variant.product.name}</TableCell>
                    <TableCell>{row.variant.sku}</TableCell>
                    <TableCell align='right'>{row.quantity}</TableCell>
                    <TableCell align='right'>{fmtMoney(row.price)}</TableCell>
                    <TableCell align='right'>{fmtMoney(row.total)}</TableCell>
                    <TableCell align='right'>
                      <IconButton
                        size='small'
                        onClick={() => setEditRow(row)}
                        disabled={isMutating}
                        aria-label='Edit'
                      >
                        <i className='ri-edit-line text-textSecondary' />
                      </IconButton>
                      <IconButton
                        size='small'
                        onClick={() => setDeleteId(row.id)}
                        disabled={isMutating}
                        aria-label='Delete'
                      >
                        <i className='ri-delete-bin-7-line text-error' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, px: 2, pb: 2 }}>
          {listError ? (
            <Typography color='error'>Could not load sales. Try again.</Typography>
          ) : isLoading ? (
            <Typography color='text.secondary' className='text-center py-6'>
              Loading…
            </Typography>
          ) : rows.length === 0 ? (
            <Typography color='text.secondary' className='text-center py-6'>
              No sales found
            </Typography>
          ) : (
            rows.map(row => (
              <Card key={row.id} variant='outlined' sx={{ borderRadius: 2 }}>
                <CardContent className='flex flex-col gap-2 p-4'>
                  <Typography variant='subtitle2' color='text.secondary'>
                    {new Date(row.createdAt).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </Typography>
                  <Typography variant='subtitle1' className='font-semibold line-clamp-2'>
                    {row.variant.product.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    SKU {row.variant.sku}
                  </Typography>
                  <Divider />
                  <Typography variant='body2'>
                    <strong>{row.location.shop.name}</strong>
                    <span className='text-textSecondary'> · {row.location.name}</span>
                  </Typography>
                  <div className='flex justify-between gap-2'>
                    <Typography variant='caption'>Qty {row.quantity}</Typography>
                    <Typography variant='caption'>{fmtMoney(row.price)} each</Typography>
                  </div>
                  <Typography variant='h6' className='font-bold'>
                    {fmtMoney(row.total)}
                  </Typography>
                  <Box className='flex justify-end gap-1'>
                    <IconButton
                      size='small'
                      onClick={() => setEditRow(row)}
                      disabled={isMutating}
                      aria-label='Edit'
                    >
                      <i className='ri-edit-line text-textSecondary' />
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={() => setDeleteId(row.id)}
                      disabled={isMutating}
                      aria-label='Delete'
                    >
                      <i className='ri-delete-bin-7-line text-error' />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>

        <TablePagination
          component='div'
          count={total}
          page={page - 1}
          onPageChange={(_, p) => onPageChange(p + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={e => onPageSizeChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      <Dialog
        open={!!editRow}
        onClose={() => !isMutating && setEditRow(null)}
        maxWidth='xs'
        fullWidth
        slotProps={{ paper: { sx: { position: 'relative', overflow: 'hidden' } } }}
      >
        <MutationBlockingOverlay open={Boolean(isMutating)} message='Saving sale…' />
        <DialogTitle>Edit sale line</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-2'>
          <TextField
            label='Quantity'
            type='number'
            inputProps={{ min: 1 }}
            value={editQty}
            onChange={e => setEditQty(e.target.value)}
            fullWidth
            disabled={isMutating}
          />
          <TextField
            label='Unit price'
            type='number'
            inputProps={{ min: 0, step: '0.01' }}
            value={editPrice}
            onChange={e => setEditPrice(e.target.value)}
            fullWidth
            disabled={isMutating}
          />
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={() => setEditRow(null)} disabled={isMutating}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={() => void handleSaveEdit()}
            disabled={isMutating}
            startIcon={isMutating ? <CircularProgress color='inherit' size={18} /> : undefined}
          >
            {isMutating ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => !isMutating && setDeleteId(null)}
        slotProps={{ paper: { sx: { position: 'relative', overflow: 'hidden' } } }}
      >
        <MutationBlockingOverlay open={Boolean(isMutating)} message='Deleting sale…' />
        <DialogTitle>Delete this sale?</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary'>
            Stock will be returned to the location inventory. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={() => setDeleteId(null)} disabled={isMutating}>
            Cancel
          </Button>
          <Button
            color='error'
            variant='contained'
            disabled={isMutating}
            startIcon={isMutating ? <CircularProgress color='inherit' size={18} /> : undefined}
            onClick={async () => {
              if (!deleteId) return
              try {
                await Promise.resolve(onDelete(deleteId))
                setDeleteId(null)
              } catch {
                // keep dialog open on failure
              }
            }}
          >
            {isMutating ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SalesFromShopTable
