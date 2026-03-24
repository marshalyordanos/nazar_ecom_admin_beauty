// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import CategoriesCards from './CategoriesCards'

const Categories = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h4' className='mbe-1'>
          Categories
        </Typography>
        <Typography color='text.secondary'>
          Manage your product category hierarchy, sales rollups, and merchandising structure.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <CategoriesCards />
      </Grid>
    </Grid>
  )
}

export default Categories
