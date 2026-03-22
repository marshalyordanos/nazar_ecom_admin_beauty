import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as productsApi from '@/api/ecommerce/productsApi'
import type { CreateProductBody, ListProductsParams } from '@/api/ecommerce/productsApi'

export const productKeys = {
  all: ['products'] as const,
  list: (p: ListProductsParams) => [...productKeys.all, 'list', p] as const,
  detail: (id: string, shopId?: string) => [...productKeys.all, 'detail', id, shopId] as const,
  options: () => [...productKeys.all, 'options'] as const,
  optionValues: (optionId: string) => [...productKeys.all, 'optionValues', optionId] as const
}

export function useProductsList(params: ListProductsParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.listProducts(params),
    enabled: Boolean(params.shopId)
  })
}

export function useProductDetail(id: string, shopId?: string) {
  return useQuery({
    queryKey: productKeys.detail(id, shopId),
    queryFn: () => productsApi.getProductById(id, shopId),
    enabled: Boolean(id)
  })
}

export function useVariantOptions() {
  return useQuery({
    queryKey: productKeys.options(),
    queryFn: () => productsApi.listVariantOptions()
  })
}

export function useOptionValues(optionId: string) {
  return useQuery({
    queryKey: productKeys.optionValues(optionId),
    queryFn: () => productsApi.listOptionValues(optionId),
    enabled: Boolean(optionId)
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateProductBody) => productsApi.createProduct(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all })
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: Partial<CreateProductBody>) => productsApi.updateProduct(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all })
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all })
  })
}

export function useCreateVariant(productId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (form: FormData) => productsApi.createVariant(productId, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all })
  })
}

export function useDeleteVariant() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (variantId: string) => productsApi.deleteVariant(variantId),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all })
  })
}

export function useSetVariantOptions() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ variantId, optionValueIds }: { variantId: string; optionValueIds: string[] }) =>
      productsApi.setVariantOptionValues(variantId, optionValueIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.all })
  })
}

export function useCreateVariantOption() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: { name: string }) => productsApi.createVariantOption(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.options() })
  })
}

export function useCreateOptionValue(optionId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: { value: string }) => productsApi.createOptionValue(optionId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.optionValues(optionId) })
      qc.invalidateQueries({ queryKey: productKeys.options() })
    }
  })
}

export function useDeleteOptionValue(optionId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (valueId: string) => productsApi.deleteOptionValue(valueId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.optionValues(optionId) })
      qc.invalidateQueries({ queryKey: productKeys.options() })
    }
  })
}

export function useDeleteVariantOption() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (optionId: string) => productsApi.deleteVariantOption(optionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: productKeys.options() })
  })
}
