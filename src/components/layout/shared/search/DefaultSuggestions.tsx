// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type DefaultSuggestionsType = {
  sectionLabel: string
  items: {
    label: string
    href: string
    icon?: string
  }[]
}

const defaultSuggestions: DefaultSuggestionsType[] = [
  {
    sectionLabel: 'Dashboards',
    items: [
      {
        label: 'CRM',
        href: '/dashboards/overview',
        icon: 'ri-pie-chart-2-line'
      },
      {
        label: 'Analytics',
        href: '/dashboards/analytics',
        icon: 'ri-bar-chart-line'
      },
      {
        label: 'eCommerce',
        href: '/dashboards/ecommerce',
        icon: 'ri-shopping-bag-3-line'
      },
      {
        label: 'Academy',
        href: '/dashboards/academy',
        icon: 'ri-book-open-line'
      },
      {
        label: 'Logistics',
        href: '/dashboards/logistics',
        icon: 'ri-truck-line'
      }
    ]
  },
  {
    sectionLabel: 'Catalog Management',
    items: [
      {
        label: 'Product List',
        href: '/apps/ecommerce/products/list',
        icon: 'ri-file-list-line'
      },
      {
        label: 'Variant Options',
        href: '/apps/ecommerce/products/options',
        icon: 'ri-settings-line'
      },
      {
        label: 'Categories',
        href: '/apps/ecommerce/categories',
        icon: 'ri-folder-line'
      },
      {
        label: 'Brands',
        href: '/apps/ecommerce/brands',
        icon: 'ri-shopping-bag-3-line'
      }
    ]
  },
  {
    sectionLabel: 'Branch & Operations',
    items: [
      {
        label: 'Branches',
        href: '/apps/ecommerce/branches',
        icon: 'ri-building-line'
      },
      {
        label: 'Inventory',
        href: '/apps/ecommerce/inventory',
        icon: 'ri-file-text-line'
      }
    ]
  },
  {
    sectionLabel: 'Sales & Transactions',
    items: [
      {
        label: 'Invoice List',
        href: '/apps/invoice/list',
        icon: 'ri-file-list-3-line'
      },
      {
        label: 'Invoice Preview',
        href: '/apps/invoice/preview/4987',
        icon: 'ri-file-list-line'
      },
      {
        label: 'Invoice Edit',
        href: '/apps/invoice/edit/4987',
        icon: 'ri-file-edit-line'
      },
      {
        label: 'Invoice Add',
        href: '/apps/invoice/add',
        icon: 'ri-file-add-line'
      }
    ]
  },
  {
    sectionLabel: 'Customer Interaction',
    items: [
      {
        label: 'Manage Reviews',
        href: '/apps/ecommerce/manage-reviews',
        icon: 'ri-star-line'
      }
    ]
  },
  {
    sectionLabel: 'User Management',
    items: [
      {
        label: 'User List',
        href: '/apps/user/list',
        icon: 'ri-file-user-line'
      },
      {
        label: 'User View',
        href: '/apps/user/view',
        icon: 'ri-file-list-2-line'
      },
      {
        label: 'Roles',
        href: '/apps/roles',
        icon: 'ri-shield-user-line'
      },
      {
        label: 'Permissions',
        href: '/apps/permissions',
        icon: 'ri-lock-unlock-line'
      }
    ]
  }
]

const DefaultSuggestions = ({ setOpen }: { setOpen: (value: boolean) => void }) => {
  // Hooks
  const { lang: locale } = useParams()

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs uppercase text-textDisabled tracking-[0.8px]'>{section.sectionLabel}</p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={getLocalizedUrl(item.href, locale as Locale)}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                  onClick={() => setOpen(false)}
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl shrink-0')} />}
                  <p className='text-[15px] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
