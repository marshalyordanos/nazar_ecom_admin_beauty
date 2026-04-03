// React Imports
import { useEffect } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// API
import { addUser, useRegisterUsers, useUpdateUserProfile } from '@/api/admin/users'

type Props = {
  open: boolean
  handleClose: () => void
  userData: any[]
}

type FormValidateType = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password?: string
}

const initialData: FormValidateType = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: ''
}

const AddUserDrawer = (props: Props) => {
  // Props
  const { open, handleClose, userData } = props

  // Check if editing
  const isEdit = userData && userData.length > 0 && !!userData[0]?.id
  const editUser = isEdit ? userData[0] : null

  // Form hook, note: password only required for add
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValidateType>({
    defaultValues: initialData
  })

  // Register and update hooks
  const registerUser = addUser()
  const updateUser = useUpdateUserProfile()

  // Populate form when in edit mode or when switching between add and edit
  useEffect(() => {
    if (isEdit && editUser) {
      console.log(editUser,"editUser")
      const firstName = editUser.fullName?.split(' ')[0] || ''
      const lastName = editUser.fullName?.split(' ')[1] || ''
      resetForm({
        firstName: firstName || '',
        lastName: lastName || '',
        email: editUser.email || '',
        phone: editUser.phone || '',
        password: '' // not shown, but set for initialData type compat
      })
    } else {
      resetForm(initialData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editUser, open]) // open triggers reset when the drawer is reopened

  // Add or Edit submit
  const onSubmit = (form: FormValidateType) => {
    if (isEdit && editUser) {
      updateUser.mutate(
        {
          id: editUser.id,
          data: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone
          }
        },
        {
          onSuccess: () => {
            handleClose()
            resetForm(initialData)
          }
        }
      )
    } else {
      registerUser.mutate(form, {
        onSuccess: () => {
          handleClose()
          resetForm(initialData)
        }
      })
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm(initialData)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>{isEdit ? 'Edit User' : 'Add New User'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='firstName'
            control={control}
            rules={{ required: 'First Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='First Name'
                placeholder='marshal'
                error={Boolean(errors.firstName)}
                helperText={errors.firstName?.message}
              />
            )}
          />
          <Controller
            name='lastName'
            control={control}
            rules={{ required: 'Last Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Last Name'
                placeholder='yordanos'
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='email'
                label='Email'
                placeholder='marsh@gmail.com'
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            )}
          />
          <Controller
            name='phone'
            control={control}
            rules={{ required: 'Phone is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Phone'
                type='tel'
                placeholder='0987654322'
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
              />
            )}
          />
          {/* Password field is hidden in edit mode */}
          {!isEdit && (
            <Controller
              name='password'
              control={control}
              rules={{ required: 'Password is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Password'
                  type='password'
                  placeholder='marshal1111'
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                />
              )}
            />
          )}
          <div className='flex items-center gap-4'>
            <Button
              variant='contained'
              type='submit'
              disabled={
                isEdit
                  ? updateUser.isPending
                  : registerUser.isPending
              }
            >
              {isEdit ? 'Update' : 'Submit'}
            </Button>
            <Button variant='outlined' color='error' type='reset' onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddUserDrawer
