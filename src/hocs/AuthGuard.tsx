// Third-party Imports
import { cookies } from 'next/headers'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

export default async function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  return <>{accessToken ? children : <AuthRedirect lang={locale} />}</>
}
