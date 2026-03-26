'use client'

import { useEffect, useMemo, useState } from 'react'
import { api } from '@/libs/api'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Skeleton from '@mui/material/Skeleton'
import Grid from '@mui/material/Grid'
import TablePagination from '@mui/material/TablePagination'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'

import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  filterFns as defaultFilterFns,
  FilterFn
} from '@tanstack/react-table'

import type { Brand } from '@/types/brand'

import OptionMenu from '@core/components/option-menu'

import tableStyles from '@core/styles/table.module.css'

// Styled Components
const Icon = styled('i')({})

// Brand featured status color
const brandStatusObj: Record<string, 'success' | 'secondary'> = {
  true: 'success',
  false: 'secondary',
}

// DebouncedInput copied/adjusted from UserListTable, for search
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.ComponentProps<typeof TextField>, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

type BrandTableType = Brand & { action?: string }

const columnHelper = createColumnHelper<BrandTableType>()

// ---- Provide a no-op fuzzy filter to satisfy type requirements ----
const fuzzyFilter: FilterFn<any> = (row, columnId, filterValue) => {
  // For demonstration, fallback to includesString (for compatibility, not fuzzy).
  const cellValue = row.getValue(columnId)
  if (typeof cellValue === 'string' && typeof filterValue === 'string') {
    return cellValue.toLowerCase().includes(filterValue.toLowerCase())
  }
  return false
}

// Merge defaultFilterFns and the required "fuzzy"
const customFilterFns = {
  ...defaultFilterFns,
  fuzzy: fuzzyFilter
}

const BrandsManagement = () => {
  // State
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isFeatured, setIsFeatured] = useState(false)
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [brandToDelete, setBrandToDelete] = useState<BrandTableType | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(false)

  // Build params for hook
  const params = useMemo(() => ({
    page: page + 1,
    pageSize,
    ...(search.trim() ? { search: `all:${search.trim()}`  } : {})
  }), [page, pageSize, search])

  const [brandsData, setBrandsData] = useState<{data: BrandTableType[], pagination: {total: number}}>({ data: [], pagination: { total: 0 } })
  const [brandsLoading, setBrandsLoading] = useState<boolean>(true)
  const [brandsError, setBrandsError] = useState<boolean>(false)

  const fetchBrands = async () => {
    setBrandsLoading(true)
    setBrandsError(false)
    try {
      const resp = await api.get('/brands', { params })
      setBrandsData({
        data: resp.data?.data ?? [],
        pagination: resp.data?.pagination ?? { total: 0 }
      })
    } catch (e) {
      setBrandsError(true)
    }
    setBrandsLoading(false)
  }

  useEffect(() => {
    fetchBrands()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search])

  const rows: BrandTableType[] = brandsData.data
  const total = brandsData.pagination.total

  // Create or Edit a brand according to spec
  const submit = async () => {
    setLoading(true)
    const fd = new FormData()
    fd.append('name', name)
    fd.append('slug', slug)
    fd.append('description', description)
    if (image) fd.append('image', image)
    fd.append('isFeatured', String(isFeatured))

    try {
      if (editing) {
        // Edit mode: PATCH /brands/{brandId}
        await api.patch(`/brands/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        // Create mode: POST /brands
        await api.post('/brands', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setOpen(false)
      setEditing(null)
      setName('')
      setSlug('')
      setDescription('')
      setImage(null)
      setPreviewImage(null)
      setIsFeatured(false)
      await fetchBrands()
    } catch (e) {
      // Optionally: Show error to user
    }
    setLoading(false)
  }

  // Action column: when click delete
  const handleDeleteClick = (brand: BrandTableType) => {
    setBrandToDelete(brand)
    setDeleteDialogOpen(true)
  }
  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!brandToDelete) return
    setDeleting(true)
    try {
      await api.delete(`/brands/${brandToDelete.id}`)
      setDeleteDialogOpen(false)
      setBrandToDelete(null)
      await fetchBrands()
    } catch (e) {
      // Optionally: Notify error
    }
    setDeleting(false)
  }

  // Handle edit
  const handleEditClick = (brand: BrandTableType) => {
    setEditing(brand)
    setName(brand.name)
    setSlug(brand.slug || '')
    setDescription(brand.description || '')
    setIsFeatured(!!brand.isFeatured)
    setImage(null)
    setPreviewImage(null)
    setOpen(true)
  }

  // Table columns: like branches + logo
  const columns = useMemo(() => [
    // Brand Logo + Name
    columnHelper.accessor('logoUrl', {
      id: 'logo',
      header: 'Logo',
      cell: ({ row }) => (
        row.original.logoUrl ? (
          <img
            src={row.original.logoUrl}
            alt={row.original.name}
            style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8 }}
          />
        ) : (
          <span style={{ color: '#aaa' }}>—</span>
        )
      )
    }),
    columnHelper.accessor('name', {
      id: 'brandName',
      header: 'Name',
      cell: ({ row }) =>
        <Typography color='text.primary' className='font-medium'>
          {row.original.name}
        </Typography>
    }),
    columnHelper.accessor('slug', {
      header: 'Slug',
      cell: ({ row }) =>
        <Typography>{row.original.slug}</Typography>
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: ({ row }) =>
        <Typography>
          {row.original.description || '—'}
        </Typography>
    }),
    columnHelper.accessor('isFeatured', {
      header: 'Featured',
      cell: ({ row }) =>
        <Chip
          variant='tonal'
          label={row.original.isFeatured ? 'Featured' : '—'}
          size='small'
          color={row.original.isFeatured ? brandStatusObj['true'] : brandStatusObj['false']}
          className='capitalize'
        />
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: ({ row }) => (
        <Typography variant='body2'>
          {/* Defensive: only new Date if defined, or show "—" */}
          {row.original.createdAt
            ? new Date(row.original.createdAt as string | number | Date).toLocaleString()
            : '—'}
        </Typography>
      )
    }),
    columnHelper.accessor('action', {
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center gap-0.5'>
          <IconButton
            size='small'
            onClick={() => handleDeleteClick(row.original)}
            disabled={deleting}
            aria-label="Delete"
          >
            <i className='ri-delete-bin-7-line text-textSecondary' />
          </IconButton>
          {/* You could add "View" icon if you want; for brands, typically not needed */}
          <OptionMenu
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'Edit',
                icon: 'ri-edit-box-line',
                menuItemProps: {
                  onClick: () => handleEditClick(row.original)
                }
              }
            ]}
          />
        </div>
      ),
      enableSorting: false
    })
  ], [deleting])

  // Table
  const table = useReactTable({
    data: rows,
    columns,
    state: {},
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: customFilterFns
  })

  // Add/Edit dialog close handler
  const handleDialogClose = () => {
    setOpen(false)
    setEditing(null)
    setName('')
    setSlug('')
    setDescription('')
    setImage(null)
    setPreviewImage(null)
    setIsFeatured(false)
  }

  // --- image file input change handler for previewing the selected file ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = function (ev) {
        setPreviewImage(typeof ev.target?.result === 'string' ? ev.target.result : null)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewImage(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <div>
        <Typography variant='h4'>Brand Management</Typography>
      </div>
      <div>
        <Card>
          <CardHeader title='List of Brands' className='pbe-4' />
          <Divider />
          <CardContent>
            <div className='flex justify-between gap-4 mb-4 flex-col items-start sm:flex-row sm:items-center'>
              <Button
                color='secondary'
                variant='outlined'
                startIcon={<i className='ri-upload-2-line' />}
                className='max-sm:is-full'
                disabled
              >
                Export
              </Button>
              <div className='flex items-center gap-x-4 max-sm:gap-y-4 flex-col max-sm:is-full sm:flex-row'>
                <DebouncedInput
                  value={search}
                  onChange={v => { setSearch(String(v)); setPage(0) }}
                  placeholder='Search Brand'
                  className='max-sm:is-full'
                />
                <Button variant='contained' onClick={() => { setEditing(null); setOpen(true) }} className='max-sm:is-full'>
                  Add New Brand
                </Button>
              </div>
            </div>
            {brandsError ? (
              <div className='my-8'><Typography color='error'>Failed to load brands.</Typography></div>
            ) : brandsLoading ? (
              <Skeleton variant='rounded' height={340} />
            ) : (
              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id}>
                            {header.isPlaceholder ? null : (
                              <>
                                <div
                                  className={classnames({
                                    'flex items-center': header.column.getIsSorted(),
                                    'cursor-pointer select-none': header.column.getCanSort()
                                  })}
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  {{
                                    asc: <i className='ri-arrow-up-s-line text-xl' />,
                                    desc: <i className='ri-arrow-down-s-line text-xl' />
                                  }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                                </div>
                              </>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  {rows.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={columns.length} className='text-center'>
                          No brands found
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {table.getRowModel().rows
                        .slice(0, table.getState().pagination?.pageSize ?? pageSize)
                        .map(row => (
                        <tr key={row.id} className={classnames({ selected: row.getIsSelected?.() })}>
                          {row.getVisibleCells().map(cell =>
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component='div'
                  className='border-bs'
                  count={total}
                  rowsPerPage={pageSize}
                  page={page}
                  SelectProps={{
                    inputProps: { 'aria-label': 'rows per page' }
                  }}
                  onPageChange={(_, p) => setPage(p)}
                  onRowsPerPageChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        disableEscapeKeyDown={deleting}
        aria-labelledby='delete-brand-dialog-title'
      >
        <DialogTitle id='delete-brand-dialog-title'>Delete Brand?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete the brand <b>{brandToDelete?.name}</b>?<br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color='error' variant='contained' onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit dialog */}
      <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editing ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-4'>
          <TextField label='Name' value={name} onChange={e => setName(e.target.value)} />
          <TextField label='Slug' value={slug} onChange={e => setSlug(e.target.value)} />
          <TextField label='Description' multiline minRows={3} value={description} onChange={e => setDescription(e.target.value)} />
          <div className='flex items-center gap-2'>
            <Switch
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              color='primary'
              inputProps={{ 'aria-label': 'Featured Switch' }}
            />
            <Typography variant='body2'>Featured</Typography>
          </div>
          {/* IMAGE PREVIEW + UPLOAD BUTTON */}
          <div className='flex flex-col gap-2'>
            <Button component='label' variant='outlined'>
              {image
                ? image.name
                : (editing?.logoUrl
                    ? <>
                        <img
                          src={editing.logoUrl}
                          alt="logo"
                          width={28}
                          height={28}
                          style={{marginRight: 8, verticalAlign: 'middle', borderRadius: 4}}
                        /> {editing.logoUrl.split('/').pop()}
                      </>
                    : 'Upload Logo')}
              <input hidden type='file' accept='image/*' onChange={handleImageChange} />
            </Button>
            {/* Preview section */}
            {(previewImage || (!image && editing?.logoUrl)) && (
              <div style={{marginTop: 8}}>
                <Typography variant="caption" display="block" gutterBottom>Preview:</Typography>
                <img
                  src={previewImage || (editing?.logoUrl ?? '')}
                  alt="Selected logo preview"
                  style={{ maxHeight: 70, maxWidth: '100%', borderRadius: 8, border: '1px solid #eee', background: '#fafafa' }}
                />
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant='contained'
            onClick={submit}
            disabled={loading || !name || !slug || (!editing && !image)}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default BrandsManagement
