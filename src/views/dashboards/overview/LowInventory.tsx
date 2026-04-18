'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'

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
import { useSelector } from 'react-redux'

import tableStyles from '@core/styles/table.module.css'
import type { RootState } from '@/redux-store'
import { useDashboardLowInventory } from '@/api/admin/dashboard'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

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
      variantOption: item.variant?.sku || '',
      quantity: typeof item.quantity === 'number' ? item.quantity : 0,
      reservedQuantity: typeof item.reservedQuantity === 'number' ? item.reservedQuantity : 0,
      reorderLevel: typeof item.reorderLevel === 'number' ? item.reorderLevel : 0,
      locationName: item.location?.name || 'Unknown location'
    }))
  }, [lowInventory])

  const tableData = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: rowCount }, (_, idx) => ({
        id: `skeleton-${idx}`,
        productName: null,
        variantOption: null,
        quantity: null,
        reservedQuantity: null,
        reorderLevel: null,
        locationName: null
      }))
    }

    return data.slice(0, rowCount)
  }, [isLoading, data])

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('productName', {
        header: 'Product',
        cell: ({ row }) =>
          row.original.productName === null ? (
            <Skeleton variant='text' width={120} animation={false} />
          ) : (
            <div className='flex flex-col gap-1'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.productName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Reorder at {row.original.reorderLevel}
              </Typography>
            </div>
          )
      }),
      columnHelper.accessor('variantOption', {
        header: 'SKU',
        cell: ({ row }) =>
          row.original.variantOption === null ? (
            <Skeleton variant='text' width={80} animation={false} />
          ) : (
            <Typography className='font-medium'>
              {row.original.variantOption}
            </Typography>
          )
      }),
      columnHelper.accessor('locationName', {
        header: 'Location',
        cell: ({ row }) =>
          row.original.locationName === null ? (
            <Skeleton variant='text' width={90} animation={false} />
          ) : (
            <Typography color='text.secondary'>
              {row.original.locationName}
            </Typography>
          )
      }),
      columnHelper.accessor('quantity', {
        header: 'Stock Status',
        cell: ({ row }) =>
          row.original.quantity === null ? (
            <Skeleton variant='rounded' width={120} height={28} animation={false} />
          ) : (
            <div className='flex flex-col items-start gap-2'>
              <Typography className='font-medium'>
                {row.original.quantity} available / {row.original.reservedQuantity} reserved
              </Typography>
              <Chip
                size='small'
                variant='tonal'
                color={row.original.quantity <= 0 ? 'error' : 'warning'}
                label={row.original.quantity <= 0 ? 'Out of stock' : 'Low stock'}
              />
            </div>
          )
      })
    ],
    []
  )

  const table = useReactTable({
    data: tableData,
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
      <Card className='border border-[var(--mui-palette-divider)] shadow-none'>
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
                    No low inventory items right now
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
