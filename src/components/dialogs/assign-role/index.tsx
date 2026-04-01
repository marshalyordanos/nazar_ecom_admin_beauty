'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// API Imports
import { useAdminRoles } from '@/api/admin/roles'
import { useUpdateUserRole } from '@/api/admin/users'

type AssignRoleDialogProps = {
	open: boolean
	setOpen: (open: boolean) => void
	userId?: string
	currentRole?: string | null
	onSuccess?: () => void
}

const AssignRoleDialog = ({ open, setOpen, userId, currentRole, onSuccess }: AssignRoleDialogProps) => {
	// States
	const [role, setRole] = useState<string>(currentRole || '')
	const [submitting, setSubmitting] = useState(false)
	const { data: rolesResp } = useAdminRoles({ page: 1, pageSize: 100, sort: { createdAt: 'asc' } })
	const { mutateAsync: updateUserRole } = useUpdateUserRole()

	useEffect(() => {
		setRole(currentRole || '')
	}, [currentRole, open])

	const handleClose = () => {
		if (!submitting) setOpen(false)
	}

	const handleConfirm = async () => {
		if (!userId || !role) return
		try {
			setSubmitting(true)
			await updateUserRole({ id: userId, role })
			onSuccess?.()
			setOpen(false)
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e)
			// Keep dialog open for retry
		} finally {
			setSubmitting(false)
		}
	}

	const roles = rolesResp?.data ?? []

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm' closeAfterTransition={false}>
			<DialogTitle variant='h4' className='flex flex-col gap-1'>
				Assign Role
				<Typography component='span'>Select a role to assign to this user</Typography>
			</DialogTitle>
			<DialogContent>
				<FormControl fullWidth size='small'>
					<InputLabel id='assign-role-select-label'>Role</InputLabel>
					<Select
						labelId='assign-role-select-label'
						id='assign-role-select'
						value={role}
						label='Role'
						onChange={e => setRole(e.target.value)}
					>
						{roles.map(r => (
							<MenuItem key={r.id} value={r.name}>
								{r.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</DialogContent>
			<DialogActions className='justify-center sm:pli-16 sm:pbe-6'>
				<Button variant='contained' onClick={handleConfirm} disabled={!role || submitting}>
					Confirm
				</Button>
				<Button variant='outlined' color='secondary' onClick={handleClose} disabled={submitting}>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default AssignRoleDialog

