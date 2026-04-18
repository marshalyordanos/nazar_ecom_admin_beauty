'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
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
import { useSelector } from 'react-redux'

// Type Imports
import type { ThemeColor } from '@core/types'
import type { RootState } from '@/redux-store'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { useDashboardRecentOrders } from '@/api/admin/dashboard'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Map order status to color
const userStatusObj: { [key: string]: ThemeColor } = {
  PENDING: 'warning',
  PAID: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error'
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<any>()

const UserListTable = () => {
  const shop: any = useSelector((state: RootState) => state.shopReducer.shops)
  const { data: recentOrders, isLoading } = useDashboardRecentOrders(shop?.[0]?.id)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const data = useMemo(() => {
    if (!Array.isArray(recentOrders)) return []

    return recentOrders.map((order, idx) => {
      const user = order.user || {}

      const fullName = (user.firstName && user.lastName)
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || ''

      return {
        id: order.id || idx,
        fullName,
        email: user.email || '',
        status: order.status || '',
        orderNumber: order.orderNumber || '',
        createdAt: order.createdAt || '',
        grandTotal: order.grandTotal || 0,
        currency: order.currency || '',
        itemsCount: Array.isArray(order.items) ? order.items.length : 0
      }
    })
  }, [recentOrders])

  const rowCount = 9

  const tableData = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: rowCount }, (_, idx) => ({
        id: `skeleton-${idx}`,
        fullName: null,
        email: null,
        status: null,
        orderNumber: null,
        createdAt: null,
        grandTotal: null,
        currency: null,
        itemsCount: null
      }))
    }

    return data.slice(0, rowCount)
  }, [data, isLoading, rowCount])

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor('fullName', {
        header: 'Customer',
        cell: ({ row }) =>
          row.original.fullName === null ? (
            <div className='flex items-center gap-3'>
              <Skeleton variant='circular' width={34} height={34} animation={false} />
              <div className='flex flex-col'>
                <Skeleton variant='text' width={80} height={24} animation={false} />
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <CustomAvatar skin='light' size={34}>
                {getInitials(row.original.fullName || '')}
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography color='text.primary' className='font-medium'>
                  {row.original.fullName}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {row.original.email}
                </Typography>
              </div>
            </div>
          )
      }),
      columnHelper.accessor('orderNumber', {
        header: 'Order',
        cell: ({ row }) =>
          row.original.orderNumber === null ? (
            <Skeleton variant='text' width={90} animation={false} />
          ) : (
            <div className='flex flex-col gap-1'>
              <Typography className='font-medium'>{row.original.orderNumber}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {row.original.itemsCount} item{row.original.itemsCount === 1 ? '' : 's'}
              </Typography>
            </div>
          )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Placed',
        cell: ({ row }) =>
          row.original.createdAt === null ? (
            <Skeleton variant='text' width={120} animation={false} />
          ) : (
            <div className='flex flex-col gap-1'>
              <Typography>{new Date(row.original.createdAt).toLocaleDateString()}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {new Date(row.original.createdAt).toLocaleTimeString()}
              </Typography>
            </div>
          )
      }),
      columnHelper.accessor('grandTotal', {
        header: 'Total',
        cell: ({ row }) =>
          row.original.grandTotal === null ? (
            <Skeleton variant='text' width={60} animation={false} />
          ) : (
            <Typography className='font-medium'>
              {new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(row.original.grandTotal)}{' '}
              {row.original.currency}
            </Typography>
          )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) =>
          row.original.status === null ? (
            <Skeleton variant='rounded' width={60} height={28} animation={false} />
          ) : (
            <div className='flex items-center gap-3'>
              <Chip
                variant='tonal'
                className='capitalize'
                label={row.original.status}
                color={userStatusObj[row.original.status]}
                size='small'
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
                    No recent orders found
                  </td>
                </tr>
              ) : (
                filteredRows.slice(0, rowCount).map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

export default UserListTable
