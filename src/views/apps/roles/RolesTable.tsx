'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
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
// import type { UsersType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import AssignRoleDialog from '@components/dialogs/assign-role'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Imports
import { useAdminUsers, useUpdateUserRole, type UserAdmin } from '@/api/admin/users'
import type { ApiListResponse } from '@/api/admin/types'
import TableFilters from './TableFilters'
import { Divider } from '@mui/material'
import AddUserDrawer from './AddUserDrawer'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UserRow = {
  id: string | number
  fullName: string
  email: string
  phone: string
  status: string
  roles: string[]
  avatarUrl: string | null
  action?: string
}

type UserRoleType = {
  [key: string]: { icon: string; color: string }
}

type UserStatusType = {
  [key: string]: ThemeColor
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
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
  }, [value, onChange, debounce])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// You can expand this map as you add new roles
const userRoleObj: UserRoleType = {
  admin: { icon: 'ri-vip-crown-line', color: 'error' },
  user: { icon: 'ri-user-3-line', color: 'primary' }
  // add more as needed
}

const userStatusObj: UserStatusType = {
  ACTIVE: 'success',
  PENDING: 'warning',
  INACTIVE: 'secondary',
  SUSPENDED: 'error'
}

const columnHelper = createColumnHelper<UserRow>()

const getAvatar = (params: { avatarUrl: string | null; fullName: string }) => {
  const { avatarUrl, fullName } = params
  if (avatarUrl) {
    return <CustomAvatar src={avatarUrl} size={34} />
  }
  return <CustomAvatar>{getInitials(fullName)}</CustomAvatar>
}

type UserRowWithAction = {
  id: string
  serverId: string
  fullName: string
  email: string
  phone: string
  avatar: string
  status: string
  role: string
  createdAt?: string
  updatedAt?: string
  action?: string
}

const RolesTable = () => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<UserRow[]>([])
  const [filteredData, setFilteredData] = useState<UserRow[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState<string | undefined>(undefined)
  const [assignUserRole, setAssignUserRole] = useState<string | null | undefined>(undefined)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [editUserData, setEditUserData] = useState<UserRowWithAction | null>(null)

  const { lang: locale } = useParams()
  const { mutateAsync: updateUserRole } = useUpdateUserRole()
  // Add status to filter state initializer
  const [listFilters, setListFilters] = useState({ role: '', status: '' })

  // Server Data
  const usersQuery = useAdminUsers({
    page: page + 1,
    pageSize,
    search: globalFilter
      ? {
          name: globalFilter as string,
          email: globalFilter as string,
          username: globalFilter as string
        }
      : undefined,
    // Add status to the filter object if present
    filter: {
      ...(listFilters.role ? { roleId: listFilters.role } : {}),
      ...(listFilters.status ? { status: listFilters.status } : {})
    },
    sort: { createdAt: 'desc' }
  })
  const usersResp = usersQuery.data as ApiListResponse<UserAdmin> | undefined
  const serverData = usersResp?.data ?? []

  // Transform API user into a shape usable in the table
  const mapUserToRow = useCallback(
    (u: UserAdmin, idx: number): UserRow => {
      const fullName =
        `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'User'
      return {
        id: u.id ?? idx,
        fullName,
        email: u.email ?? '',
        phone: u.phone ?? '',
        status: u.status ?? '',
        roles: Array.isArray(u.roles) && u.roles.length > 0 ? u.roles.map(r => r.name) : [],
        avatarUrl: u.avatarUrl ?? null
      }
    },
    []
  )

  // FIX: Only setData and setFilteredData when serverData actually changes (useEffect dependencies are correct).
  useEffect(() => {
    const mapped = serverData.map(mapUserToRow)
    setData(mapped)
    setFilteredData(mapped)
    // no infinite loop, dependencies only change when serverData changes (not on every render)
  }, [serverData, mapUserToRow])

  // FIX: Only filter when listFilters or the data changes (dependencies are correct)
  useEffect(() => {
    let filtered = data
    if (listFilters.role) {
      filtered = filtered.filter(user => user.roles.includes(listFilters.role))
    }
    if (listFilters.status) {
      filtered = filtered.filter(user => user.status === listFilters.status)
    }
    setFilteredData(filtered)
  }, [listFilters.role, listFilters.status, data])

  const handleFilterChange = useCallback((f: { role: string; plan: string; status: string }) => {
    setListFilters({ role: f.role, status: f.status })
    setPage(0)
  }, [])

  const handleGlobalFilterChange = useCallback((value: string | number) => {
    setGlobalFilter(String(value))
  }, [])

  const handleEditUser = useCallback((user: UserRowWithAction) => {
    setEditUserData(user)
    setAddUserOpen(true)
  }, [])

  const columns = useMemo<ColumnDef<UserRow, any>[]>(
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
      columnHelper.accessor('fullName', {
        header: 'User',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ avatarUrl: row.original.avatarUrl, fullName: row.original.fullName })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.fullName || '-'}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: ({ row }) => <Typography>{row.original.phone}</Typography>
      }),
      columnHelper.accessor('roles', {
        header: 'Roles',
        cell: ({ row }) =>
          row.original.roles && row.original.roles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.roles.map((role: string, idx: number) => (
                <Chip
                  key={role + idx}
                  variant='tonal'
                  label={role}
                  size='small'
                  // color={userRoleObj[role]?.color || 'primary'}
                  color='primary'
                  className='capitalize'
                  icon={
                    <Icon className={userRoleObj[role]?.icon || 'ri-user-3-line'} />
                  }
                  sx={{ pl: 1 }}
                />
              ))}
            </div>
          ) : (
            <Typography>-</Typography>
          )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Chip
              variant='tonal'
              label={row.original.status}
              size='small'
              color={userStatusObj[row.original.status]}
              className='capitalize'
            />
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton
              size='small'
              onClick={() => setData(curr => curr.filter(user => user.id !== row.original.id))}
            >
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <Link href={getLocalizedUrl('/apps/user/view', locale as Locale)} className='flex'>
                <i className='ri-eye-line text-textSecondary' />
              </Link>
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                const apiUser = serverData?.find(u => u.id === row.original.id)
                setAssignUserId(apiUser?.id)
                const userRoles = Array.isArray(apiUser?.roles) && apiUser?.roles.length > 0 ? apiUser.roles.map((r: any) => r.name) : []
                setAssignUserRole(userRoles.length > 0 ? userRoles[0] : null)
                setAssignOpen(true)
              }}
            >
              <i className='ri-user-settings-line text-textSecondary' />
            </IconButton>
            <OptionMenu
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Download',
                  icon: 'ri-download-line',
                  menuItemProps: { className: 'flex items-center' }
                },
                {
                  text: 'Edit',
                  icon: 'ri-edit-box-line',
                  menuItemProps: {
                    className: 'flex items-center',
                    onClick: async () => {
                     
                    }
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    [data, serverData, locale, updateUserRole]
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
        pageSize
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

  return (
    <Card>
      <TableFilters
        setData={()=>{}}
        tableData={[]}
        onFilterChange={handleFilterChange}
      />
      <Divider />
      <CardContent className='flex justify-between flex-col items-start sm:flex-row sm:items-center max-sm:gap-4'>
        <Button
          variant='outlined'
          color='secondary'
          startIcon={<i className='ri-upload-2-line' />}
          className='max-sm:is-full'
        >
          Export
        </Button>
        <div className='flex flex-col !items-start max-sm:is-full sm:flex-row sm:items-center gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            className='max-sm:is-full min-is-[220px]'
            onChange={handleGlobalFilterChange}
            placeholder='Search User'
          />
           <Button
              variant='contained'
              onClick={() => {
                setEditUserData(null);
                setAddUserOpen(true);
              }}
              className='max-sm:is-full'
            >
              Add New User
            </Button>
        </div>
      </CardContent>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
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
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {(table.getFilteredRowModel().rows?.length ?? 0) === 0 ? (
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
                .map(row => (
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
        count={usersResp?.pagination?.total ?? (table.getFilteredRowModel().rows?.length ?? 0)}
        rowsPerPage={table.getState().pagination.pageSize}
        page={page}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          setPage(page)
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => {
          const newSize = Number(e.target.value)
          setPageSize(newSize)
          table.setPageSize(newSize)
          setPage(0)
        }}
      />
      <AssignRoleDialog
        open={assignOpen}
        setOpen={setAssignOpen}
        userId={assignUserId}
        currentRole={assignUserRole || undefined}
        onSuccess={() => {
          // no-op: query invalidation happens in mutation hook
        }}
      />
        <AddUserDrawer
        open={addUserOpen}
        handleClose={() => setAddUserOpen(false)}
        userData={editUserData ? [editUserData] : []}
      />
    </Card>
  )
}

export default RolesTable
