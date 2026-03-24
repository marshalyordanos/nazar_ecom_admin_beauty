'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'
import { api } from '@/libs/api' // Use api here for delete
// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import TableFilters from './TableFilters'
import AddUserDrawer from './AddUserDrawer'
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { RootState } from '@/redux-store'
import { useSelector } from 'react-redux'
import { useShops } from '@/api/shops/useShops'
import { Location } from '@/types/shop'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type BranchLocationType = {
  id: string
  shopId: string
  name: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string | null
  country: string
  postalCode: string | null
  latitude: number
  longitude: number
  phone: string
  createdAt: string
}

type BranchLocationTypeWithAction = BranchLocationType & {
  action?: string
  shopName?: string
  shopStatus?: string
  shopLogoUrl?: string
  shopCurrency?: string
}

type BranchStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
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

const branchStatusObj: BranchStatusType = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  PENDING: 'warning'
}

// Column Definitions
const columnHelper = createColumnHelper<BranchLocationTypeWithAction>()

// Use api.delete for deletion call
async function deleteLocation(id: string): Promise<boolean> {
  try {
    const resp = await api.delete(`/shops/locations/${id}`)
    return resp.status === 200 || resp.status === 204
  } catch (e) {
    // You can enhance the error handling as needed
    return false
  }
}

const BranchesTable = () => {
  const { data: shopsdata, refetch } = useShops({ page: 1, pageSize: 10 })

  // States
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [locations, setLocations] = useState<BranchLocationTypeWithAction[]>([])
  const [filteredData, setFilteredData] = useState<BranchLocationTypeWithAction[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  // Modal states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [locationToDelete, setLocationToDelete] = useState<BranchLocationTypeWithAction | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [errorDeleting, setErrorDeleting] = useState<string | null>(null)

  // Add editing-related state
  const [editData, setEditData] = useState<BranchLocationTypeWithAction | null>(null)

  useEffect(() => {
    if (!addUserOpen) {
      refetch()
    }
  }, [addUserOpen, refetch])

  const { lang: locale } = useParams()

  // Flatten locations whenever shops change
  useEffect(() => {
    if (Array.isArray(shopsdata?.data)) {
      // To ensure rows are unique, include shopId in each location if not present, and rely on location.id for uniqueness
      const allLocations = shopsdata?.data.flatMap((shop: any) =>
        Array.isArray(shop.locations)
          ? shop.locations.map((loc: BranchLocationType) => ({
              ...loc,
              shopName: shop.name,
              shopStatus: shop.status,
              shopLogoUrl: shop.logoUrl,
              shopCurrency: shop.currency,
              shopId: loc.shopId ?? shop.id // Defensive: ensure shopId present
            }))
          : []
      )
      setLocations(allLocations)
      setFilteredData(allLocations)
    }
  }, [shopsdata])

  // Confirm delete dialog
  const handleDeleteClick = (location: BranchLocationTypeWithAction) => {
    setLocationToDelete(location)
    setDeleteDialogOpen(true)
    setErrorDeleting(null)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setLocationToDelete(null)
    setErrorDeleting(null)
  }

  const handleConfirmDelete = async () => {
    if (!locationToDelete?.id) return
    setDeleting(true)
    setErrorDeleting(null)
    const success = await deleteLocation(locationToDelete.id)
    setDeleting(false)
    if (success) {
      setLocations(prev => prev.filter(loc => loc.id !== locationToDelete.id))
      setFilteredData(prev => prev.filter(loc => loc.id !== locationToDelete.id))
      handleCloseDeleteDialog()
    } else {
      setErrorDeleting('Failed to delete branch location. Please try again.')
    }
  }

  // Handle edit for branch - open drawer and set data
  const handleEditClick = (location: BranchLocationTypeWithAction) => {
    console.log(location)
    setEditData(location)
    setAddUserOpen(true)
  }

  // Handler for OptionMenu option click
  const handleOptionMenuClick = (option: any, row: any) => {
    if (option.text === 'Edit') {
      handleEditClick(row.original)
    }
    // You may handle "Download" or others if desired.
  }

  // Fix: use OptionMenu's action property inside options array
  // Uniqueness fix: Provide unique accessor id for each column (avoid duplicating 'name' accessor key)
  const columns = useMemo<ColumnDef<BranchLocationTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      // Branch Name column - accessorKey: 'name', id auto'd as 'name'
      columnHelper.accessor('name', {
        id: 'branchName',
        header: 'Branch Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.name}
          </Typography>
        )
      }),
      // Shop Name column - use a different id to avoid duplicate key
      columnHelper.accessor(row => row.shopName, {
        id: 'shopName',
        header: 'Shop Name',
        cell: ({ row }: any) => (
          <div className='flex gap-2 items-center'>
            {row.original.shopLogoUrl && (
              <img
                src={row.original.shopLogoUrl}
                alt={row.original.shopName}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <Typography color='text.primary'>{row.original.shopName}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('addressLine1', {
        header: 'Address',
        cell: ({ row }) => (
          <Typography>
            {row.original.addressLine1}
            {row.original.addressLine2 ? `, ${row.original.addressLine2}` : ''}
          </Typography>
        )
      }),
      columnHelper.accessor('city', {
        header: 'City',
        cell: ({ row }) => (
          <Typography>
            {row.original.city}
          </Typography>
        )
      }),
      columnHelper.accessor('country', {
        header: 'Country',
        cell: ({ row }) => (
          <Typography>
            {row.original.country}
          </Typography>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => (
          <Typography>
            {row.original.phone}
          </Typography>
        )
      }),
      columnHelper.accessor(row => row.shopStatus, {
        id: 'shopStatus',
        header: 'Shop Status',
        cell: ({ row }: any) => (
          <Chip
            variant='tonal'
            label={row.original.shopStatus}
            size='small'
            color={branchStatusObj[(row.original.shopStatus || '').toUpperCase()] || 'default'}
            className='capitalize'
          />
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {new Date(row.original.createdAt).toLocaleString()}
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
            <IconButton size='small'>
              <Link href={getLocalizedUrl('/apps/branches/view', locale as Locale)} className='flex'>
                <i className='ri-eye-line text-textSecondary' />
              </Link>
            </IconButton>
            <OptionMenu
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Download',
                  icon: 'ri-download-line'
                  // No action for download
                },
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locations, filteredData, deleting]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  // When we close the drawer, clear editData so we reset form for next open
  const handleDrawerClose = () => {
    setAddUserOpen(false)
    setEditData(null)
  }

  return (
    <>
      <Card>
        <CardHeader title='List of Branches' className='pbe-4' />
        {/* <TableFilters setData={setFilteredData} tableData={locations} /> */}
        <Divider />
        <div className='flex justify-between gap-4 p-5 flex-col items-start sm:flex-row sm:items-center'>
          <Button
            color='secondary'
            variant='outlined'
            startIcon={<i className='ri-upload-2-line' />}
            className='max-sm:is-full'
          >
            Export
          </Button>
          <div className='flex items-center gap-x-4 max-sm:gap-y-4 flex-col max-sm:is-full sm:flex-row'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Branch'
              className='max-sm:is-full'
            />
            <Button
              variant='contained'
              onClick={() => {
                setEditData(null)
                setAddUserOpen(true)
              }}
              className='max-sm:is-full'
            >
              Add New Branch
            </Button>
          </div>
        </div>
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
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
                    // Here ensure the row key is unique.
                    // row.id is generated by react-table and should be unique as long as columns' id/accessorKey are unique
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          // cell.id uses the format rowId_columnId, and columnId is now unique (branchName/shopName/etc)
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component='div'
          className='border-bs'
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        disableEscapeKeyDown={deleting}
        aria-labelledby='delete-branch-dialog-title'
      >
        <DialogTitle id='delete-branch-dialog-title'>Delete Branch Location?</DialogTitle>
        <DialogContent>
          {errorDeleting && <Typography color="error" variant="body2">{errorDeleting}</Typography>}
          <DialogContentText>
            Are you sure you want to permanently delete the branch{' '}
            <b>{locationToDelete?.name}</b>?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color='error'
            variant='contained'
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <AddUserDrawer
        shopId={editData?.shopId || shopsdata?.data[0]?.id || ''}
        open={addUserOpen}
        handleClose={handleDrawerClose}
        data={editData ? editData as unknown as Location : null}
        setData={()=>{}}
      />
    </>
  )
}

export default BranchesTable
