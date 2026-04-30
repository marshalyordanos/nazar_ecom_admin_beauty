// Data Imports
import { getUserData } from '@/app/server/actions'

// Component Imports
import StoreSettings from '@/views/apps/ecommerce/store-settings'

const StoreSettingsPage = async () => {
  const data = await getUserData()

  return <StoreSettings userData={data} />
}

export default StoreSettingsPage
