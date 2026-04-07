// React Imports
import { useState, useEffect, useRef } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'
import { useAdminRoles } from '@/api/admin/roles'

// Prisma enum for UserStatus (from schema.prisma lines 25-27)
const USER_STATUS_ENUM = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' }
]

const TableFilters = ({
  setData,
  tableData,
  onFilterChange
}: {
  setData: (data: UsersType[]) => void
  tableData?: UsersType[]
  /** When set, parent handles list fetching; role/plan still filter client-side on current page */
  onFilterChange?: (filters: { role: string; plan: string; status: string }) => void
}) => {
  // States
  // Now, role is the id instead of name
  const [role, setRole] = useState<string>('')
  const [plan, setPlan] = useState<UsersType['currentPlan']>('')
  const [status, setStatus] = useState<UsersType['status']>('')

  // Get Roles from API
  const { data: rolesApi } = useAdminRoles({})

  // Roles data format based on example: array of { id, name, ... }
  const roles: Array<{ id: string; name: string }> = rolesApi?.data || []

  const onFilterChangeRef = useRef(onFilterChange)
  onFilterChangeRef.current = onFilterChange

  // useEffect(() => {
  //   if (onFilterChangeRef.current) {
  //     onFilterChangeRef.current({ role, plan, status })
  //   }
  //   // Only role/plan/status drive parent fetches; tableData/setData are legacy props and must NOT be
  //   // in deps — parent often passes `[]` and inline no-ops which change every render and cause update loops.
  // }, [role, plan, status])

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id='role-select'>Select Role</InputLabel>
            <Select
              fullWidth
              id='select-role'
              value={role}
              onChange={e => {
                const v = e.target.value
                setRole(v)
                onFilterChange?.({ role: v, plan: plan ?? '', status: status ?? '' })
              }}
              label='Select Role'
              labelId='role-select'
              inputProps={{ placeholder: 'Select Role' }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value=''>Select Role</MenuItem>
              {roles.map(roleObj => (
                <MenuItem key={roleObj.id} value={roleObj.id}>
                  {roleObj.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id='status-select'>Select Status</InputLabel>
            <Select
              fullWidth
              id='select-status'
              label='Select Status'
              value={status}
              onChange={e => {
                const v = e.target.value
                setStatus(v as UsersType['status'])
                onFilterChange?.({ role: role ?? '', plan: plan ?? '', status: v })
              }}
              labelId='status-select'
              inputProps={{ placeholder: 'Select Status' }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value=''>Select Status</MenuItem>
              {USER_STATUS_ENUM.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
