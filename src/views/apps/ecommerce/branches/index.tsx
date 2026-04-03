// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'


import BranchesCards from './UserListCards'
import BranchesTable from './UserListTable'

const BranchesList = ({ userData }: { userData?: UsersType[] }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <BranchesCards />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BranchesTable />
      </Grid>
    </Grid>
  )
}

export default BranchesList
