'use client'

import { useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { Locale } from '@configs/i18n'

import { useCreateProduct } from '@/hooks/ecommerce/useEcommerceProducts'
import { getLocalizedUrl } from '@/utils/i18n'

import EcommerceProductsNav from './EcommerceProductsNav'

export default function ProductAddView() {
  const { lang } = useParams()
  const router = useRouter()
  const locale = lang as Locale

  const create = useCreateProduct()

  const [shopId, setShopId] = useState(process.env.NEXT_PUBLIC_DEFAULT_SHOP_ID ?? '')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('ACTIVE')

  const onSubmit = async () => {
    if (!shopId.trim() || !name.trim() || !slug.trim()) {
      alert('Shop ID, name and slug are required')

      return
    }

    const product = await create.mutateAsync({
      shopId: shopId.trim(),
      name: name.trim(),
      slug: slug.trim(),
      status
    })

    const id = (product as { id?: string })?.id

    if (id) {
      router.push(
        getLocalizedUrl(`/apps/ecommerce/products/${id}?shopId=${encodeURIComponent(shopId)}`, locale)
      )
    } else {
      router.push(getLocalizedUrl('/apps/ecommerce/products/list', locale))
    }
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return <Alert severity='error'>Set NEXT_PUBLIC_API_URL</Alert>
  }

  return (
    <Box>
      <Typography variant='h4' className='mbe-2'>
        Add product
      </Typography>
      <EcommerceProductsNav />

      <Card sx={{ maxWidth: 480 }}>
        <CardContent className='flex flex-col gap-3'>
          <TextField label='Shop ID' value={shopId} onChange={e => setShopId(e.target.value)} required fullWidth />
          <TextField label='Name' value={name} onChange={e => setName(e.target.value)} required fullWidth />
          <TextField label='Slug' value={slug} onChange={e => setSlug(e.target.value)} required fullWidth />
          <TextField select label='Status' value={status} onChange={e => setStatus(e.target.value)} fullWidth>
            <MenuItem value='ACTIVE'>ACTIVE</MenuItem>
            <MenuItem value='DRAFT'>DRAFT</MenuItem>
          </TextField>
          <Button variant='contained' onClick={onSubmit} disabled={create.isPending}>
            Create
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}
