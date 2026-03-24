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

import { useAdminPermissions, useAdminRoles, usePermissionMutations, useRoleMutations } from '@/api/admin/access'

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

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}><Typography variant='h4'>Roles & Permissions Management</Typography></Grid>
      <Grid size={{ xs: 12 }}>
        <Card><CardContent>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label='Roles' />
            <Tab label='Permissions' />
          </Tabs>

          {tab === 0 ? (
            <>
              <div className='flex gap-3 my-4'>
                <Button variant='contained' onClick={() => setOpenRole(true)}>Create Role</Button>
                <TextField size='small' label='Role ID for assignment' value={assignRoleId} onChange={e => setAssignRoleId(e.target.value)} />
                <TextField size='small' label='Permission IDs (comma)' value={permissionIds} onChange={e => setPermissionIds(e.target.value)} />
                <Button variant='outlined' onClick={() => roleMut.assignPermissions.mutate({ id: assignRoleId, permissions: permissionIds.split(',').map(id => id.trim()).filter(Boolean).map(id => ({ permissionId: id, readAction: true })) })}>Assign</Button>
              </div>
              <Table size='small'>
                <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell>Permissions</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {(rolesData?.data || []).map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.description || '—'}</TableCell>
                      <TableCell>{r.rolePermissions?.length || 0}</TableCell>
                      <TableCell align='right'><Button size='small' color='error' onClick={() => roleMut.deleteRole.mutate(r.id)}>Delete</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <>
              <div className='my-4'><Button variant='contained' onClick={() => setOpenPermission(true)}>Create Permission</Button></div>
              <Table size='small'>
                <TableHead><TableRow><TableCell>Resource</TableCell><TableCell>Description</TableCell><TableCell align='right'>Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {(permissionsData?.data || []).map(p => (
                    <TableRow key={p.id}><TableCell>{p.resource}</TableCell><TableCell>{p.description || '—'}</TableCell><TableCell align='right'><Button size='small' color='error' onClick={() => permissionMut.deletePermission.mutate(p.id)}>Delete</Button></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent></Card>
      </Grid>

      <Dialog open={openRole} onClose={() => setOpenRole(false)}>
        <DialogTitle>Create Role</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-4'>
          <TextField label='Name' value={roleName} onChange={e => setRoleName(e.target.value)} />
          <TextField label='Description' value={roleDesc} onChange={e => setRoleDesc(e.target.value)} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenRole(false)}>Cancel</Button><Button variant='contained' onClick={async () => { await roleMut.createRole.mutateAsync({ name: roleName, description: roleDesc }); setOpenRole(false); setRoleName(''); setRoleDesc('') }}>Create</Button></DialogActions>
      </Dialog>

      <Dialog open={openPermission} onClose={() => setOpenPermission(false)}>
        <DialogTitle>Create Permission</DialogTitle>
        <DialogContent className='flex flex-col gap-4 pt-4'>
          <TextField label='Resource' value={resource} onChange={e => setResource(e.target.value)} />
          <TextField label='Description' value={permDesc} onChange={e => setPermDesc(e.target.value)} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenPermission(false)}>Cancel</Button><Button variant='contained' onClick={async () => { await permissionMut.createPermission.mutateAsync({ resource, description: permDesc }); setOpenPermission(false); setResource(''); setPermDesc('') }}>Create</Button></DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AccessManagement
