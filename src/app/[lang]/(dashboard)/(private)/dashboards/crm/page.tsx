import { redirect } from 'next/navigation'

const DashboardCrmRedirect = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params
  redirect(`/${lang}/dashboards/overview`)
}

export default DashboardCrmRedirect
