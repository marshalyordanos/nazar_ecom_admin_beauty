'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Imports
import { useAdminPermissions } from '@/api/admin/permissions'
import { useAdminRoles, useAssignPermissionsToRole, useCreateRole, useUpdateRole } from '@/api/admin/roles'

type RoleDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  title?: string
}

type DataType =
  | string
  | {
      title: string
      read?: boolean
      write?: boolean
      select?: boolean
    }

const defaultData: DataType[] = [
  'User Management',
  'Content Management',
  'Disputes Management',
  'Database Management',
  'Financial Management',
  'Reporting',
  'API Control',
  'Repository Management',
  'Payroll'
]

const RoleDialog = ({ open, setOpen, title }: RoleDialogProps) => {
  // States
  const [roleName, setRoleName] = useState<string>(title || '')
  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>(
    title
      ? [
          'user-management-read',
          'user-management-write',
          'user-management-create',
          'disputes-management-read',
          'disputes-management-write',
          'disputes-management-create'
        ]
      : []
  )

  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const handleClose = () => {
    setOpen(false)
  }

  const togglePermission = (id: string) => {
    const arr = selectedCheckbox

    if (selectedCheckbox.includes(id)) {
      arr.splice(arr.indexOf(id), 1)
      setSelectedCheckbox([...arr])
    } else {
      arr.push(id)
      setSelectedCheckbox([...arr])
    }
  }

  const handleSelectAllCheckbox = () => {
    if (isIndeterminateCheckbox) {
      setSelectedCheckbox([])
    } else {
      defaultData.forEach(row => {
        const id = (typeof row === 'string' ? row : row.title).toLowerCase().split(' ').join('-')

        togglePermission(`${id}-read`)
        togglePermission(`${id}-write`)
        togglePermission(`${id}-create`)
      })
    }
  }

  useEffect(() => {
    if (selectedCheckbox.length > 0 && selectedCheckbox.length < defaultData.length * 3) {
      setIsIndeterminateCheckbox(true)
    } else {
      setIsIndeterminateCheckbox(false)
    }
  }, [selectedCheckbox])

  // Server Data
  const { data: permissionsResp } = useAdminPermissions({ page: 1, pageSize: 200 })
  const { data: rolesResp } = useAdminRoles(
    title ? { page: 1, pageSize: 1, search: { name: title } } : { page: 1, pageSize: 1 }
  )
  const role = rolesResp?.data?.[0]
  const { mutateAsync: assignPermissions } = useAssignPermissionsToRole()
  const { mutateAsync: createRole } = useCreateRole()
  const { mutateAsync: updateRole } = useUpdateRole()

  const resources =
    permissionsResp?.data?.map(p => p.resource) ??
    defaultData.map(item => (typeof item === 'string' ? item : item.title))

  useEffect(() => {
    if (role?.rolePermissions && permissionsResp?.data) {
      const current: string[] = []
      role.rolePermissions.forEach(rp => {
        const resource = rp.permission?.resource
        if (!resource) return
        const id = resource.toLowerCase().split(' ').join('-')
        if (rp.readAction) current.push(`${id}-read`)
        if (rp.updateAction) current.push(`${id}-write`)
        if (rp.createAction) current.push(`${id}-create`)
      })
      setSelectedCheckbox(current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, permissionsResp])

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      // Map selected checkboxes to permission payload
      const byResource: Record<
        string,
        { createAction?: boolean; readAction?: boolean; updateAction?: boolean; deleteAction?: boolean }
      > = {}
      selectedCheckbox.forEach(key => {
        const [resourceSlug, action] = key.split('-').reduce<string[]>((acc, cur, idx, arr) => {
          if (idx < arr.length - 1) acc[0] = acc[0] ? `${acc[0]}-${cur}` : cur
          else acc[1] = cur
          return acc
        }, [])
        const resourceKey = resourceSlug
        if (!byResource[resourceKey]) byResource[resourceKey] = {}
        if (action === 'read') byResource[resourceKey].readAction = true
        if (action === 'write') byResource[resourceKey].updateAction = true
        if (action === 'create') byResource[resourceKey].createAction = true
      })

      // Build payload by matching resources to permission ids
      const permsBySlug: Record<string, string> = {}
      permissionsResp?.data?.forEach(p => {
        const slug = p.resource.toLowerCase().split(' ').join('-')
        permsBySlug[slug] = p.id
      })

      const permissions = Object.entries(byResource)
        .map(([slug, actions]) => {
          const permissionId = permsBySlug[slug]
          if (!permissionId) return null
          return { permissionId, createAction: !!actions.createAction, readAction: !!actions.readAction, updateAction: !!actions.updateAction, deleteAction: false }
        })
        .filter(Boolean) as Array<{
        permissionId: string
        createAction?: boolean
        readAction?: boolean
        updateAction?: boolean
        deleteAction?: boolean
      }>

      // Determine mode from provided props (title implies edit), and chain mutations accordingly.
      const isEditMode = Boolean(title)
      let roleId = role?.id

      if (isEditMode) {
        // UPDATE flow: require role id and update role name first, then assign permissions
        if (!roleId) {
          throw new Error('Role not found for update')
        }
        await updateRole({ id: roleId, payload: { name: roleName } })
      } else {
        // CREATE flow: create role first, then assign permissions
        const created = await createRole({ name: roleName })
        roleId = created?.id || created?.data?.id || roleId
        if (!roleId) {
          throw new Error('Unable to resolve created role id')
        }
      }

      await assignPermissions({ roleId, permissions })
      handleClose()
    } catch (e) {
      // Basic error feedback without UI changes
      // eslint-disable-next-line no-console
      console.error(e)
      handleClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog fullWidth maxWidth='md' scroll='body' open={open} onClose={handleClose} closeAfterTransition={false}>
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {title ? 'Edit Role' : 'Add Role'}
        <Typography component='span' className='flex flex-col text-center'>
          Set Role Permissions
        </Typography>
      </DialogTitle>
      <form onSubmit={e => e.preventDefault()}>
        <DialogContent className='overflow-visible pbs-0 sm:pbe-6 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <TextField
            label='Role Name'
            variant='outlined'
            fullWidth
            placeholder='Enter Role Name'
            defaultValue={title}
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
          />
          <Typography variant='h5' className='plb-5 sm:plb-6'>
            Role Permissions
          </Typography>
          <div className='flex flex-col overflow-x-auto'>
            <table className={tableStyles.table}>
              <tbody className='border-be'>
                <tr>
                  <th className='pis-0'>
                    <Typography className='font-medium whitespace-nowrap grow min-is-[225px]' color='text.primary'>
                      Administrator Access
                    </Typography>
                  </th>
                  <th className='text-end! pie-0'>
                    <FormControlLabel
                      className='mie-0 capitalize'
                      control={
                        <Checkbox
                          onChange={handleSelectAllCheckbox}
                          indeterminate={isIndeterminateCheckbox}
                          checked={selectedCheckbox.length === defaultData.length * 3}
                        />
                      }
                      label='Select All'
                    />
                  </th>
                </tr>
                {resources.map((item, index) => {
                  const label = item as string
                  const id = label.toLowerCase().split(' ').join('-')

                  return (
                    <tr key={index}>
                      <td className='pis-0'>
                        <Typography className='font-medium whitespace-nowrap grow min-is-[225px]' color='text.primary'>
                          {label}
                        </Typography>
                      </td>
                      <td className='text-end! pie-0'>
                        <FormGroup className='flex-row justify-end flex-nowrap gap-6'>
                          <FormControlLabel
                            className='mie-0'
                            control={
                              <Checkbox
                                id={`${id}-read`}
                                onChange={() => togglePermission(`${id}-read`)}
                                checked={selectedCheckbox.includes(`${id}-read`)}
                              />
                            }
                            label='Read'
                          />
                          <FormControlLabel
                            className='mie-0'
                            control={
                              <Checkbox
                                id={`${id}-write`}
                                onChange={() => togglePermission(`${id}-write`)}
                                checked={selectedCheckbox.includes(`${id}-write`)}
                              />
                            }
                            label='Write'
                          />
                          <FormControlLabel
                            className='mie-0 text-textPrimary'
                            control={
                              <Checkbox
                                id={`${id}-create`}
                                onChange={() => togglePermission(`${id}-create`)}
                                checked={selectedCheckbox.includes(`${id}-create`)}
                              />
                            }
                            label='Create'
                          />
                        </FormGroup>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit' onClick={handleSubmit} disabled={submitting}>
            Submit
          </Button>
          <Button variant='outlined' type='reset' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RoleDialog
