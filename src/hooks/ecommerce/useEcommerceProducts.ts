import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as productsApi from '@/api/ecommerce/productsApi'
import type { CreateProductBody, ListProductsParams } from '@/api/ecommerce/productsApi'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/libs/toastUtils'

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
    onSuccess: () => {
      toast.success('Product created successfully')
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to create product'))
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: Partial<CreateProductBody>) => productsApi.updateProduct(id, body),
    onSuccess: () => {
      toast.success('Product updated successfully')
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to update product'))
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('Product deleted successfully')
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete product'))
  })
}

export function useCreateVariant(productId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (form: FormData) => productsApi.createVariant(productId, form),
    onSuccess: () => {
      toast.success('Variant created successfully')
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to create variant'))
  })
}

export function useDeleteVariant() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (variantId: string) => productsApi.deleteVariant(variantId),
    onSuccess: () => {
      toast.success('Variant deleted successfully')
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete variant'))
  })
}

export function useSetVariantOptions() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ variantId, optionValueIds }: { variantId: string; optionValueIds: string[] }) =>
      productsApi.setVariantOptionValues(variantId, optionValueIds),
    onSuccess: () => {
      toast.success('Variant options updated successfully')
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to update variant options'))
  })
}

export function useCreateVariantOption() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: { name: string }) => productsApi.createVariantOption(body),
    onSuccess: () => {
      toast.success('Option created successfully')
      qc.invalidateQueries({ queryKey: productKeys.options() })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to create option'))
  })
}

export function useCreateOptionValue(optionId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: { value: string }) => productsApi.createOptionValue(optionId, body),
    onSuccess: () => {
      toast.success('Option value created successfully')
      qc.invalidateQueries({ queryKey: productKeys.optionValues(optionId) })
      qc.invalidateQueries({ queryKey: productKeys.options() })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to create option value'))
  })
}

export function useDeleteOptionValue(optionId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (valueId: string) => productsApi.deleteOptionValue(valueId),
    onSuccess: () => {
      toast.success('Option value deleted successfully')
      qc.invalidateQueries({ queryKey: productKeys.optionValues(optionId) })
      qc.invalidateQueries({ queryKey: productKeys.options() })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete option value'))
  })
}

export function useDeleteVariantOption() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (optionId: string) => productsApi.deleteVariantOption(optionId),
    onSuccess: () => {
      toast.success('Option deleted successfully')
      qc.invalidateQueries({ queryKey: productKeys.options() })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete option'))
  })
}
