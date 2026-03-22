'use client'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useFormContext } from 'react-hook-form'

const ProductAddHeader = ({ productId }: { productId?: string }) => {
  const { setValue } = useFormContext() // access form

  return (
    <div className='flex flex-wrap sm:items-center justify-between gap-6'>
      <div>
        <Typography variant='h4'>Add a new product</Typography>
        {/* <Typography>Orders placed across your store</Typography> */}
      </div>

      <div className='flex gap-4'>
        <Button variant='outlined' color='secondary'>
          Discard
        </Button>

        {/* Save Draft */}
       { !productId && <Button
          type="submit" // important: triggers form submit
          variant='outlined'
          onClick={(e) =>{ 
            // e.preventDefault()
            setValue('status', 'DRAFT')}} // set status before submit
        >
          Save Draft
        </Button>}

        {/* Publish */}
        <Button
          type="submit" // important: triggers form submit
          variant='contained'
          onClick={(e) =>{ 
            // e.preventDefault()
            setValue('status', 'ACTIVE')}} // set status before submit
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export default ProductAddHeader