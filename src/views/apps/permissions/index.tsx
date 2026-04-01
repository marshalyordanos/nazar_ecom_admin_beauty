'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import type { TextFieldProps } from '@mui/material/TextField'
import type { ButtonProps } from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type FilterFn
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import PermissionDialog from '@components/dialogs/permission-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { useGetAllPermissions } from '@/api/acl/usePermissions'

// for color chips example role name => color
const colors: { [key: string]: ThemeColor } = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error',
  admin: 'primary',
  user: 'success'
}

// DebouncedInput
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

// Table type for rows
type PermissionTableRow = {
  id: string
  resource: string
  description: string
  createdAt: string
  roles: {
    name: string
    actions: {
      create: boolean
      read: boolean
      update: boolean
      delete: boolean
    }
  }[]
}

const columnHelper = createColumnHelper<PermissionTableRow>()

// Simple "fuzzy" filter function implementation (case-insensitive substring match)
const fuzzyFilter: FilterFn<PermissionTableRow> = (row, columnId, filterValue) => {
  const rowValue = row.getValue(columnId)
  if (typeof rowValue === 'string') {
    return rowValue.toLowerCase().includes(String(filterValue).toLowerCase())
  }
  return false
}

const Permissions = () => {
  // Table and search/pagination state
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [editValue, setEditValue] = useState<string>('')
  const [globalFilter, setGlobalFilter] = useState('')
  // Pagination
  const [page, setPage] = useState(0) // 0-indexed for TablePagination
  const [pageSize, setPageSize] = useState(10)

  // Query params for the API
  const params = {
    page: page + 1,
    pageSize,
    search: globalFilter ? { all: globalFilter } : undefined
  }

  // Get permissions from API
  const { data: permissions, isLoading } = useGetAllPermissions(params)

  // Normalize API to table rows
  const tableRows: PermissionTableRow[] = useMemo(() => {
    if (!permissions?.data) return []
    return permissions.data.map(perm => ({
      id: perm.id,
      resource: perm.resource,
      description: String(perm.description ?? ''),
      createdAt: perm.createdAt,
      roles: (perm.rolePermissions || []).map(rp => ({
        name: rp.role?.name || '',
        actions: {
          create: rp.createAction,
          read: rp.readAction,
          update: rp.updateAction,
          delete: rp.deleteAction
        }
      }))
    }))
  }, [permissions])

  // Column definitions
  const columns = useMemo<ColumnDef<PermissionTableRow, any>[]>(
    () => [
      columnHelper.accessor('resource', {
        header: 'Resource',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.resource}</Typography>
      }),
      columnHelper.accessor('roles', {
        header: 'Role(s)',
        cell: ({ row }) =>
          row.original.roles.length > 0
            ? row.original.roles.map((role, idx) => (
                <Chip
                  key={role.name + idx}
                  label={role.name}
                  color={colors[role.name] || 'secondary'}
                  className='capitalize mie-2'
                  size='small'
                />
              ))
            : <Chip label="None" color="default" size="small" />
      }),
      // --- REWRITTEN Permissions column ---
      columnHelper.accessor('roles', {
        header: 'Permissions',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            {row.original.roles.length > 0 ? (
              row.original.roles.map((role, idx) => (
                <div key={role.name + idx} className="flex gap-1 items-center">
                  <Typography variant="caption" sx={{ minWidth: 60 }}>{role.name}</Typography>
                  {['create', 'read', 'update', 'delete'].map(action => {
                    const hasPerm = role.actions[action as keyof typeof role.actions]
                    // Make as tag: very small, rectangle, minimal padding, sharp corners, new color (blue for enabled)
                    return (
                      <span
                        key={action}
                        style={{
                          display: 'inline-block',
                          minWidth: 12,
                          fontSize: '0.60rem',
                          fontWeight: 600,
                          borderRadius: 2,
                          padding: '0px 4px',
                          height: 18,
                          boxSizing: 'border-box',
                          background: hasPerm ? '#2563eb' : '#e5e7eb',
                          color: hasPerm ? '#fff' : '#64748b',
                          marginInlineEnd: 4,
                          lineHeight: '18px',
                          textAlign: 'center'
                        }}
                      >
                        {action.charAt(0).toUpperCase()}
                      </span>
                    )
                  })}
                </div>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                No roles
              </Typography>
            )}
          </div>
        )
      }),
      // --- END REWRITTEN Permissions column ---
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: ({ row }) => (
          <Typography variant="caption">
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : ''}
          </Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton size='small' onClick={() => handleEditPermission(row.original.id)}>
              <i className='ri-edit-box-line text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <i className='ri-more-2-line text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Provide the required 'fuzzy' filter function to satisfy the type requirement
  const filterFns: Record<'fuzzy', FilterFn<PermissionTableRow>> = {
    fuzzy: fuzzyFilter
  }

  // react-table instantiation
  const table = useReactTable({
    data: tableRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns,
    state: {
      rowSelection
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection
  })

  const handleEditPermission = (id: string) => {
    setOpen(true)
    setEditValue(id)
  }

  const handleAddPermission = () => {
    setEditValue('')
    setOpen(true)
  }

  const paginationTotal = permissions?.pagination?.total ?? 0

  return (
    <>
      <Card>
        <CardContent className='flex flex-col sm:flex-row items-start sm:items-center justify-between max-sm:gap-4'>
          <DebouncedInput
            value={globalFilter}
            onChange={value => {
              setGlobalFilter(String(value))
              setPage(0)
            }}
            placeholder='Search Permissions'
            className='max-sm:is-full'
          />
          <OpenDialogOnElementClick
            element={Button}
            elementProps={{
              variant: 'contained',
              children: 'Add Permission',
              onClick: handleAddPermission,
              className: 'max-sm:is-full'
            }}
            dialog={PermissionDialog}
            dialogProps={{ editValue, open, setOpen }}
          />
        </CardContent>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className='text-center'>
                    Loading...
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='text-center'>
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component='div'
          className='border-bs'
          count={paginationTotal}
          rowsPerPage={pageSize}
          page={page}
          SelectProps={{
            inputProps: { 'aria-label': 'rows per page' }
          }}
          onPageChange={(_, newPage) => {
            setPage(newPage)
          }}
          onRowsPerPageChange={e => {
            setPageSize(Number(e.target.value))
            setPage(0)
          }}
        />
      </Card>
      <PermissionDialog open={open} setOpen={setOpen} data={editValue} />
    </>
  )
}

export default Permissions
