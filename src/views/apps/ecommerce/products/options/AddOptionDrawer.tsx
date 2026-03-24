// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Types Imports
import { ProductOption, OptionValue } from '@/types/option'

// API utility (assume next client conventions)
import { api } from '@/libs/api'

type Props = {
  optionId?: string
  open: boolean
  handleClose: () => void
  optionData?: ProductOption[]
  setData: (data?: ProductOption) => void // callback after add/update
}

type OptionFormType = {
  name: string
  value: string
}

// Util
const defaultValues: OptionFormType = {
  name: '',
  value: ''
}

const AddOptionDrawer = (props: Props) => {
  const { open, handleClose, optionId, optionData, setData } = props

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optionSavedId, setOptionSavedId] = useState<string | undefined>(undefined)
  const [serverValues, setServerValues] = useState<OptionValue[]>([])
  const [editSuccess, setEditSuccess] = useState<boolean>(false)

  // Prefill for edit mode
  const optionToEdit = optionId
    ? optionData?.find(opt => opt.id === optionId)
    : undefined

  // Form logic
  const {
    control,
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<OptionFormType>({
    defaultValues
  })

  // Effect: Load option details and values when drawer is opened
  useEffect(() => {
    if (optionToEdit) {
      reset({
        name: optionToEdit.name,
        value: ''
      })
      setServerValues(optionToEdit.values ?? [])
      setOptionSavedId(optionToEdit.id)
    } else {
      reset(defaultValues)
      setServerValues([])
      setOptionSavedId(undefined)
    }
    setError(null)
    setEditSuccess(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionId, open])

  // Create or update option name
  const onSaveName = async (data: OptionFormType) => {
    setError(null)
    setLoading(true)
    try {
      let option: ProductOption | undefined
      let id = optionSavedId
      if (optionToEdit) {
        // PATCH for edit mode
        const response = await api.patch(`/products/options/${optionToEdit.id}`, { name: data.name })
        id = response.data.id
        option = {
          id: response.data.id,
          name: response.data.name,
          values: optionToEdit.values ?? [],
          createdAt: response.data.createdAt ?? '',
          updatedAt: response.data.updatedAt ?? ''
        }
        // Set the option back to parent & flag as edited.
        setData(option)
        setEditSuccess(true)
        // Option name edit will also update local
        reset({
          name: response.data.name,
          value: ''
        })
      } else {
        // Create new
        const response = await api.post('/products/options', { name: data.name })
        id = response.data.id
        option = {
          id: response.data.id,
          name: response.data.name,
          values: [],
          createdAt: response.data.createdAt ?? '',
          updatedAt: response.data.updatedAt ?? ''
        }
        setData(option) // Only fire setData on create/first save
        setOptionSavedId(id)
      }
      setOptionSavedId(id)
    } catch (err: any) {
      setError(err?.message || 'Failed to save option name')
    } finally {
      setLoading(false)
    }
  }

  // Handle adding new value (decouple from option name -- only require value when submitting value form)
  const onAddValue = async (data: OptionFormType) => {
    if (!optionToEdit && !optionSavedId) {
      setError("Please save the option name first.")
      return
    }
    const addToId = optionSavedId ?? optionToEdit?.id
    if (!addToId) return
    setError(null)
    setLoading(true)
    try {
      const trimmed = data.value.trim()
      if (!trimmed) {
        setError('Value is required')
        setLoading(false)
        return
      }
      // Add this value
      const response = await api.post(`/products/options/${addToId}/values`, { value: trimmed })
      setServerValues(prev => [
        ...prev,
        ...(Array.isArray(response.data) ? response.data : [{ id: response.data?.id || Math.random().toString(), value: trimmed }])
      ])
      setValue('value', '')
      setError(null)
      setData() // ask parent to refetch if needed
    } catch (err: any) {
      setError(err?.message || 'Failed to add value')
    } finally {
      setLoading(false)
    }
  }

  // Remove value (actual DB delete, only in edit mode)
  const handleDeleteServerValue = async (valueId: string) => {
    const id = optionSavedId ?? optionToEdit?.id
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      await api.delete(`/products/options/values/${valueId}`)
      setServerValues(prev => prev.filter(v => v.id !== valueId))
      setData()
    } catch (err: any) {
      setError(err?.message || 'Failed to delete value')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset(defaultValues)
    setOptionSavedId(undefined)
    setServerValues([])
    setError(null)
    setEditSuccess(false)
    handleClose()
  }

  // Render
  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>
          {optionId ? 'Edit Option' : 'Add Option'}
        </Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <div className='p-5 flex flex-col gap-6'>
        {/* Option Name Section */}
        <form
          onSubmit={handleSubmit(onSaveName)}
          className='flex flex-col gap-5'
          autoComplete='off'
        >
          <Typography variant='subtitle1' className="font-medium mb-1">
            Option Name
          </Typography>
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Option Name"
                autoFocus
                placeholder='Size, Color, Material...'
                error={!!errors.name}
                helperText={errors.name ? 'Option name is required.' : ''}
                disabled={!!optionId && !editSuccess}
              />
            )}
          />
          {error && (
            <FormHelperText error>{error}</FormHelperText>
          )}
          <div className='flex items-center gap-3'>
            <Button
              variant='contained'
              type='submit'
              disabled={loading}
            >
              {optionId ? 'Save Changes' : 'Add Option'}
            </Button>
            <Button
              variant='outlined'
              color='error'
              type='button'
              onClick={handleReset}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
          {optionId && editSuccess && (
            <FormHelperText sx={{ color: 'success.main' }}>
              Option updated successfully.
            </FormHelperText>
          )}
        </form>

        <Divider />

        {/* Values Section */}
        <div>
          <Typography variant='subtitle1' className="font-medium mb-1">
            Values for this Option
          </Typography>
          {/* List of existing values */}
          {serverValues.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-3'>
              {serverValues.map(v => (
                <span
                  key={v.id}
                  className="inline-flex items-center px-2 py-1 bg-[#F4F5F7] rounded text-[13px] text-[#555]"
                >
                  {v.value}
                  <IconButton
                    aria-label='Remove'
                    size='small'
                    onClick={() => handleDeleteServerValue(v.id)}
                    disabled={loading}
                    sx={{ ml: 1 }}
                  >
                    <i className='ri-close-line text-base' />
                  </IconButton>
                </span>
              ))}
            </div>
          )}
          {/* Add new value (no dependency on option name field validation for enabling this form) */}
          <form
            onSubmit={handleSubmit(onAddValue)}
            className='flex gap-2 items-start'
            autoComplete='off'
          >
            <Controller
              name="value"
              control={control}
              rules={{ required: false }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size='small'
                  label='Add Value'
                  placeholder='Enter value'
                  error={!!error && error === 'Value is required'}
                  helperText={error === 'Value is required' ? error : ''}
                  disabled={loading || (!optionSavedId && !optionToEdit)}
                  fullWidth
                />
              )}
            />
            <Button
              variant='contained'
              type='submit'
              size='small'
              sx={{ mt: 0.2 }}
              disabled={loading || (!optionSavedId && !optionToEdit)}
            >
              Add
            </Button>
          </form>
          {/* Show errors related to value addition only, avoid overlapping errors with name */}
          {error && error !== 'Option name is required.' && error !== 'Failed to save option name' && (
            <FormHelperText error>{error}</FormHelperText>
          )}
        </div>
      </div>
    </Drawer>
  )
}

export default AddOptionDrawer
