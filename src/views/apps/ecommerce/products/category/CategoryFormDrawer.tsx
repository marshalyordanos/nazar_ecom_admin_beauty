'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import { Controller, useForm } from 'react-hook-form'

import { useCreateCategory, useUpdateCategory } from '@/api/categories/useCategories'
import MutationBlockingOverlay from '@/components/loading/MutationBlockingOverlay'

import { slugifyName } from './categoryFormUtils'

export type CategoryFormValues = {
  name: string
  slug: string
  description: string
  parentId: string
}

export type CategoryFormDrawerProps = {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  defaultParentId?: string | null
  category?: {
    id: string
    name: string
    slug: string
    description?: string | null
    parentId?: string | null
    image?: string | null
  } | null
  parentOptions: { id: string; label: string }[]
}

const CategoryFormDrawer = (props: CategoryFormDrawerProps) => {
  const { open, onClose, mode, defaultParentId, category, parentOptions } = props

  const [fileName, setFileName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()

  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: ''
    }
  })

  const nameWatch = watch('name')

  useEffect(() => {
    if (!open) return
    setFormError(null)
    setFileName('')
    setFile(null)
    setSlugTouched(false)

    if (mode === 'edit' && category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        parentId: category.parentId ?? ''
      })
    } else {
      reset({
        name: '',
        slug: '',
        description: '',
        parentId: defaultParentId ?? ''
      })
    }
  }, [open, mode, category, defaultParentId, reset])

  useEffect(() => {
    if (mode !== 'add' || slugTouched || !open) return
    const s = slugifyName(nameWatch)

    if (s) setValue('slug', s)
  }, [nameWatch, mode, slugTouched, open, setValue])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]

    if (f) {
      setFile(f)
      setFileName(f.name)
    }
  }

  const handleClose = () => {
    onClose()
    reset({ name: '', slug: '', description: '', parentId: '' })
    setFileName('')
    setFile(null)
    setFormError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (data: CategoryFormValues) => {
    setFormError(null)

    if (mode === 'add' && !file) {
      setFormError('Image is required when creating a category.')

      return
    }

    const fd = new FormData()

    fd.append('name', data.name.trim())
    fd.append('slug', data.slug.trim())
    if (data.description.trim()) fd.append('description', data.description.trim())

    if (mode === 'edit') {
      fd.append('parentId', data.parentId || '')
    } else if (data.parentId) {
      fd.append('parentId', data.parentId)
    }

    if (file) fd.append('image', file)

    try {
      if (mode === 'add') {
        await createMut.mutateAsync(fd)
      } else if (category) {
        await updateMut.mutateAsync({ id: category.id, formData: fd })
      }

      handleClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed'

      setFormError(msg)
    }
  }

  const busy = createMut.isPending || updateMut.isPending

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 420 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>{mode === 'add' ? 'Add category' : 'Edit category'}</Typography>
        <IconButton size='small' onClick={handleClose} disabled={busy}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <Box className='p-5' sx={{ position: 'relative', flex: 1, overflow: 'auto' }}>
        <MutationBlockingOverlay
          open={busy}
          message={mode === 'add' ? 'Creating category…' : 'Updating category…'}
        />
        {formError ? (
          <Alert severity='error' className='mbe-4' onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        ) : null}
        {mode === 'edit' && category?.image ? (
          <div className='mbe-4'>
            <Typography variant='caption' color='text.secondary' className='mbe-1 block'>
              Current image
            </Typography>
            <img
              src={category.image}
              alt=''
              className='max-is-full max-bs-32 rounded-md object-cover border border-divider'
            />
          </div>
        ) : null}
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Name'
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
            )}
          />
          <Controller
            name='slug'
            control={control}
            rules={{ required: 'Slug is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Slug'
                onChange={e => {
                  setSlugTouched(true)
                  field.onChange(e)
                }}
                error={Boolean(errors.slug)}
                helperText={errors.slug?.message}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label='Description' multiline minRows={3} />
            )}
          />
          <FormControl fullWidth>
            <InputLabel id='parent-cat'>Parent category</InputLabel>
            <Controller
              name='parentId'
              control={control}
              render={({ field }) => (
                <Select {...field} labelId='parent-cat' label='Parent category'>
                  <MenuItem value=''>
                    <em>None (root)</em>
                  </MenuItem>
                  {parentOptions.map(o => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
          <div className='flex items-center gap-3'>
            <TextField
              size='small'
              placeholder={mode === 'add' ? 'Image required' : 'New image (optional)'}
              variant='outlined'
              value={fileName}
              className='flex-auto'
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: fileName ? (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={() => {
                          setFileName('')
                          setFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        <i className='ri-close-line' />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
              }}
            />
            <Button component='label' variant='outlined' className='min-is-fit shrink-0'>
              Choose
              <input
                hidden
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </Button>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='contained' type='submit' disabled={busy}>
              {busy ? 'Saving…' : mode === 'add' ? 'Create' : 'Update'}
            </Button>
            <Button variant='outlined' color='secondary' type='button' onClick={handleClose} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      </Box>
    </Drawer>
  )
}

export default CategoryFormDrawer
