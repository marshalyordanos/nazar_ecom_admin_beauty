'use client'

import { useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { Locale } from '@configs/i18n'

import { useProductsList } from '@/hooks/ecommerce/useEcommerceProducts'
import { getLocalizedUrl } from '@/utils/i18n'

import EcommerceProductsNav from './EcommerceProductsNav'

const defaultShop = process.env.NEXT_PUBLIC_DEFAULT_SHOP_ID ?? ''

export default function ProductsListView() {
  const { lang } = useParams()
  const locale = lang as Locale

  const [shopId, setShopId] = useState(defaultShop)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const listParams = useMemo(
    () => ({
      shopId: shopId.trim() || undefined,
      page,
      pageSize,
      search: search.trim() || undefined
    }),
    [shopId, page, pageSize, search]
  )

  const { data, isLoading, isError, error } = useProductsList(listParams)

  if (!process.env.NEXT_PUBLIC_API_URL) {
    return <Alert severity='error'>Set NEXT_PUBLIC_API_URL in .env</Alert>
  }

  return (
    <Box>
      <Typography variant='h4' className='mbe-2'>
        E-commerce products
      </Typography>
      <EcommerceProductsNav />

      <Card>
        <CardContent className='flex flex-col gap-4'>
          <StackRow>
            <TextField
              size='small'
              label='Shop ID'
              value={shopId}
              onChange={e => setShopId(e.target.value)}
              helperText='Required for listing. Set NEXT_PUBLIC_DEFAULT_SHOP_ID to prefill.'
              sx={{ minWidth: 280 }}
            />
            <TextField
              size='small'
              label='Search'
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
              sx={{ minWidth: 220 }}
            />
          </StackRow>

          {!shopId.trim() ? (
            <Alert severity='info'>Enter a shop ID to load products.</Alert>
          ) : isLoading ? (
            <Box className='flex justify-center p-8'>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity='error'>{(error as Error)?.message || 'Failed to load'}</Alert>
          ) : (
            <>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>From price</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.data ?? []).map(row => {
                    const minPrice = row.variants?.length
                      ? Math.min(...row.variants.map(v => v.price))
                      : null

                    const thumb =
                      row.variants?.[0]?.media?.[0]?.url || row.variants?.[0]?.image || null

                    return (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Box className='flex items-center gap-2'>
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={thumb} alt='' className='bs-10 is-10 rounded object-cover' />
                            ) : null}
                            {row.name}
                          </Box>
                        </TableCell>
                        <TableCell>{row.slug}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{minPrice != null ? minPrice.toFixed(2) : '—'}</TableCell>
                        <TableCell align='right'>
                          <Button
                            component={Link}
                            size='small'
                            href={getLocalizedUrl(
                              `/apps/ecommerce/products/${row.id}?shopId=${encodeURIComponent(shopId)}`,
                              locale
                            )}
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component='div'
                count={data?.pagination.total ?? 0}
                page={page - 1}
                onPageChange={(_, p) => setPage(p + 1)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={e => {
                  setPageSize(parseInt(e.target.value, 10))
                  setPage(1)
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

function StackRow({ children }: { children: React.ReactNode }) {
  return <div className='flex flex-wrap gap-4 items-end'>{children}</div>
}
