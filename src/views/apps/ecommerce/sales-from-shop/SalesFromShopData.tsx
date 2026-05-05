'use client'

import { useCallback, useMemo, useState } from 'react'

import Grid from '@mui/material/Grid'

import { useShops } from '@/api/shops/useShops'
import {
  useDeleteSaleFromShop,
  useSalesFromShopList,
  useSalesFromShopStats,
  useUpdateSaleFromShop
} from '@/api/sales/useSaleFromShop'

import { DEFAULT_CURRENCY_CODE } from '@/libs/currency'

import SalesFromShopStatsCards from './SalesFromShopStatsCards'
import SalesFromShopTable from './SalesFromShopTable'

const SalesFromShopData = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [shopFilter, setShopFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      ...(searchInput.trim()
        ? { search: { all: searchInput.trim() } as Record<string, string> }
        : {}),
      ...(shopFilter ? { shopId: shopFilter } : {}),
      ...(locationFilter ? { locationId: locationFilter } : {})
    }),
    [page, pageSize, searchInput, shopFilter, locationFilter]
  )

  const { data: shopsRes } = useShops({ page: 1, pageSize: 50 })
  const shops = shopsRes?.data ?? []
  const currency = shops[0]?.currency ?? DEFAULT_CURRENCY_CODE

  const { data: listRes, isLoading, isError } = useSalesFromShopList(listParams)
  const { data: stats, isLoading: statsLoading, isError: statsError } = useSalesFromShopStats()

  const updateMutation = useUpdateSaleFromShop()
  const deleteMutation = useDeleteSaleFromShop()

  const rows = listRes?.data ?? []
  const total = listRes?.pagination?.total ?? 0
  const isMutating = updateMutation.isPending || deleteMutation.isPending

  const handleSearchChange = useCallback((v: string) => {
    setSearchInput(v)
    setPage(1)
  }, [])

  return (
    <Grid container spacing={{ xs: 3, md: 6 }}>
      <Grid size={{ xs: 12 }}>
        <SalesFromShopStatsCards
          stats={stats}
          isLoading={statsLoading}
          isError={statsError}
          currency={currency}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SalesFromShopTable
          rows={rows}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={p => setPage(p)}
          onPageSizeChange={size => {
            setPageSize(size)
            setPage(1)
          }}
          search={searchInput}
          onSearchChange={handleSearchChange}
          shops={shops}
          shopFilter={shopFilter}
          locationFilter={locationFilter}
          onShopFilter={id => {
            setShopFilter(id)
            setLocationFilter('')
            setPage(1)
          }}
          onLocationFilter={id => {
            setLocationFilter(id)
            setPage(1)
          }}
          isLoading={isLoading}
          listError={isError}
          currency={currency}
          onEdit={(row, payload) => updateMutation.mutateAsync({ id: row.id, payload })}
          onDelete={id => deleteMutation.mutateAsync(id)}
          isMutating={isMutating}
        />
      </Grid>
    </Grid>
  )
}

export default SalesFromShopData
