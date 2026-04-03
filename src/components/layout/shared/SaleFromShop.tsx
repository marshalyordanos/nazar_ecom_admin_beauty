'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
  Stack,
  Divider,
  IconButton,
  Paper,
  InputAdornment
} from '@mui/material'
import { useShops } from '@/api/shops/useShops'
import { useSaleFromShop } from '@/api/sales/useSaleFromShop'
import { useProductVariations } from '@/api/productVariation/useProductVariation'

type SaleLine = {
  key: string
  variant: any | null
  quantity: number | ''
  search: string
}

const createLine = (): SaleLine => ({
  key:
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  variant: null,
  quantity: 1,
  search: ''
})

const filterVariantsBySearch = (variants: any[], search: string) => {
  if (!search.trim()) return variants
  const lower = search.trim().toLowerCase()
  return variants.filter((variant: any) => {
    const p = variant.product
    const options = (variant.variantOptionValues || [])
      .map((vov: any) =>
        [vov.optionValue?.option?.name, vov.optionValue?.value].filter(Boolean).join(': ')
      )
      .join(' ')
    return (
      (p?.name?.toLowerCase().includes(lower)) ||
      (variant.sku?.toLowerCase().includes(lower)) ||
      (options?.toLowerCase().includes(lower))
    )
  })
}

const getAvailableAtLocation = (variant: any | null, locationId: string) => {
  if (!variant || !locationId) return 0
  const inv = variant.inventories?.find((i: any) => i.locationId === locationId)
  return inv?.quantity ?? 0
}

const SaleFromShop = () => {
  const { data: shops } = useShops({})
  const [open, setOpen] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [lines, setLines] = useState<SaleLine[]>(() => [createLine()])
  const saleMutation = useSaleFromShop()

  const { data: variantsResponse, isLoading: loadingVariants } = useProductVariations({})
  const variantsRaw: any[] = variantsResponse?.data || []

  const locations = useMemo(() => {
    if (!shops || shops.data.length === 0) return []
    const shop0 = shops.data[0]
    return shop0?.locations || []
  }, [shops])

  const selectedLocationId = locationId || (locations.length > 0 ? locations[0].id : '')

  const variantsAtLocation = useMemo(() => {
    if (!selectedLocationId) return []
    return variantsRaw.filter((variant: any) =>
      variant.inventories?.some((inv: any) => inv.locationId === selectedLocationId)
    )
  }, [variantsRaw, selectedLocationId])

  useEffect(() => {
    if (!selectedLocationId) return
    setLines(prev =>
      prev.map(line => {
        if (!line.variant) return line
        const ok = line.variant.inventories?.some((inv: any) => inv.locationId === selectedLocationId)
        return ok ? line : { ...line, variant: null }
      })
    )
  }, [selectedLocationId])

  const updateLine = (key: string, patch: Partial<SaleLine>) => {
    setLines(prev => prev.map(l => (l.key === key ? { ...l, ...patch } : l)))
  }

  const addLine = () => setLines(prev => [...prev, createLine()])
  const removeLine = (key: string) => {
    setLines(prev => (prev.length <= 1 ? prev : prev.filter(l => l.key !== key)))
  }

  const getVariantLabel = (variant: any, locId: string) => {
    const p = variant.product
    const productName = p?.name || '-'
    const options = (variant.variantOptionValues || [])
      .map((vov: any) => `${vov.optionValue?.option?.name}: ${vov.optionValue?.value}`)
      .join(', ')
    const qty = getAvailableAtLocation(variant, locId)
    return (
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
        {variant.image && (
          <img src={variant.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
        )}
        <Box sx={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>
            {productName} <span style={{ color: '#888' }}>({variant.sku || 'N/A'})</span>
          </div>
          <div style={{ fontSize: 13 }}>{options}</div>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
            Stock: {qty}
          </Typography>
        </Box>
      </Box>
    )
  }

  const itemsPayload = useMemo(() => {
    return lines
      .filter(l => l.variant && l.quantity !== '' && Number(l.quantity) >= 1)
      .map(l => ({
        variantId: l.variant!.id as string,
        quantity: Number(l.quantity)
      }))
  }, [lines])

  const canSubmit = useMemo(() => {
    if (!locationId || itemsPayload.length === 0) return false
    for (const line of lines) {
      if (!line.variant) continue
      const max = getAvailableAtLocation(line.variant, selectedLocationId)
      const q = line.quantity === '' ? 0 : Number(line.quantity)
      if (q < 1 || q > max) return false
    }
    return true
  }, [lines, locationId, itemsPayload.length, selectedLocationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationId || itemsPayload.length === 0 || !canSubmit) return
    saleMutation.mutate(
      { locationId, items: itemsPayload },
      {
        onSuccess: () => {
          setOpen(false)
          setLines([createLine()])
        }
      }
    )
  }

  const handleOpen = () => {
    setOpen(true)
    if (!locationId && locations.length > 0) {
      setLocationId(locations[0].id)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setLines([createLine()])
  }

  const lineCount = lines.filter(l => l.variant).length

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Sale
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Sale from shop inventory</DialogTitle>
        <form onSubmit={handleSubmit} autoComplete="off">
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 0.5 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Location
                </Typography>
                <Autocomplete
                  options={locations}
                  getOptionLabel={(opt: any) => opt?.name ?? ''}
                  value={locations.find((loc: any) => loc.id === locationId) || undefined}
                  onChange={(_, newValue: any) => setLocationId(newValue?.id || '')}
                  disableClearable
                  renderInput={params => <TextField {...params} label="Branch / location" required />}
                />
              </Box>

              <Divider />

              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Line items
                  </Typography>
                  <Button
                    size="medium"
                    variant="outlined"
                    startIcon={<i className="ri-add-line" />}
                    onClick={addLine}
                    disabled={!selectedLocationId}
                    className='my-2'
                    style={{ margin: '10px 0' ,padding: '10px 20px'}}
                  >
                    Add product 
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {lines.map((line, index) => {
                    const options = filterVariantsBySearch(variantsAtLocation, line.search)
                    const maxQty = getAvailableAtLocation(line.variant, selectedLocationId)
                    const q = line.quantity === '' ? 0 : Number(line.quantity)
                    const qtyInvalid = line.variant && (q < 1 || q > maxQty)

                    return (
                      <Paper key={line.key} variant="outlined" sx={{ p: 3, borderRadius: 'var(--mui-shape-customBorderRadius-lg, 8px)' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
                          <Box sx={{ flex: 2, minWidth: 0 }}>
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                              Product #{index + 1}
                            </Typography>
                            <Autocomplete
                              options={options}
                              getOptionLabel={(v: any) => {
                                if (!v) return ''
                                const p = v.product
                                return p?.name || v.sku || ''
                              }}
                              value={line.variant}
                              onChange={(_, newValue: any) => updateLine(line.key, { variant: newValue })}
                              inputValue={line.search}
                              onInputChange={(_, value) => updateLine(line.key, { search: value })}
                              disabled={!selectedLocationId}
                              renderOption={(props, option: any) => (
                                <MenuItem
                                  {...props}
                                  key={option.id}
                                  sx={{
                                    py: 2,
                                    alignItems: 'stretch',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    whiteSpace: 'wrap'
                                  }}
                                >
                                  {getVariantLabel(option, selectedLocationId)}
                                </MenuItem>
                              )}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  label="Product variant"
                                  placeholder="Search name, SKU, options…"
                                  required={false}
                                  InputProps={{
                                    ...params.InputProps,
                                    sx: { minHeight: 72 }
                                  }}
                                />
                              )}
                              isOptionEqualToValue={(a: any, b: any) => a?.id === b?.id}
                              loading={loadingVariants}
                              fullWidth
                            />
                          </Box>
                          <Box sx={{flex: 1, width: { xs: '100%', sm: 140 }, flexShrink: 0 }}>
                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>
                              Quantity
                            </Typography>
                            <TextField
                              type="number"
                              label="Qty"
                              value={line.quantity}
                              onChange={e => {
                                const v = e.target.value
                                updateLine(line.key, {
                                  quantity: v === '' ? '' : Math.max(0, Number(v))
                                })
                              }}
                              disabled={!line.variant}
                              error={Boolean(qtyInvalid)}
                              helperText={
                                line.variant ? `Max ${maxQty}` : ' '
                              }
                              inputProps={{ min: 1, max: maxQty || 1, step: 1 }}
                              fullWidth
                              InputProps={{
                                ...{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography variant="caption" color="text.secondary">
                                        max {maxQty}
                                      </Typography>
                                    </InputAdornment>
                                  ),
                                  sx: { minHeight: 100 }
                                }
                              }}
                              sx={{
                                "& .MuiInputBase-root": {
                                  minHeight: 70,
                                  // minWidth: 10,
                                  alignItems: 'flex-start'
                                }
                              }}
                            />
                          </Box>
                          <IconButton
                            aria-label="Remove line"
                            color="error"
                            onClick={() => removeLine(line.key)}
                            disabled={lines.length <= 1}
                            sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, mt: { xs: 0, sm: 2.5 } }}
                          >
                            <i className="ri-delete-bin-line" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    )
                  })}
                </Stack>
              </Box>

              {lineCount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {lineCount} product{lineCount !== 1 ? 's' : ''} in this sale
                </Typography>
              )}
            </Stack>

            {saleMutation.isError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {saleMutation.error?.message || 'Submission failed.'}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saleMutation.isPending || !locationId || !canSubmit || itemsPayload.length === 0}
            >
              {saleMutation.isPending ? 'Submitting…' : 'Submit sale'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}

export default SaleFromShop
