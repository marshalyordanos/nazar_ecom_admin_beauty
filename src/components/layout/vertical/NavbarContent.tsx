// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import AdminLiveNotificationsDropdown from '@/components/realtime/AdminLiveNotificationsDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import SaleFromShop from '../shared/SaleFromShop'

const NavbarContent = () => {
  
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        <NavSearch />
      </div>
     

      <div className='flex items-center'>
    
    <div className='mx-5'>  <SaleFromShop />
    </div>
        {/* <LanguageDropdown /> */}
        <ModeDropdown />
        {/* <ShortcutsDropdown shortcuts={shortcuts} /> */}
        <AdminLiveNotificationsDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
