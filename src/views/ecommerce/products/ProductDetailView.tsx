'use client'

import { useMemo, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import {
  useCreateVariant,
  useDeleteVariant,
  useProductDetail,
  useSetVariantOptions,
  useVariantOptions
} from '@/hooks/ecommerce/useEcommerceProducts'

import EcommerceProductsNav from './EcommerceProductsNav'

type VariantOptionRow = { optionValue: { id: string } }

export default function ProductDetailView() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const shopFromUrl = searchParams.get('shopId') ?? ''
  const [shopId, setShopId] = useState(shopFromUrl || process.env.NEXT_PUBLIC_DEFAULT_SHOP_ID || '')

  const { data: product, isLoading, isError, error, refetch } = useProductDetail(id, shopId || undefined)
  const { data: optionsTree } = useVariantOptions()

  const createVariant = useCreateVariant(id)
  const delVariant = useDeleteVariant()
  const setOpts = useSetVariantOptions()

  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [vStatus, setVStatus] = useState('ACTIVE')
  const [file, setFile] = useState<File | null>(null)

  const allValueIds = useMemo(() => {
    const ids: { id: string; label: string }[] = []

    ;(optionsTree ?? []).forEach(opt => {
      opt.values?.forEach(v => ids.push({ id: v.id, label: `${opt.name}: ${v.value}` }))
    })

    return ids
  }, [optionsTree])

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectedValueIds, setSelectedValueIds] = useState<Record<string, boolean>>({})

  const onSubmitVariant = async () => {
    if (!file) {
      alert('Variant image is required')

      return
    }

    const fd = new FormData()

    fd.append('sku', sku)
    fd.append('price', price)
    fd.append('status', vStatus)
    fd.append('image', file)

    await createVariant.mutateAsync(fd)
    setSku('')
    setPrice('')
    setFile(null)
    refetch()
  }

  const onSaveVariantOptions = async () => {
    if (!selectedVariantId) return

    const ids = Object.entries(selectedValueIds)
      .filter(([, on]) => on)
      .map(([k]) => k)

    await setOpts.mutateAsync({ variantId: selectedVariantId, optionValueIds: ids })
    refetch()
  }

  const openVariantOptions = (variantId: string, current?: VariantOptionRow[]) => {
    setSelectedVariantId(variantId)
    const m: Record<string, boolean> = {}

    allValueIds.forEach(({ id: vid }) => {
      m[vid] = Boolean(current?.some(c => c.optionValue.id === vid))
    })
    setSelectedValueIds(m)
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return <Alert severity='error'>Set NEXT_PUBLIC_API_URL</Alert>
  }

  return (
    <Box>
      <Typography variant='h4' className='mbe-2'>
        Product
      </Typography>
      <EcommerceProductsNav />

      <TextField
        size='small'
        label='Shop ID (query scope)'
        value={shopId}
        onChange={e => setShopId(e.target.value)}
        className='mbe-4'
        sx={{ minWidth: 280 }}
      />

      {isLoading ? (
        <CircularProgress />
      ) : isError ? (
        <Alert severity='error'>{(error as Error)?.message || 'Not found'}</Alert>
      ) : !product ? null : (
        <>
          <Card className='mbe-4'>
            <CardContent>
              <Typography variant='h6'>{product.name}</Typography>
              <Typography color='text.secondary'>{product.slug}</Typography>
              <Typography className='mts-2'>Status: {product.status}</Typography>
              {product.description ? (
                <Typography variant='body2' className='mts-2'>
                  {product.description}
                </Typography>
              ) : null}
            </CardContent>
          </Card>

          <Typography variant='h6' className='mbe-2'>
            Variants
          </Typography>

          {(product.variants ?? []).map(v => (
            <Card key={v.id} className='mbe-2'>
              <CardContent className='flex flex-col gap-2'>
                <Box className='flex flex-wrap justify-between gap-2'>
                  <Box>
                    <Typography fontWeight={600}>{v.sku}</Typography>
                    <Typography variant='body2'>
                      {v.price} · {v.status}
                    </Typography>
                    {v.variantOptionValues?.length ? (
                      <Typography variant='caption' display='block' className='mts-1'>
                        {v.variantOptionValues.map(x => `${x.optionValue.option.name}: ${x.optionValue.value}`).join(' · ')}
                      </Typography>
                    ) : null}
                  </Box>
                  <Box className='flex gap-2'>
                    <Button size='small' variant='outlined' onClick={() => openVariantOptions(v.id, v.variantOptionValues)}>
                      Option values
                    </Button>
                    <Button
                      size='small'
                      color='error'
                      onClick={async () => {
                        if (!confirm('Delete variant?')) return
                        await delVariant.mutateAsync(v.id)
                        refetch()
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
                {v.image || v.media?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.image || v.media?.[0]?.url} alt='' className='max-is-[120px] rounded' />
                ) : null}
              </CardContent>
            </Card>
          ))}

          {selectedVariantId ? (
            <Card className='mbe-4'>
              <CardContent>
                <Typography variant='subtitle1' className='mbe-2'>
                  Assign option values (variant {selectedVariantId.slice(0, 8)}…)
                </Typography>
                <Box className='flex flex-col gap-1 max-bs-[240px] overflow-auto'>
                  {allValueIds.map(({ id: vid, label }) => (
                    <FormControlLabel
                      key={vid}
                      control={
                        <Checkbox
                          checked={!!selectedValueIds[vid]}
                          onChange={e => setSelectedValueIds(s => ({ ...s, [vid]: e.target.checked }))}
                        />
                      }
                      label={label}
                    />
                  ))}
                </Box>
                <Button
                  variant='contained'
                  className='mts-2'
                  disabled={setOpts.isPending}
                  onClick={onSaveVariantOptions}
                >
                  Save options
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Divider className='my-4' />
          <Typography variant='h6' className='mbe-2'>
            Add variant (image required)
          </Typography>
          <Box className='flex flex-col gap-2 max-is-[400px]'>
            <TextField label='SKU' value={sku} onChange={e => setSku(e.target.value)} size='small' />
            <TextField label='Price' value={price} onChange={e => setPrice(e.target.value)} size='small' type='number' />
            <TextField select label='Status' value={vStatus} onChange={e => setVStatus(e.target.value)} size='small'>
              <MenuItem value='ACTIVE'>ACTIVE</MenuItem>
              <MenuItem value='DRAFT'>DRAFT</MenuItem>
            </TextField>
            <Button variant='outlined' component='label'>
              Image
              <input
                type='file'
                hidden
                accept='image/*'
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>
            {file ? <Typography variant='caption'>{file.name}</Typography> : null}
            <Button variant='contained' disabled={createVariant.isPending} onClick={onSubmitVariant}>
              Create variant
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
