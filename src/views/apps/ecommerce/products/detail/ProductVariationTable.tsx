'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '@/libs/api'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import type { TextFieldProps } from '@mui/material/TextField'
import { useRouter } from 'next/navigation'
// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  type ColumnDef,
  type FilterFn
} from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { Locale } from '@configs/i18n'
import { ProductVariant } from '@/types/products'

// Component Imports
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useProduct } from '@/api/products/useProduct'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type VariantRowType = ProductVariant & { actions?: string }

type productStatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

const variantStatusObj: productStatusType = {
  ACTIVE: { title: 'Active', color: 'success' },
  INACTIVE: { title: 'Inactive', color: 'error' }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({
    itemRank
  })
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

const getOptionSummary = (variant: ProductVariant) => {
  if (!variant?.variantOptionValues?.length) return '';
  return variant.variantOptionValues.map(
    v =>
      `${v.optionValue?.option?.name ?? ''}: ${v.optionValue?.value ?? ''}`
  ).join(' | ');
}

const getInventorySummary = (inventories: ProductVariant['inventories']): string => {
  if (!inventories || inventories.length === 0) return 'N/A';
  return inventories
    .map(
      inv =>
        `${inv.location?.name ?? ''}${typeof inv.quantity === 'number' ? `: ${inv.quantity}` : ''}`
    )
    .join(', ');
};

const columnHelper = createColumnHelper<VariantRowType>()

const ProductVariationDetailTable = () => {
  // Table states
  const params = useParams()
  const id = params.detail as string
  const {data:product}=useProduct(id,true)
  console.log("product details in page file",product)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const { lang: locale } = useParams()

  // For delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filtered and paginated variants
  const filteredVariants = useMemo(() => {
    if (!globalFilter) return product?.variants??[]
    const lcFilter = globalFilter.toLowerCase()
    return product?.variants?.filter(v =>
      (v.sku?.toLowerCase().includes(lcFilter) ||
        v.barcode?.toLowerCase().includes(lcFilter) ||
        v.variantOptionValues?.some(
          vv => vv.optionValue?.value?.toLowerCase().includes(lcFilter)
        )
      )
    )
  }, [product, globalFilter])

  const paginatedVariants = useMemo(() => {
    const start = page * pageSize
    const end = start + pageSize
    return filteredVariants?.slice(start, end)??[]
  }, [filteredVariants, page, pageSize])

  // Handler to confirm delete
  const handleDeleteVariant = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/product-variants/${deleteId}`)
      setDeleteDialogOpen(false)
      setDeleteId(null)
      // Could refetch variants if coming from server
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<VariantRowType, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('image', {
        header: 'Image',
        cell: ({ row }) => (
          <div className='flex items-center'>
            {row.original.image ? (
              <img
                src={row.original.image}
                width={38}
                height={38}
                alt={row.original.sku}
                className='rounded-md bg-actionHover'
                style={{ objectFit: 'cover', minWidth: 38, minHeight: 38 }}
              />
            ) : (
              <span className='text-gray-400 text-sm'>No Image</span>
            )}
          </div>
        )
      }),
      columnHelper.accessor('sku', {
        header: 'SKU',
        cell: ({ row }) => <Typography>{row.original.sku}</Typography>
      }),
      columnHelper.accessor('barcode', {
        header: 'Barcode',
        cell: ({ row }) => <Typography>{row.original.barcode ?? '-'}</Typography>
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ row }) => <Typography>{row.original.price != null ? `$${row.original.price}` : '-'}</Typography>
      }),
      columnHelper.accessor('comparePrice', {
        header: 'Compare Price',
        cell: ({ row }) =>
          row.original.comparePrice != null ? (
            <Typography><s>${row.original.comparePrice}</s></Typography>
          ) : (
            <span>-</span>
          )
      }),
      columnHelper.accessor('costPrice', {
        header: 'Cost Price',
        cell: ({ row }) => row.original.costPrice != null ? <Typography>${row.original.costPrice}</Typography> : <span>-</span>
      }),
      columnHelper.accessor(row => getOptionSummary(row), {
        id: 'options',
        header: 'Options',
        cell: ({ row }) =>
          <Typography variant='body2'>
            {getOptionSummary(row.original) || '-'}
          </Typography>
      }),
      columnHelper.accessor(row => getInventorySummary(row.inventories), {
        id: 'stock',
        header: 'Stock / Inventory',
        cell: ({ row }) => (
          <Typography variant='body2'>
            {getInventorySummary(row.original.inventories)}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={variantStatusObj[row.original.status]?.title ?? row.original.status}
            variant='tonal'
            color={variantStatusObj[row.original.status]?.color ?? 'secondary'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton
              size='small'
              onClick={() =>
                router.push(
                  getLocalizedUrl(
                    `/apps/ecommerce/products/add?isUpdate=true&variantId=${encodeURIComponent(row.original.id)}`,
                    locale as Locale
                  )
                )
              }
              title="Edit Variant"
            >
              <i className='ri-pencil-line text-[20px] text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              color='error'
              title="Delete Variant"
              onClick={() => {
                setDeleteId(row.original.id)
                setDeleteDialogOpen(true)
              }}
            >
              <i className="ri-delete-bin-7-line text-[20px]" />
            </IconButton>
            {/* Add more actions if needed */}
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  )

  const table = useReactTable({
    data: paginatedVariants,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      pagination: {
        pageIndex: page,
        pageSize: pageSize,
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Pagination controls
  const handleChangePage = (_: React.MouseEvent | null, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <>
      <Card>
        <CardHeader title="Variant List" />
        <Divider />
        <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
          <DebouncedInput
            value={globalFilter}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search by SKU, Barcode, or Option'
            className='max-sm:is-full'
          />
          <Button
            variant='contained'
            component={Link}
            href={getLocalizedUrl(`/apps/ecommerce/products/add?productId=${id}&only_variation=true`, locale as Locale)}
            startIcon={<i className='ri-add-line' />}
            className='max-sm:is-full is-auto'
          >
            Add Variant
          </Button>
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
            {paginatedVariants.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={columns.length} className='text-center'>
                    No variants available.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
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
          count={filteredVariants?.length??0}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Variant</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this variant? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteVariant} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductVariationDetailTable
