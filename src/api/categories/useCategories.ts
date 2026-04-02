import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  categoryKeys,
  createCategory,
  deleteCategory,
  fetchCategoriesList,
  fetchCategoriesTree,
  updateCategory
} from '@/api/categories/categoryApi'

import type {
  CategoriesQueryParams,
  CategoriesResponse,
  CategoryTreeNode
} from '@/types/category'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/libs/toastUtils'

export function useCategoriesTree() {
  return useQuery<CategoryTreeNode[], Error>({
    queryKey: categoryKeys.tree(),
    queryFn: fetchCategoriesTree,
    staleTime: 1000 * 60
  })
}

export function useCategoriesList(params: Omit<CategoriesQueryParams, 'tree'>) {
  return useQuery<CategoriesResponse, Error>({
    queryKey: categoryKeys.list(params),
    queryFn: () => fetchCategoriesList(params),
    staleTime: 1000 * 60
  })
}

/**
 * @deprecated Prefer useCategoriesTree or useCategoriesList for clearer types.
 * When `tree: true`, data is CategoryTreeNode[]. Otherwise CategoriesResponse.
 */
export function useCategories(params: CategoriesQueryParams) {
  const isTree = params.tree === true
  const { tree, ...listParams } = params

  void tree

  return useQuery<CategoriesResponse | CategoryTreeNode[], Error>({
    queryKey: isTree ? categoryKeys.tree() : categoryKeys.list(listParams),
    queryFn: async () => (isTree ? fetchCategoriesTree() : fetchCategoriesList(listParams)),
    staleTime: 1000 * 60
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (formData: FormData) => createCategory(formData),
    onSuccess: () => {
      toast.success('Category created successfully')
      qc.invalidateQueries({ queryKey: categoryKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to create category'))
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => updateCategory(id, formData),
    onSuccess: () => {
      toast.success('Category updated successfully')
      qc.invalidateQueries({ queryKey: categoryKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to update category'))
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully')
      qc.invalidateQueries({ queryKey: categoryKeys.all })
    },
    onError: error => toast.error(getApiErrorMessage(error, 'Failed to delete category'))
  })
}
