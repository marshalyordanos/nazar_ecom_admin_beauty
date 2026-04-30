'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import type { UsersType } from '@/types/apps/userTypes'
import { api } from '@/libs/api'
import { useShops } from '@/api/shops/useShops'
import { toast } from 'react-toastify'

const StoreSettings = ({ userData: _userData }: { userData?: UsersType[] }) => {
  const queryClient = useQueryClient()

  const { data: shopsRes, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 1 })

  const shop = shopsRes?.data?.[0]

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [telegramUrl, setTelegramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [xUrl, setXUrl] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!shop) return
    setName(shop.name ?? '')
    setPhone(shop.phone ?? '')
    setInstagramUrl(shop.instagramUrl ?? '')
    setTelegramUrl(shop.telegramUrl ?? '')
    setFacebookUrl(shop.facebookUrl ?? '')
    setYoutubeUrl(shop.youtubeUrl ?? '')
    setXUrl(shop.xUrl ?? '')
    setLogoFile(null)
    setLogoPreview(shop.logoUrl || null)
  }, [shop])

  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!shop?.id) {
      toast.error('No shop exists yet. Create a shop first.')
      return
    }
    setSubmitting(true)
    const fd = new FormData()
    fd.append('name', name.trim())
    if (shop.slug) fd.append('slug', shop.slug)
    if (shop.email != null && shop.email !== '') fd.append('email', shop.email)
    fd.append('phone', phone.trim())
    fd.append('instagramUrl', instagramUrl.trim())
    fd.append('telegramUrl', telegramUrl.trim())
    fd.append('facebookUrl', facebookUrl.trim())
    fd.append('youtubeUrl', youtubeUrl.trim())
    fd.append('xUrl', xUrl.trim())
    if (shop.currency) fd.append('currency', shop.currency)
    if (shop.timezone) fd.append('timezone', shop.timezone)
    if (shop.status) fd.append('status', shop.status)
    if (shop.description != null && shop.description !== '') fd.append('description', shop.description)

    if (logoFile) {
      fd.append('image', logoFile)
    }

    try {
      await api.patch(`/shops/${shop.id}`, fd)

      toast.success('Store profile updated.')
      queryClient.invalidateQueries({ queryKey: ['shops'] })
      setLogoFile(null)

      try {
        const refreshed = await api.get('/shops?pageSize=1&page=1')
        const s = refreshed.data?.data?.[0]
        if (s?.logoUrl) setLogoPreview(s.logoUrl)
      } catch {
        //
      }
    } catch {
      toast.error('Failed to update store.')
    }
    setSubmitting(false)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Typography variant='h5' gutterBottom sx={{ px: { xs: 4, md: 0 } }}>
          Store profile
        </Typography>
        <Typography variant='body2' sx={{ px: { xs: 4, md: 0 }, color: 'text.secondary', mb: 2 }}>
          Logo, store name, phone, and social links shown on the public storefront footer.
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 8, lg: 6 }}>
        <Card>
          <CardHeader title='Public-facing details' />
          <CardContent>
            {shopsLoading ? (
              <CircularProgress />
            ) : shop ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {logoPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <Box component='img' src={logoPreview} alt='Logo' sx={{ height: 64, width: 'auto', maxWidth: 280, objectFit: 'contain' }} />
                )}
                <Box>
                  <Button variant='outlined' component='label' size='small'>
                    Replace logo
                    <input type='file' hidden accept='image/*' onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                  </Button>
                  {logoFile ? (
                    <Typography variant='caption' sx={{ ml: 1 }}>
                      Selected: {logoFile.name}
                    </Typography>
                  ) : null}
                </Box>
                <TextField label='Shop name' value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                <TextField label='Phone' value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth helperText='Shown on the storefront footer' />
                <TextField label='Instagram URL' value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} fullWidth placeholder='https://instagram.com/your-shop' />
                <TextField label='Telegram URL' value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} fullWidth helperText='https://t.me/username' />
                <TextField label='Facebook URL' value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} fullWidth placeholder='https://facebook.com/your-page' />
                <TextField label='YouTube URL' value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} fullWidth placeholder='https://youtube.com/@your-channel' />
                <TextField label='X (Twitter) URL' value={xUrl} onChange={(e) => setXUrl(e.target.value)} fullWidth placeholder='https://x.com/your-handle' />

                <Button
                  variant='contained'
                  onClick={submit}
                  disabled={submitting}
                  startIcon={
                    submitting ? <CircularProgress size={18} color='inherit' /> : undefined
                  }
                >
                  Save
                </Button>
              </Box>
            ) : (
              <Typography color='text.secondary'>No shop found.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StoreSettings
