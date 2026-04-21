'use client'

import { useState } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { getApiErrorMessage } from '@/libs/toastUtils'

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: {
            onSuccess: (data: any) => {
              const message = data?.message

              toast.success(typeof message === 'string' && message.trim().length > 0 ? message : 'Action completed successfully')
            },
            onError: error => {
              toast.error(getApiErrorMessage(error, 'Something went wrong'))
            }
          }
        }
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}