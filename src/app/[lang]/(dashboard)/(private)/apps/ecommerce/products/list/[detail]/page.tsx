
// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
// import ProductListTable from '@views/apps/ecommerce/products/list/ProductListTable'

// Data Imports
import ProductVariationCard from '@/views/apps/ecommerce/products/detail/ProductVariationCard'
import ProductVariationDetailTable from '@/views/apps/ecommerce/products/detail/ProductVariationTable'
// import { useProduct } from '@/api/products/useProduct'
// import { useSelector } from 'react-redux'
// import { RootState } from '@/redux-store'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/ecommerce` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getEcommerceData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/ecommerce`)

  if (!res.ok) {
    throw new Error('Failed to fetch ecommerce data')
  }

  return res.json()
} */

const eCommerceProductsList = async () => {
  
  // const shop:any = useSelector((state: RootState) => state.shopReducer.shops)
  
  // Example: you could use `id` here for data fetching if needed
  // const {data:product}=useProduct(id)

  // Vars


  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <ProductVariationCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ProductVariationDetailTable  />
      </Grid>
    </Grid>
  )
}

export default eCommerceProductsList
