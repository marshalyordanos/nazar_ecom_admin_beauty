'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import type { Locale } from '@configs/i18n'

import { getLocalizedUrl } from '@/utils/i18n'

export default function EcommerceProductsNav() {
  const { lang } = useParams()
  const locale = lang as Locale
  const list = getLocalizedUrl('/apps/ecommerce/products/list', locale)
  const add = getLocalizedUrl('/apps/ecommerce/products/add', locale)
  const options = getLocalizedUrl('/apps/ecommerce/products/options', locale)

  return (
    <Stack direction='row' spacing={2} className='mbe-4' flexWrap='wrap'>
      <Button component={Link} href={list} variant='outlined' size='small'>
        Products
      </Button>
      <Button component={Link} href={add} variant='outlined' size='small'>
        Add product
      </Button>
      <Button component={Link} href={options} variant='outlined' size='small'>
        Variant options
      </Button>
    </Stack>
  )
}
