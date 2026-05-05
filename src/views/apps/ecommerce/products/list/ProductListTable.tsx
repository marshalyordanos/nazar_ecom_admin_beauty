'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '@/libs/api'
import { formatAmountEt } from '@/libs/currency'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
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
// import type { ProductType } from '@/types/apps/ecommerceTypes'

// Component Imports
import TableFilters from './TableFilters'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useProducts } from '@/api/products/useProducts'
import { Product } from '@/types/products'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type ProductWithActionsType = Product & { actions?: string }

type ProductCategoryType = {
  [key: string]: {
    icon: string
    color: ThemeColor
  }
}

type productStatusType = {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}

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
  // States
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

// Vars
const productCategoryObj: ProductCategoryType = {
  Accessories: { icon: 'ri-headphone-line', color: 'error' },
  'Home Decor': { icon: 'ri-home-6-line', color: 'info' },
  Electronics: { icon: 'ri-computer-line', color: 'primary' },
  Shoes: { icon: 'ri-footprint-line', color: 'success' },
  Office: { icon: 'ri-briefcase-line', color: 'warning' },
  Games: { icon: 'ri-gamepad-line', color: 'secondary' }
}

const productStatusObj: productStatusType = {
  ACTIVE: { title: 'Active', color: 'success' },
  INACTIVE: { title: 'Inactive', color: 'error' }
}

// Column Definitions
const columnHelper = createColumnHelper<ProductWithActionsType>()

const ProductListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const router = useRouter()
  // Pagination state - page index is 0-based, but API is 1-based
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading, isError, error, isFetching, refetch } = useProducts({
    page: page + 1,
    pageSize,
    search:{
      name: globalFilter
    }
  });

  // Convert and flatten the product data for the table
  const products: ProductWithActionsType[] = useMemo(() => {
    if (!data?.data) return []
    return data.data.map((product: Product) => ({
      ...product
    }))
  }, [data])

  const [filteredData, setFilteredData] = useState<ProductWithActionsType[]>(products)

  // For delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Update local filteredData if fetched products change
  useEffect(() => {
    setFilteredData(products)
  }, [products])

  // Hooks
  const { lang: locale } = useParams()

  // Handler to confirm delete
  const handleDeleteProduct = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.delete(`/products/${deleteId}`)
      setDeleteDialogOpen(false)
      setDeleteId(null)
      // Refetch products after delete
      refetch && refetch()
    } catch (err) {
      // Handling could be improved for production
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const columns = useMemo<ColumnDef<ProductWithActionsType, any>[]>(
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
      // columnHelper.accessor('order', {
      //   header: 'Order',
      //   cell: ({ row }) => (
      //     <Typography
      //       component={Link}
      //       href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original.order}`, locale as Locale)}
      //       color='primary.main'
      //     >{`#${row.original.order}`}</Typography>
      //   )
      // }),
      columnHelper.accessor('name', {
        header: 'Product',
        cell: ({ row }) => {
          const firstImage =
            row.original.variants && row.original.variants.length > 0
              ? row.original.variants[0].image
              : ''
          return (
            <div className='flex items-center gap-3'>
              {firstImage && (
                <img src={firstImage} width={38} height={38} className='rounded-md bg-actionHover' alt={row.original.name} />
              )}
              <div className='flex flex-col'>
                <Typography className='font-medium' 
                component={Link}
                href={getLocalizedUrl(`/apps/ecommerce/products/list/${encodeURIComponent(row.original.id)}`, locale as Locale)}
                color='primary.main'
                >
                  {row.original.name}
                </Typography>
                <Typography variant='body2'>{row.original.brand?.name}</Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor(row => row.category?.name, {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const categoryName = row.original.category?.name
          const firstImage = row.original.category?.image
          const iconObj = categoryName && productCategoryObj[categoryName]
          return (
            <div className='flex items-center gap-3'>
               {firstImage && (
                <img src={firstImage} width={28} height={28} className='rounded-full bg-actionHover' alt={row.original.name} />
              )}
              <Typography color='text.primary'>{categoryName}</Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor(row => row.variants?.length ?? 0, {
        id: 'variationCount',
        header: 'Variations',
        cell: ({ row }) =>
          <Typography>{row.original.variants?.length ?? 0}</Typography>
      }),
      columnHelper.accessor(row => row.variants?.[0]?.sku ?? '', {
        id: 'sku',
        header: 'SKU',
        cell: ({ row }) => <Typography>{row.original.variants?.[0]?.sku ?? ''}</Typography>
      }),
      columnHelper.accessor(row => row.variants?.[0]?.price ?? '', {
        id: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <Typography>
            {row.original.variants?.[0]?.price != null ? formatAmountEt(row.original.variants[0].price) : ''}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={productStatusObj[row.original.status]?.title ?? row.original.status}
            variant='tonal'
            color={productStatusObj[row.original.status]?.color ?? 'secondary'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            {/* <IconButton size='small'>
              <i className='ri-edit-box-line text-[22px] text-textSecondary' />
            </IconButton> */}
            <Button
              variant='outlined'
              size='small'
              color='primary'
              component={Link}
              href={
                getLocalizedUrl(
                  `/apps/ecommerce/products/add?only_variation=true&productId=${encodeURIComponent(row.original.id)}`,
                  locale as Locale
                )
              }
              className='ml-2 mr-1'
              style={{ marginLeft: 8, marginRight: 4 }}
            >
              Add Variation
            </Button>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary text-[22px]'
              options={[
                { text: 'View', icon: 'ri-eye-line',
                  menuItemProps: {
                    onClick: () => {
                      router.push(
                        getLocalizedUrl(`/apps/ecommerce/products/list/${encodeURIComponent(row.original.id)}`, locale as Locale)

                      )
                    }
                  }
                },
                { text: 'Update', icon: 'ri-pencil-line',
                  menuItemProps: {
                    onClick: () => {
                      router.push(
                        getLocalizedUrl(
                          `/apps/ecommerce/products/add?productId=${encodeURIComponent(row.original.id)}&isUpdate=true`,
                          locale as Locale
                        )
                      )
                    }
                  }
                 },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line',
                  menuItemProps: {
                    onClick: () => {
                      setDeleteId(row.original.id)
                      setDeleteDialogOpen(true)
                    }
                  }
                },
                { text: 'Duplicate', icon: 'ri-stack-line' }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredData]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      // globalFilter,
      pagination: {
        pageIndex: page,
        pageSize: pageSize,
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    // onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  // Handle Table pagination with backend
  const handleChangePage = (_: React.MouseEvent | null, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <>
      <Card>
        <CardHeader title='Filters' />
        <TableFilters setData={setFilteredData} productData={products} />
        <Divider />
        <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center gap-y-4 p-5'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Product'
            className='max-sm:is-full'
          />
          <div className='flex items-center max-sm:flex-col gap-4 max-sm:is-full is-auto'>
            <Button
              color='secondary'
              variant='outlined'
              className='max-sm:is-full is-auto'
              startIcon={<i className='ri-upload-2-line' />}
            >
              Export
            </Button>
            <Button
              variant='contained'
              component={Link}
              href={getLocalizedUrl('/apps/ecommerce/products/add', locale as Locale)}
              startIcon={<i className='ri-add-line' />}
              className='max-sm:is-full is-auto'
            >
              Add Product
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
            {isLoading || isFetching ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    Loading...
                  </td>
                </tr>
              </tbody>
            ) : table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
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
          count={data?.pagination?.total ?? 0}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteProduct} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductListTable
