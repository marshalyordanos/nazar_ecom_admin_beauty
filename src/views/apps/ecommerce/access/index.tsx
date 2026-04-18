'use client'

import { useMemo, useState } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { useAdminPermissions, useAdminRoles, usePermissionMutations, useRoleMutations } from '@/api/admin/access'
import MutationBlockingOverlay from '@/components/loading/MutationBlockingOverlay'

const AccessManagement = () => {
  const [tab, setTab] = useState(0)
  const params = useMemo(() => ({ page: 1, pageSize: 50 }), [])

  const { data: rolesData } = useAdminRoles(params)
  const { data: permissionsData } = useAdminPermissions(params)
  const roleMut = useRoleMutations()
  const permissionMut = usePermissionMutations()

  const [openRole, setOpenRole] = useState(false)
  const [roleName, setRoleName] = useState('')
  const [roleDesc, setRoleDesc] = useState('')
  const [assignRoleId, setAssignRoleId] = useState('')
  const [permissionIds, setPermissionIds] = useState('')

  const [openPermission, setOpenPermission] = useState(false)
  const [resource, setResource] = useState('')
  const [permDesc, setPermDesc] = useState('')

  const roleSectionBusy =
    roleMut.createRole.isPending ||
    roleMut.deleteRole.isPending ||
    roleMut.assignPermissions.isPending

  const accessBusy =
    roleSectionBusy ||
    permissionMut.createPermission.isPending ||
    permissionMut.deletePermission.isPending

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}><Typography variant='h4'>Roles & Permissions Management</Typography></Grid>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ position: 'relative', overflow: 'hidden' }}>
          <MutationBlockingOverlay
            open={accessBusy}
            message='Updating roles and permissions…'
          />
          <CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-busy={accessBusy}>
            <Tab label='Roles' />
            <Tab label='Permissions' />
          </Tabs>

          {tab === 0 ? (
            <>
              <div className='flex gap-3 my-4 flex-wrap'>
                <Button variant='contained' onClick={() => setOpenRole(true)} disabled={accessBusy}>
                  Create Role
                </Button>
                <TextField
                  size='small'
                  label='Role ID for assignment'
                  value={assignRoleId}
                  onChange={e => setAssignRoleId(e.target.value)}
                  disabled={accessBusy}
                />
                <TextField
                  size='small'
                  label='Permission IDs (comma)'
                  value={permissionIds}
                  onChange={e => setPermissionIds(e.target.value)}
                  disabled={accessBusy}
                />
                <Button
                  variant='outlined'
                  disabled={accessBusy || !assignRoleId.trim()}
                  onClick={() =>
                    roleMut.assignPermissions.mutate({
                      id: assignRoleId,
                      permissions: permissionIds
                        .split(',')
                        .map(id => id.trim())
                        .filter(Boolean)
                        .map(id => ({ permissionId: id, readAction: true }))
                    })
                  }
                >
                  {roleMut.assignPermissions.isPending ? 'Assigning…' : 'Assign'}
                </Button>
              </div>
              <Table size='small'>
                <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell>Permissions</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {(rolesData?.data || []).map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.description || '—'}</TableCell>
                      <TableCell>{r.rolePermissions?.length || 0}</TableCell>
                      <TableCell align='right'>
                        <Button
                          size='small'
                          color='error'
                          disabled={roleMut.deleteRole.isPending}
                          onClick={() => roleMut.deleteRole.mutate(r.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <>
              <div className='my-4'>
                <Button variant='contained' onClick={() => setOpenPermission(true)} disabled={accessBusy}>
                  Create Permission
                </Button>
              </div>
              <Table size='small'>
                <TableHead><TableRow><TableCell>Resource</TableCell><TableCell>Description</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {(permissionsData?.data || []).map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.resource}</TableCell>
                      <TableCell>{p.description || '—'}</TableCell>
                      <TableCell align='right'>
                        <Button
                          size='small'
                          color='error'
                          disabled={permissionMut.deletePermission.isPending}
                          onClick={() => permissionMut.deletePermission.mutate(p.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
        </Card>
      </Grid>

      <Dialog
        open={openRole}
        onClose={() => !roleMut.createRole.isPending && setOpenRole(false)}
        slotProps={{ paper: { sx: { position: 'relative', overflow: 'hidden' } } }}
      >
        <MutationBlockingOverlay open={roleMut.createRole.isPending} message='Creating role…' />
        <DialogTitle>Create Role</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-4'>
          <TextField
            label='Name'
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
            disabled={roleMut.createRole.isPending}
          />
          <TextField
            label='Description'
            value={roleDesc}
            onChange={e => setRoleDesc(e.target.value)}
            disabled={roleMut.createRole.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRole(false)} disabled={roleMut.createRole.isPending}>
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={roleMut.createRole.isPending}
            startIcon={
              roleMut.createRole.isPending ? <CircularProgress color='inherit' size={18} /> : undefined
            }
            onClick={async () => {
              await roleMut.createRole.mutateAsync({ name: roleName, description: roleDesc })
              setOpenRole(false)
              setRoleName('')
              setRoleDesc('')
            }}
          >
            {roleMut.createRole.isPending ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPermission}
        onClose={() => !permissionMut.createPermission.isPending && setOpenPermission(false)}
        slotProps={{ paper: { sx: { position: 'relative', overflow: 'hidden' } } }}
      >
        <MutationBlockingOverlay
          open={permissionMut.createPermission.isPending}
          message='Creating permission…'
        />
        <DialogTitle>Create Permission</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-4'>
          <TextField
            label='Resource'
            value={resource}
            onChange={e => setResource(e.target.value)}
            disabled={permissionMut.createPermission.isPending}
          />
          <TextField
            label='Description'
            value={permDesc}
            onChange={e => setPermDesc(e.target.value)}
            disabled={permissionMut.createPermission.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermission(false)} disabled={permissionMut.createPermission.isPending}>
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={permissionMut.createPermission.isPending}
            startIcon={
              permissionMut.createPermission.isPending ? (
                <CircularProgress color='inherit' size={18} />
              ) : undefined
            }
            onClick={async () => {
              await permissionMut.createPermission.mutateAsync({ resource, description: permDesc })
              setOpenPermission(false)
              setResource('')
              setPermDesc('')
            }}
          >
            {permissionMut.createPermission.isPending ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AccessManagement
