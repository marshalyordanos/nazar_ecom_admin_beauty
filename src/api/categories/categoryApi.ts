import { api } from '@/libs/api'

import type { CategoriesQueryParams, CategoriesResponse, Category, CategoryTreeNode } from '@/types/category'

function buildCategoriesQuery(params: CategoriesQueryParams): string {
  const searchParams: string[] = []

  if (params.search) {
    const searchStrings = Object.entries(params.search).map(([k, v]) => `${k}:${v}`)

    searchParams.push(`search=${encodeURIComponent(searchStrings.join(','))}`)
  }

  if (params.tree) {
    searchParams.push('tree=true')
  }

  if (params.filter) {
    const filterStrings = Object.entries(params.filter).map(([k, v]) =>
      Array.isArray(v) ? `${k}:[${v.join('|')}]` : `${k}:${v}`
    )

    searchParams.push(`filter=${encodeURIComponent(filterStrings.join(','))}`)
  }

  if (params.sort) {
    const sortStrings = Object.entries(params.sort).map(([k, v]) => `${k}:${v}`)

    searchParams.push(`sort=${encodeURIComponent(sortStrings.join(','))}`)
  }

  if (params.page) searchParams.push(`page=${params.page}`)
  if (params.pageSize) searchParams.push(`pageSize=${params.pageSize}`)

  return searchParams.length ? `?${searchParams.join('&')}` : ''
}

export async function fetchCategoriesList(params: Omit<CategoriesQueryParams, 'tree'>): Promise<CategoriesResponse> {
  const qs = buildCategoriesQuery({ ...params, tree: false })
  const { data } = await api.get<CategoriesResponse>(`/categories${qs}`)

  
return data
}

export async function fetchCategoriesTree(): Promise<CategoryTreeNode[]> {
  const { data } = await api.get<CategoryTreeNode[]>('/categories?tree=true')

  
return Array.isArray(data) ? data : []
}

export async function fetchCategoryById(id: string): Promise<Category> {
  const { data } = await api.get<Category>(`/categories/${id}`)

  
return data
}

export async function createCategory(formData: FormData): Promise<Category> {
  const { data } = await api.post<Category>('/categories', formData,{
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  
return data
}

export async function updateCategory(id: string, formData: FormData): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, formData,{
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  
return data
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}

export const categoryKeys = {
  all: ['categories'] as const,
  tree: () => [...categoryKeys.all, 'tree'] as const,
  list: (p: Omit<CategoriesQueryParams, 'tree'>) => [...categoryKeys.all, 'list', p] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const
}
