'use client'
import React, { useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Autocomplete,
  MenuItem,
  Typography,
  InputAdornment
} from '@mui/material'
import { useShops } from '@/api/shops/useShops'
import { useSaleFromShop } from '@/api/sales/useSaleFromShop'
import { useProductVariations } from '@/api/productVariation/useProductVariation'

const SaleFromShop = () => {
  const { data: shops } = useShops({})
  const [open, setOpen] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [variant, setVariant] = useState<any>(null)
  const [variantSearch, setVariantSearch] = useState('')
  const [quantity, setQuantity] = useState<number | ''>('')
  const saleMutation = useSaleFromShop()

  // Use search term correctly for querying variants
  const searchTerm = variantSearch.trim()
  // If there is a search term, filter with it, otherwise fetch all
  const { data: variantsResponse, isLoading: loadingVariants } = useProductVariations(
    searchTerm ? { search: { all: searchTerm } } : {}
  )
  const variantsRaw: any[] = variantsResponse?.data || []

  // Flat all locations from all shops if needed
  const locations = useMemo(() => {
    if (!shops || shops.data.length === 0) return []
    const shop0 = shops.data[0]
    return shop0?.locations || []
  }, [shops])

  // Memoize selected location for filtering variants by available inventory
  const selectedLocationId = locationId || (locations.length > 0 ? locations[0].id : '')

  // Filtering: Only those with inventory in selected location
  const variants = useMemo(() => {
    let vs = variantsRaw
    // Filter by location inventory
    if (selectedLocationId) {
      vs = vs.filter((variant: any) =>
        variant.inventories?.some((inv: any) => inv.locationId === selectedLocationId)
      )
    }
    // Client search (additional filtering on top of backend search)
    if (variantSearch.trim()) {
      const lower = variantSearch.trim().toLowerCase()
      vs = vs.filter((variant: any) => {
        const p = variant.product
        const options = (variant.variantOptionValues || [])
          .map((vov: any) =>
            [vov.optionValue?.option?.name, vov.optionValue?.value].filter(Boolean).join(': ')
          ).join(' ')
        return (
          (p?.name?.toLowerCase().includes(lower)) ||
          (variant.sku?.toLowerCase().includes(lower)) ||
          (options?.toLowerCase().includes(lower))
        )
      })
    }
    return vs
  }, [variantsRaw, selectedLocationId, variantSearch])

  // Generate label for option
  const getVariantLabel = (variant: any) => {
    const p = variant.product
    const productName = p?.name || '-'
    const options = (variant.variantOptionValues || [])
      .map((vov: any) => `${vov.optionValue?.option?.name}: ${vov.optionValue?.value}`)
      .join(', ')
    // Find the inventory for this location
    let qty = 0
    const foundInv = variant.inventories?.find((inv: any) => inv.locationId === selectedLocationId)
    if (foundInv) qty = foundInv.quantity
    return (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
        {variant.image &&
          <img src={variant.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
        }
        <Box sx={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>
            {productName} <span style={{ color: '#888' }}>({variant.sku || 'N/A'})</span>
          </div>
          <div style={{ fontSize: 13 }}>
            {options}
          </div>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Qty: {qty}
          </Typography>
        </Box>
      </Box>
    )
  }

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationId || !variant || !quantity) return
    saleMutation.mutate({
      variantId: variant.id,
      locationId: locationId,
      quantity: Number(quantity),
    }, {
      onSuccess: () => {
        setOpen(false)
        setQuantity('')
        setVariant(null)
        setVariantSearch('')
      }
    })
  }

  // When dialog opens initially, set defaults
  const handleOpen = () => {
    setOpen(true)
    if (!locationId && locations.length > 0) {
      setLocationId(locations[0].id)
    }
  }

  return (
    <div>
      <Button
        variant='contained'
        color='primary'
        onClick={handleOpen}
      >
        Sale
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sale from Shop Inventory</DialogTitle>
        <form onSubmit={handleSubmit} autoComplete="off">
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              {/* Location Select */}
              <Autocomplete
                options={locations}
                getOptionLabel={(opt: any) => opt?.name ?? ''}
                value={locations.find((loc: any) => loc.id === locationId) || undefined}
                onChange={(_, newValue: any) => setLocationId(newValue?.id || '')}
                disableClearable
                renderInput={params => (
                  <TextField {...params} label="Location" required />
                )}
              />

              {/* Variant Select with custom option rendering  */}
              <Autocomplete
                options={variants}
                getOptionLabel={(variant: any) => {
                  if (!variant) return ''
                  const p = variant.product
                  return p?.name || variant.sku || ''
                }}
                value={variant}
                onChange={(_, newValue: any) => setVariant(newValue)}
                inputValue={variantSearch}
                onInputChange={(_, value) => setVariantSearch(value)}
                disabled={!selectedLocationId}
                renderOption={(props, option: any) => (
                  <MenuItem {...props} key={option.id} sx={{
                    py: 2,
                    alignItems: 'stretch',
                    borderBottom: '1px solid #eee',
                    whiteSpace: 'wrap'
                  }}>
                    {getVariantLabel(option)}
                  </MenuItem>
                )}
                renderInput={params => (
                  <TextField {...params}
                    label="Product Variant"
                    required
                    placeholder='Search product, SKU, variants...'
                    InputProps={{
                      ...params.InputProps,
                      sx: { minHeight: 85, fontSize: 16 }
                    }}
                  />
                )}
                isOptionEqualToValue={(a: any, b: any) => a?.id === b?.id}
                sx={{ '.MuiAutocomplete-inputRoot': { minHeight: 85, fontSize: 16 } }}
                autoHighlight
                fullWidth
                loading={loadingVariants}
              />

              {/* Quantity Input Field */}
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={e => {
                  const v = e.target.value
                  setQuantity(v === '' ? '' : Math.max(0, Number(v)))
                }}
                inputProps={{ min: 1, step: 1 }}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="body2">items</Typography>
                    </InputAdornment>
                  ),
                  sx: { fontSize: 18 }
                }}
              />
            </Box>
            {saleMutation.isError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {saleMutation.error?.message || 'Submission failed.'}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpen(false)}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saleMutation.isPending || !locationId || !variant || !quantity}
            >
              {saleMutation.isPending ? 'Submitting...' : 'Submit Sale'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

export default SaleFromShop