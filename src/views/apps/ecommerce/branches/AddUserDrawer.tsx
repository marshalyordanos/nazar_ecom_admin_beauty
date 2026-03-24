'use client'
// React Imports
import { useState, useRef, useEffect } from 'react'
import { api } from '@/libs/api'
// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

// Map Imports
// NOTE: For demo, using leaflet & react-leaflet. Please install: npm i leaflet react-leaflet
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  async () => {
    const mod = await import('react-leaflet')
    // @ts-ignore
    return (props: any) => <mod.MapContainer {...props} />
  },
  { ssr: false }
)
const TileLayer = dynamic(
  async () => {
    const mod = await import('react-leaflet')
    // @ts-ignore
    return (props: any) => <mod.TileLayer {...props} />
  },
  { ssr: false }
)
const Marker = dynamic(
  async () => {
    const mod = await import('react-leaflet')
    // @ts-ignore
    // Marker props workaround: allow any, forward draggable and eventHandlers as any
    return (props: any) => <mod.Marker {...props} draggable={props.draggable ?? false} eventHandlers={props.eventHandlers} />
  },
  { ssr: false }
)

// Types Imports
import type { UsersType } from '@/types/apps/userTypes'
import { Location } from '@/types/shop'

type Props = {
  data?: Location | null
  shopId: string
  open: boolean
  handleClose: () => void
  userData?: UsersType[]
  setData: (data: UsersType[]) => void
}

type FormValues = {
  name: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
  postalCode: string
  latitude: number | ''
  longitude: number | ''
  phone: string
}

const initialFormData: FormValues = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  latitude: '',
  longitude: '',
  phone: '',
}

const AddUserDrawer = (props: Props) => {
  const { open, handleClose, shopId, data } = props


  console.log("data", props.data)
  const {
    control,
    reset: resetForm,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: initialFormData
  })

  // Determine if editing or creating
  const isEdit = !!data && !!data.id

  // we need a stable id for PATCH request if editing
  // fallback to data?.id, or (per user's example) hardcoded id if required
  const locationId = data?.id ?? 'cmmv4itk30002g8lqjefmrq2w'

  // Initial map center - if editing set to provided lat/lng, else default
  const initialLat =
    typeof data?.latitude === 'number'
      ? data.latitude
      : typeof data?.latitude === 'string' && data.latitude !== ''
      ? Number(data.latitude)
      : 8.9806
  const initialLng =
    typeof data?.longitude === 'number'
      ? data.longitude
      : typeof data?.longitude === 'string' && data.longitude !== ''
      ? Number(data.longitude)
      : 38.7578

  const [mapCenter, setMapCenter] = useState<[number, number]>([initialLat, initialLng])

  // Update form & map center if data changes (edit mode)
  useEffect(() => {
    if (isEdit && data) {
      // Patch to fit FormValues type, fallback to empty string for blank fields
      resetForm({
        name: data.name ?? '',
        addressLine1: data.addressLine1 ?? '',
        addressLine2: data.addressLine2 ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        country: data.country ?? '',
        postalCode: data.postalCode ?? '',
        latitude: data.latitude ?? '',
        longitude: data.longitude ?? '',
        phone: data.phone ?? ''
      })
      // If data contains lat/lng, center the map
      const lat =
        typeof data.latitude === 'number'
          ? data.latitude
          : typeof data.latitude === 'string' && data.latitude !== ''
          ? Number(data.latitude)
          : 8.9806
      const lng =
        typeof data.longitude === 'number'
          ? data.longitude
          : typeof data.longitude === 'string' && data.longitude !== ''
          ? Number(data.longitude)
          : 38.7578
      setMapCenter([lat, lng])
    } else {
      // If ADD mode, initialize/reset empty
      resetForm(initialFormData)
      setMapCenter([8.9806, 38.7578])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data])

  // Sync to marker if controlled
  const markerRef = useRef<any>(null)

  // Submit logic: POST if adding, PATCH if editing
  const onSubmit = async (formData: FormValues) => {
    // Ensure latitude/longitude are numbers
    const latitude =
      typeof formData.latitude === 'string' ? parseFloat(formData.latitude) : formData.latitude
    const longitude =
      typeof formData.longitude === 'string' ? parseFloat(formData.longitude) : formData.longitude

    // Form the body as required
    const payload = {
      ...formData,
      latitude,
      longitude
    }

    try {
      if (isEdit) {
        await api.patch(`/shops/locations/${locationId}`, payload)
        toast.success('Location updated successfully!')
      } else {
        await api.post(`/shops/${shopId}/locations`, payload)
        toast.success('Location saved successfully!')
      }
      handleClose()
      resetForm(initialFormData)
      setMapCenter([8.9806, 38.7578])
    } catch (error: any) {
      toast.error(error?.message || 'Unexpected error')
    }
  }

  const handleReset = () => {
    handleClose()
    resetForm(initialFormData)
    setMapCenter([8.9806, 38.7578])
  }

  // When marker is moved on map
  const handleMapClick = (e: any) => {
    const lat = e.latlng.lat
    const lng = e.latlng.lng
    setMapCenter([lat, lng])
    setValue('latitude', lat)
    setValue('longitude', lng)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 340, sm: 480 }, maxWidth: '100vw' } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>{isEdit ? 'Update Location' : 'Add Location'}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Branch Name'
                placeholder='Main Branch'
                error={!!errors.name}
                helperText={errors.name && 'Required field.'}
              />
            )}
          />
          <Controller
            name='addressLine1'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Address Line 1'
                placeholder='Bole Road, Friendship Building'
                error={!!errors.addressLine1}
                helperText={errors.addressLine1 && 'Required field.'}
              />
            )}
          />
          <Controller
            name='addressLine2'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Address Line 2'
                placeholder='2nd Floor, Office 201'
              />
            )}
          />
          <div className='grid grid-cols-2 gap-4'>
            <Controller
              name='city'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='City'
                  fullWidth
                  error={!!errors.city}
                  helperText={errors.city && 'Required'}
                />
              )}
            />
            <Controller
              name='state'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='State'
                  fullWidth
                  error={!!errors.state}
                  helperText={errors.state && 'Required'}
                />
              )}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Controller
              name='country'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Country'
                  fullWidth
                  error={!!errors.country}
                  helperText={errors.country && 'Required'}
                  placeholder='Ethiopia'
                />
              )}
            />
            <Controller
              name='postalCode'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label='Postal Code'
                  fullWidth
                  error={!!errors.postalCode}
                  helperText={errors.postalCode && 'Required'}
                  placeholder='1000'
                />
              )}
            />
          </div>
          <Controller
            name='phone'
            control={control}
            rules={{
              required: true,
              pattern: /^\+?[0-9\s\-()]+$/
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label='Phone'
                fullWidth
                placeholder='+251911223344'
                error={!!errors.phone}
                helperText={errors.phone?.type === 'pattern' ? 'Invalid phone format.' : errors.phone && 'Required.'}
              />
            )}
          />
          <div className='grid grid-cols-2 gap-4'>
            {/* Manual Latitude */}
            <Controller
              name='latitude'
              control={control}
              rules={{
                required: true,
                validate: value => (!isNaN(Number(value)) && Math.abs(Number(value)) <= 90)
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='number'
                  label='Latitude'
                  fullWidth
                  value={field.value === '' ? '' : Number(field.value)}
                  onChange={e => {
                    const val = e.target.value
                    field.onChange(val === '' ? '' : Number(val))
                    // Keep marker in sync if valid
                    if (!isNaN(Number(val)) && val !== '') {
                      setMapCenter([Number(val), mapCenter[1]])
                    }
                  }}
                  error={!!errors.latitude}
                  helperText={errors.latitude && 'Enter valid latitude (-90 to 90).'}
                  inputProps={{ step: 'any', min: -90, max: 90 }}
                />
              )}
            />
            {/* Manual Longitude */}
            <Controller
              name='longitude'
              control={control}
              rules={{
                required: true,
                validate: value => (!isNaN(Number(value)) && Math.abs(Number(value)) <= 180)
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type='number'
                  label='Longitude'
                  fullWidth
                  value={field.value === '' ? '' : Number(field.value)}
                  onChange={e => {
                    const val = e.target.value
                    field.onChange(val === '' ? '' : Number(val))
                    // Keep marker in sync if valid
                    if (!isNaN(Number(val)) && val !== '') {
                      setMapCenter([mapCenter[0], Number(val)])
                    }
                  }}
                  error={!!errors.longitude}
                  helperText={errors.longitude && 'Enter valid longitude (-180 to 180).'}
                  inputProps={{ step: 'any', min: -180, max: 180 }}
                />
              )}
            />
          </div>
          {/* MAP: User can set lat/lng via click */}
          <div className='flex flex-col gap-2'>
            <Typography variant='subtitle2'>Pin Location on Map (or enter manually above)</Typography>
            <div style={{ width: '100%', height: 250, borderRadius: 8, overflow: 'hidden' }}>
              {typeof window !== 'undefined' && (
                <MapContainer
                  // @ts-ignore: center is valid prop for real MapContainer, type error workaround
                  center={mapCenter}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  // @ts-ignore: whenCreated param
                  whenCreated={(map: any) => {
                    map.on('click', handleMapClick)
                  }}
                >
                  <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  />
                  <Marker
                    // @ts-ignore: allow nonstandard props via dynamic workaround
                    position={mapCenter}
                    draggable={true}
                    eventHandlers={{
                      dragend: (event: any) => {
                        const { lat, lng } = event.target.getLatLng()
                        setMapCenter([lat, lng])
                        setValue('latitude', lat)
                        setValue('longitude', lng)
                      }
                    }}
                  />
                </MapContainer>
              )}
            </div>
            <Typography variant="caption" color="text.secondary">
              Click the map to set location, or drag marker.
            </Typography>
          </div>
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit'>
              {isEdit ? 'Update Location' : 'Save Location'}
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
