import { getUserData } from '@/app/server/actions'

import MaintenanceModeSettings from '@/views/apps/system/maintenance/MaintenanceModeSettings'

export default async function MaintenancePage() {
  await getUserData()

  return <MaintenanceModeSettings />
}
