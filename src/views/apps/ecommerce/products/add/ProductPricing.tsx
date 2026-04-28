// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

// Component Imports
import Form from '@components/Form'
import { useFormContext } from 'react-hook-form'

const PRODUCT_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' }
]

const ProductPricing = ({variantStatus}: {variantStatus: string}) => {
  const { register , setValue} = useFormContext()
  return (
    <Card>
      <CardHeader title='Pricing' />
      <CardContent>
        <Form>
          <TextField
            {...register('barcode')}
            fullWidth
            label='Barcode'
            name='barcode'
            placeholder='Enter Barcode'
            className='mbe-5'
          />
          <TextField
            {...register('price')}
            fullWidth
            type='number'
            label='Price'
            name='price'
            placeholder='Enter Price'
            className='mbe-5'
          />
          <TextField
            {...register('comparePrice')}
            fullWidth
            type='number'
            label='Compare Price'
            name='comparePrice'
            placeholder='Enter Compare Price'
            className='mbe-5'
          />
          <TextField
            {...register('costPrice')}
            fullWidth
            type='number'
            label='Cost Price'
            name='costPrice'
            placeholder='Enter Cost Price'
            className='mbe-5'
          />
          <TextField
            // {...register('variantStatus')}
            select
            onChange={(e) => setValue('variantStatus', e.target.value)}
            fullWidth
            label='Status'
            name='variantStatus'
            defaultValue={variantStatus ?? 'ACTIVE'}
            className='mbe-5'
          >
            {PRODUCT_STATUS_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ProductPricing
