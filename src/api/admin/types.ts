import type { Pagination } from '@/types/pagination'
import { ProductVariant } from '@/types/products'
import { Location } from '@/types/shop'

export type ApiListResponse<T> = {
  data: T[]
  pagination: Pagination
}

export type OrderAdmin = {
  id: string
  orderNumber: string
  status: string
  userId: string
  shopId: string
  grandTotal: number
  currency: string
  createdAt: string
  user?: { id: string; email: string; firstName?: string; lastName?: string }
}

export type PaymentAdmin = {
  id: string
  orderId: string
  provider: string
  amount: number
  currency: string
  status: string
  paidAt?: string | null
  createdAt: string
  order?: { orderNumber: string; userId: string }
}

export type ShipmentAdmin = {
  id: string
  orderId: string
  trackingNumber?: string | null
  carrier?: string | null
  status: string
  shippedAt?: string | null
  deliveredAt?: string | null
  order?: { orderNumber: string; userId: string }
}

export type InventoryAdmin = {
  id: string
  variantId: string
  locationId: string
  quantity: number
  reservedQuantity: number
  reorderLevel?: number | null
  updatedAt: string
  variant?: ProductVariant
  location?: Location
}

export type InventoryMovementAdmin = {
  id: string
  variantId: string
  locationId: string
  type: string
  quantity: number
  referenceId?: string | null
  createdAt: string
  variant:ProductVariant
  location:Location
}

export type ReviewAdmin = {
  id: string
  userId: string
  productId: string
  rating: number
  title?: string | null
  comment?: string | null
  status: string
  createdAt: string
  user?: { id: string; firstName?: string; lastName?: string; email?: string }
  product?: { id: string; name?: string; slug?: string }
}

export type RoleAdmin = {
  id: string
  name: string
  description?: string | null
  rolePermissions?: Array<{
    id: string
    permissionId: string
    createAction: boolean
    readAction: boolean
    updateAction: boolean
    deleteAction: boolean
    permission?: { id: string; resource: string }
  }>
}

export type PermissionAdmin = {
  id: string
  resource: string
  description?: string | null
}
