'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useShops } from '@/api/shops/useShops'
import { setShops } from '@/redux-store/slices/shopSlice'

export default function AuthenticatedShopSync() {
  const dispatch = useDispatch()
  const { data: shops } = useShops({ page: 1, pageSize: 10 })

  useEffect(() => {
    if (!shops?.data) return
    dispatch(setShops(shops.data))
  }, [shops, dispatch])

  return null
}
