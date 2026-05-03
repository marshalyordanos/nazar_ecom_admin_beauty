import OrderAdminDetail from '@/views/apps/ecommerce/orders-admin/OrderAdminDetail'

const OrderAdminDetailPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  return <OrderAdminDetail orderId={params.id} />
}

export default OrderAdminDetailPage
