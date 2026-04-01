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
import type { UsersType } from '@/types/apps/userTypes'
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

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type UsersTypeWithAction = UsersType & {
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
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const userRoleObj: UserRoleType = {
  admin: { icon: 'ri-vip-crown-line', color: 'error' },
  author: { icon: 'ri-computer-line', color: 'warning' },
  editor: { icon: 'ri-edit-box-line', color: 'info' },
  maintainer: { icon: 'ri-pie-chart-2-line', color: 'success' },
  subscriber: { icon: 'ri-user-3-line', color: 'primary' }
}

const userStatusObj: UserStatusType = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

const columnHelper = createColumnHelper<UsersTypeWithAction>()

const getAvatar = (params: Pick<UsersType, 'avatar' | 'fullName'>) => {
  const { avatar, fullName } = params
  if (avatar) {
    return <CustomAvatar src={avatar} size={34} />
  }
  return <CustomAvatar>{getInitials(fullName as string)}</CustomAvatar>
}

const RolesTable = ({ tableData }: { tableData?: UsersType[] }) => {
  const [role, setRole] = useState<UsersType['role']>('')
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(tableData || [])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUserId, setAssignUserId] = useState<string | undefined>(undefined)
  const [assignUserRole, setAssignUserRole] = useState<string | null | undefined>(undefined)

  const { lang: locale } = useParams()
  const { mutateAsync: updateUserRole } = useUpdateUserRole()

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
    filter: role ? { role } : undefined,
    sort: { createdAt: 'desc' }
  })
  const usersResp = usersQuery.data as ApiListResponse<UserAdmin> | undefined
  const serverData = usersResp?.data ?? []

  const mapUserToRow = useCallback((u: UserAdmin, idx: number): UsersType => {
    const fullName =
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || (u.username as string) || u.email || 'User'
    const username = (u.username as string) || (u.email ? u.email.split('@')[0] : 'user')
    const numericId = page * pageSize + idx + 1
    return {
      id: numericId,
      role: (u.role as string) || 'subscriber',
      email: u.email,
      status: (u.status as string) || 'active',
      avatar: (u.avatar as string) || '',
      company: '',
      country: '',
      contact: '',
      fullName,
      username,
      currentPlan: (u.currentPlan as string) || 'standard',
      avatarColor: undefined
    }
  }, [page, pageSize])

  useEffect(() => {
    const mapped = serverData.map(mapUserToRow)
    setData(mapped)
    setFilteredData(mapped)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverData, page, pageSize, mapUserToRow])

  // Only filter by role here. Filtering by search comes from the backend.
  useEffect(() => {
    let filtered = data
    if (role) {
      filtered = data?.filter(user => user.role === role)
    }
    setFilteredData(filtered)
  }, [role, data])

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
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
            {getAvatar({ avatar: row.original.avatar, fullName: row.original.fullName })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.fullName}
              </Typography>
              <Typography variant='body2'>{row.original.username}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Icon
              className={userRoleObj[row.original.role]?.icon || 'ri-user-3-line'}
              sx={{ color: `var(--mui-palette-${userRoleObj[row.original.role]?.color || 'primary'}-main)`, fontSize: '1.375rem' }}
            />
            <Typography color='text.primary' className='capitalize'>
              {row.original.role}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('currentPlan', {
        header: 'Plan',
        cell: ({ row }) => (
          <Typography color='text.primary' className='capitalize'>
            {row.original.currentPlan}
          </Typography>
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
            <IconButton size='small' onClick={() => setData(curr => curr?.filter(product => product.id !== row.original.id))}>
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
                const src = serverData?.[row.index]
                setAssignUserId(src?.id)
                setAssignUserRole((src?.role as string) || null)
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
                      const newRole = window.prompt('Enter new role for user', row.original.role)
                      if (newRole !== null && newRole !== row.original.role) {
                        const src = serverData?.[row.index]
                        if (src?.id) {
                          await updateUserRole({ id: src.id, role: newRole })
                        }
                      }
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
    data: filteredData as UsersType[],
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
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search User'
          />
          <FormControl size='small' className='max-sm:is-full'>
            <InputLabel id='roles-app-role-select-label'>Select Role</InputLabel>
            <Select
              value={role}
              onChange={e => setRole(e.target.value)}
              label='Select Role'
              id='roles-app-role-select'
              labelId='roles-app-role-select-label'
              className='min-is-[150px]'
            >
              <MenuItem value=''>Select Role</MenuItem>
              <MenuItem value='admin'>Admin</MenuItem>
              <MenuItem value='author'>Author</MenuItem>
              <MenuItem value='editor'>Editor</MenuItem>
              <MenuItem value='maintainer'>Maintainer</MenuItem>
              <MenuItem value='subscriber'>Subscriber</MenuItem>
            </Select>
          </FormControl>
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
    </Card>
  )
}

export default RolesTable
