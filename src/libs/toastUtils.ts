import type { AxiosError } from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  const e = error as AxiosError<any> | undefined

  const responseData = e?.response?.data as any

  return (
    responseData?.message ??
    responseData?.error ??
    responseData?.errors?.[0]?.message ??
    e?.message ??
    fallback
  )
}

