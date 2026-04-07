'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'

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

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux-store'
import { useDashboardLowInventory } from '@/api/admin/dashboard'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper<any>()

const LowInventory = () => {
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)
  const { data: lowInventory, isLoading } = useDashboardLowInventory(shop?.[0]?.id)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Transform lowInventory into table data with required columns and skeleton for loading
  const rowCount = 9
  const data = useMemo(() => {
    if (!Array.isArray(lowInventory)) return []
    return lowInventory.map((item, idx) => ({
      id: item.id || idx,
      productName: item.variant?.product?.name || '',
      variantOption: item.variant?.sku || '', // fallback to sku (can adjust to show option value if available)
      quantity: typeof item.quantity === 'number' ? item.quantity : 0,
      reservedQuantity: typeof item.reservedQuantity === 'number' ? item.reservedQuantity : 0
    }))
  }, [lowInventory])

  const dataWithSkeletons = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: rowCount }, (_, idx) => ({
        id: `skeleton-${idx}`,
        productName: null,
        variantOption: null,
        quantity: null,
        reservedQuantity: null
      }))
    }
    if (data.length < rowCount) {
      return [
        ...data,
        ...Array.from({ length: rowCount - data.length }, (_, idx) => ({
          id: `skeleton-${idx + data.length}`,
          productName: null,
          variantOption: null,
          quantity: null,
          reservedQuantity: null
        }))
      ]
    }
    return data.slice(0, rowCount)
  }, [isLoading, data])

  // Columns: product name, product variant (sku), quantity, reservedQuantity
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('productName', {
        header: 'Product Name',
        cell: ({ row }) =>
          row.original.productName === null ? (
            <Skeleton variant='text' width={120} />
          ) : (
            <Typography color='text.primary' className='font-medium'>
              {row.original.productName}
            </Typography>
          )
      }),
      columnHelper.accessor('variantOption', {
        header: 'Variant (SKU)',
        cell: ({ row }) =>
          row.original.variantOption === null ? (
            <Skeleton variant='text' width={80} />
          ) : (
            <Typography>
              {row.original.variantOption}
            </Typography>
          )
      }),
      columnHelper.accessor('quantity', {
        header: 'Quantity',
        cell: ({ row }) =>
          row.original.quantity === null ? (
            <Skeleton variant='text' width={40} />
          ) : (
            <Typography>
              {row.original.quantity}
            </Typography>
          )
      }),
      columnHelper.accessor('reservedQuantity', {
        header: 'Reserved',
        cell: ({ row }) =>
          row.original.reservedQuantity === null ? (
            <Skeleton variant='text' width={40} />
          ) : (
            <Typography>
              {row.original.reservedQuantity}
            </Typography>
          )
      })
    ],
    []
  )

  const table = useReactTable({
    data: dataWithSkeletons,
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
        pageSize: rowCount
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

  const filteredRows = Array.isArray(table?.getFilteredRowModel?.().rows)
    ? table.getFilteredRowModel().rows
    : []

  return (
    <>
      <Card>
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
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              ) : (
                filteredRows.slice(0, rowCount).map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

export default LowInventory
