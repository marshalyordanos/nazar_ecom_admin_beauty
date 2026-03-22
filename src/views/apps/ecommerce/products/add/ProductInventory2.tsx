'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { RootState } from '@/redux-store'
import { useSelector } from 'react-redux'
import { useShops } from '@/api/shops/useShops'
import { useFormContext } from 'react-hook-form'

const ProductInventory2 = () => {
    const { setValue, getValues } = useFormContext() // access form
    const [locationId, setLocationId] = useState("")
  const [type, setType] = useState("")
  const [quantity, setQuantity] = useState(50)
  const { data: shops } = useShops({ page: 1, pageSize: 10 })
  //   console.log("shops invotery", shops)
  // Pick locations from the only shop row, if available
  const locations =
    shops && shops.data && shops.data.length > 0 && shops.data[0].locations
      ? shops.data[0].locations
      : []

  return (
    <Card>
      <CardHeader title="Inventory" />
      <CardContent>
        <Grid container spacing={5} className="mbe-5">
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" className="mbe-2">
              Add Inventory Transaction
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel size="small">Location</InputLabel>
              <Select
                size="small"
                label="Location"
                value={locationId}
                onChange={e => {
                  setLocationId(e.target.value)
                  setValue('locationId', e.target.value)
                }}
              >
                {locations.map(location => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                    {location.addressLine1
                      ? `, ${location.addressLine1}`
                      : ''}
                    {location.addressLine2
                      ? `, ${location.addressLine2}`
                      : ''}
                    {' '}
                    (ID: {location.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel size="small">Type</InputLabel>
              <Select
                size="small"
                label="Type"
                value={type}
                onChange={e => {
                  setType(e.target.value)
                  setValue('type', e.target.value)
                }}
              >
                <MenuItem value="PURCHASE">Purchase</MenuItem>
                <MenuItem value="SALE">Sale</MenuItem>
                <MenuItem value="RETURN">Return</MenuItem>
                <MenuItem value="ADJUSTMENT">Adjustment</MenuItem>
                <MenuItem value="TRANSFER">Transfer</MenuItem>
                {/* Add more types if needed */}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              size="small"
              value={quantity}
              onChange={e => {
                setQuantity(Number(e.target.value))
                setValue('quantity', Number(e.target.value))
              }}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProductInventory2
