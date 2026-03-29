'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import DialogContentText from '@mui/material/DialogContentText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

import OptionMenu from '@core/components/option-menu'
import tableStyles from '@core/styles/table.module.css'
import { useAdminInventory, useUpdateInventory, useAddMovement } from '@/api/admin/inventory'
import { useShops } from '@/api/shops/useShops'
import { useParams } from 'next/navigation'

const MOVEMENT_TYPES = [
  'PURCHASE',
  'SALE',
  'RETURN',
  'ADJUSTMENT',
  'TRANSFER',
]

const InventoryManagement = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ variantId: string, locationId: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { data: shops } = useShops({})
 

  // For per-row add movement dialog
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<{
    variantId: string
    locationId: string
    variant?: any
    location?: any
  } | null>(null)
  const [movementType, setMovementType] = useState('PURCHASE')
  const [movementQuantity, setMovementQuantity] = useState<number>(1)

  // For Inventory Edit Dialog (applies to all rows, opened via OptionMenu)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<{
    variantId: string
    locationId: string
    variant?: any
    location?: any
    quantity?: number
    reservedQuantity?: number
  } | null>(null)
  const [editLocationId, setEditLocationId] = useState<string>('')
  const [editQuantity, setEditQuantity] = useState<number>(0)
  const [editReservedQuantity, setEditReservedQuantity] = useState<number>(0)

  const updateInventory = useUpdateInventory()
  const addMovementMutation = useAddMovement()

  // Not implemented: actual delete, as deleteInventory API is not shown in context. Placeholder here.
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }, 1000)
  }

  const params = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      ...(search.trim() ? { search: { all: search.trim() } } : {})
    }),
    [page, pageSize, search]
  )

  const { data, isLoading, isFetching } = useAdminInventory(params)

  const rows = data?.data ?? []
  const total = data?.pagination.total ?? 0

  // Handlers for add movement dialog on a row
  const openAddMovementForRow = (variantId: string, locationId: string, variant?: any, location?: any) => {
    setSelectedRow({ variantId, locationId, variant, location })
    setMovementType('PURCHASE')
    setMovementQuantity(1)
    setMoveDialogOpen(true)
  }

  // Open Edit Inventory Dialog
  const openEditDialog = (row: any) => {
    setEditTarget({
      variantId: row.variantId,
      locationId: row.locationId,
      variant: row.variant,
      location: row.location,
      quantity: row.quantity,
      reservedQuantity: row.reservedQuantity
    })
    setEditLocationId(row.locationId)
    setEditQuantity(Number(row.quantity) || 0)
    setEditReservedQuantity(Number(row.reservedQuantity) || 0)
    setEditDialogOpen(true)
  }

  const handleEditInventory = async () => {
    if (!editTarget) return
    await updateInventory.mutateAsync({
      variantId: editTarget.variantId,
      payload: {
        locationId: editLocationId,
        quantity: editQuantity,
        reservedQuantity: editReservedQuantity,
      }
    })
    setEditDialogOpen(false)
    setEditTarget(null)
  }

  const handleAddMovement = async () => {
    if (!selectedRow) return
    await addMovementMutation.mutateAsync({
      variantId: selectedRow.variantId,
      locationId: selectedRow.locationId,
      type: movementType,
      quantity: movementQuantity
    })
    setMoveDialogOpen(false)
  }

  // Render
  return (
    <>
      <Card>
        <CardHeader title='Inventory Management' />
        <Divider />
        <CardContent>
          <div className="flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 mb-5">
            <TextField
              size="small"
              placeholder="Search Inventory"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(0)
              }}
              style={{ maxWidth: 300 }}
            />
          </div>
          <div className='overflow-x-auto'>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Options</th>
                  <th>Location</th>
                  <th>Qty</th>
                  <th>Reserved</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              {(isLoading || isFetching) ? (
                <tbody>
                  <tr>
                    <td className="text-center" colSpan={8}>Loading...</td>
                  </tr>
                </tbody>
              ) : rows.length === 0 ? (
                <tbody>
                  <tr>
                    <td className="text-center" colSpan={8}>No data available</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      {/* Product - clickable link with theme color */}
                      <td>
                        <div className='flex flex-col gap-0.5'>
                          <Link href={`/apps/ecommerce/inventory/${r.id}`} passHref>
                            <Typography
                              className='font-medium'
                              sx={{
                                color: 'primary.main',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                              component="a"
                            >
                              {r.variant?.product?.name || '—'}
                            </Typography>
                          </Link>
                          <Typography variant="body2" color="text.secondary">
                            {r.variant?.product?.slug}
                          </Typography>
                        </div>
                      </td>
                      <td>
                        <Typography>{r.variant?.sku || '—'}</Typography>
                      </td>
                      {/* VARIANT OPTION VALUE COLUMN */}
                      <td>
                        <Typography>
                          {(r.variant?.variantOptionValues?.length
                            ? r.variant.variantOptionValues
                                .map(vov =>
                                  vov?.optionValue?.value
                                    ? vov.optionValue.value
                                    : null
                                )
                                .filter(x => x)
                                .join(' | ')
                            : '—'
                          )}
                        </Typography>
                      </td>
                      <td>
                        <Typography>{r.location?.name || r.locationId}</Typography>
                      </td>
                      <td>
                        <Typography>{r.quantity}</Typography>
                      </td>
                      <td>
                        <Typography>{r.reservedQuantity}</Typography>
                      </td>
                      <td>
                        <Chip
                          size="small"
                          variant="tonal"
                          color={r.variant?.status === 'ACTIVE' ? 'success' : r.variant?.status === 'ARCHIVED' ? 'error' : 'secondary'}
                          label={r.variant?.status || 'Unknown'}
                        />
                      </td>
                      <td>
                        {/* Replace plus icon with "Add Movement" button for each row */}
                        <div className='flex items-center gap-2'>
                          <Button
                            size='small'
                            variant="outlined"
                            onClick={() => openAddMovementForRow(r.variantId, r.locationId, r.variant, r.location)}
                          >
                            Add Movement
                          </Button>
                          <OptionMenu
                            iconButtonProps={{ size: 'medium' }}
                            iconClassName='text-textSecondary text-[22px]'
                            options={[
                              {
                                text: 'Edit',
                                icon: 'ri-pencil-line',
                                menuItemProps: {
                                  onClick: () => {
                                    openEditDialog(r)
                                  }
                                }
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component='div'
            className='border-bs'
            count={total}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={e => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
          />
        </CardContent>
      </Card>

      {/* Per-row Add Movement Dialog */}
      <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Add Inventory Movement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ p: 1, mt: 0.5 }}>
            {/* Product Info Section */}
            <Grid size={{ xs: 12 }}>
              <div
                style={{
                  // background: "#f8f9fd",
                  borderRadius: 8,
                  padding: "16px 20px",
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5
                }}
              >
                <Typography className='font-semibold mb-1' sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
                  Product Overview
                </Typography>
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  {selectedRow?.variant?.product?.name || '—'}
                  {selectedRow?.variant?.sku ? ` · SKU: ${selectedRow?.variant?.sku}` : ""}
                </Typography>
                {Boolean(selectedRow?.variant?.variantOptionValues?.length) && (
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {selectedRow?.variant?.variantOptionValues
                      .map((vov: any) => vov?.optionValue?.value ?? null)
                      .filter(Boolean)
                      .join(' | ')}
                  </Typography>
                )}
                {selectedRow?.location?.name && (
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Location: {selectedRow.location.name}
                  </Typography>
                )}
              </div>
            </Grid>
            {/* Movement Type */}
            <Grid size={{ xs: 12, sm: 12 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="movement-type-label">Type</InputLabel>
                <Select
                  labelId="movement-type-label"
                  value={movementType}
                  label="Type"
                  onChange={e => setMovementType(e.target.value)}
                >
                  {MOVEMENT_TYPES.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Quantity */}
            <Grid className='mt-4' size={{ xs: 12, sm: 12 }}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                inputProps={{ min: 1 }}
                value={movementQuantity}
                onChange={e => setMovementQuantity(Number(e.target.value))}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={() => setMoveDialogOpen(false)}
            disabled={addMovementMutation.isPending}
            variant="outlined"
            sx={{ minWidth: 96 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleAddMovement}
            disabled={addMovementMutation.isPending}
            sx={{ minWidth: 120, boxShadow: "0 1px 6px 0 rgba(99,102,241,0.11)" }}
          >
            {addMovementMutation.isPending ? 'Adding...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Edit Inventory</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ p: 1, mt: 0.5 }}>
            {/* Product Info Section */}
            <Grid size={{ xs: 12 }}>
              <div
                style={{
                  borderRadius: 8,
                  padding: "16px 20px",
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5
                }}
              >
                <Typography className='font-semibold mb-1' sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
                  Product Overview
                </Typography>
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                  {editTarget?.variant?.product?.name || (editTarget?.variantId ?? '—')}
                  {editTarget?.variant?.sku ? ` · SKU: ${editTarget?.variant?.sku}` : ""}
                </Typography>
                {Boolean(editTarget?.variant?.variantOptionValues?.length) && (
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {editTarget?.variant?.variantOptionValues
                      .map((vov: any) => vov?.optionValue?.value ?? null)
                      .filter(Boolean)
                      .join(' | ')}
                  </Typography>
                )}
              </div>
            </Grid>
            {/* Location */}
            <Grid size={{ xs: 12, sm: 12 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="edit-inventory-location-label">Location</InputLabel>
                <Select
                  labelId="edit-inventory-location-label"
                  value={editLocationId}
                  label="Location"
                  onChange={e => setEditLocationId(e.target.value)}
                  // For safety in shops data: get from first shop's locations
                >
                  {(shops?.data?.[0]?.locations || []).map((loc: any) => (
                    <MenuItem key={loc.id} value={loc.id}>{loc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {/* Quantity */}
            <Grid className='mt-4' size={{ xs: 12, sm: 12 }}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                inputProps={{ min: 0 }}
                value={editQuantity}
                onChange={e => setEditQuantity(Number(e.target.value))}
                variant="outlined"
              />
            </Grid>
            {/* Reserved Quantity */}
            <Grid className='mt-4' size={{ xs: 12, sm: 12 }}>
              <TextField
                fullWidth
                label="Reserved Quantity"
                type="number"
                inputProps={{ min: 0 }}
                value={editReservedQuantity}
                onChange={e => setEditReservedQuantity(Number(e.target.value))}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={updateInventory.isPending}
            variant="outlined"
            sx={{ minWidth: 96 }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleEditInventory}
            disabled={updateInventory.isPending}
            sx={{ minWidth: 120, boxShadow: "0 1px 6px 0 rgba(99,102,241,0.11)" }}
          >
            {updateInventory.isPending ? 'Saving...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default InventoryManagement
