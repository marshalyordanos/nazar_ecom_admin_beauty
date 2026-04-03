import type { QueryParams } from '@/types/common'

export function buildQuery(params: QueryParams & { extra?: Record<string, string | undefined> }) {
  const searchParams: string[] = []

  if (params.search) {
    const searchStrings = Object.entries(params.search).map(([key, val]) => `${key}:${val}`)

    searchParams.push(`search=${searchStrings.join(',')}`)
  }
  if (params.onlyUsers) {
    searchParams.push(`onlyUsers=true`)
  }

  if (params.filter) {
    const filterStrings = Object.entries(params.filter)
      .filter((entry) => !(Array.isArray(entry[1]) ? entry[1].length === 0 : entry[1] === ''))
      .map(([key, val]) => (Array.isArray(val) ? `${key}:[${val.join('|')}]` : `${key}:${val}`))

    if (filterStrings.length > 0) {
      searchParams.push(`filter=${filterStrings.join(',')}`)
    }
  }

  if (params.sort) {
    const sortStrings = Object.entries(params.sort).map(([key, val]) => `${key}:${val}`)

    searchParams.push(`sort=${sortStrings.join(',')}`)
  }

  if (params.page) searchParams.push(`page=${params.page}`)
  if (params.pageSize) searchParams.push(`pageSize=${params.pageSize}`)

  if (params.extra) {
    Object.entries(params.extra).forEach(([k, v]) => {
      if (v) searchParams.push(`${k}=${encodeURIComponent(v)}`)
    })
  }

  return searchParams.length ? `?${searchParams.join('&')}` : ''
}
