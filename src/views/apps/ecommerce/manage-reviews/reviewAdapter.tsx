import type { ReviewAdmin } from '@/api/admin/types'
import type { ReviewType } from '@/types/apps/ecommerceTypes'

export function mapAdminReviewToManageReview(r: ReviewAdmin): ReviewType {
  const reviewerName =
    [r.user?.firstName, r.user?.lastName].filter(Boolean).join(' ') ||
    r.user?.email ||
    r.userId

  return {
    id: r.id,
    product: r.product?.name || r.productId,
    companyName: r.product?.slug || '',
    productImage: '',
    reviewer: reviewerName,
    email: r.user?.email || '',
    avatar: '',
    date: r.createdAt,
    status: r.status,
    review: r.rating,
    head: r.title || '',
    para: r.comment || ''
  }
}

export function mapAdminReviewsToManageReviews(reviews: ReviewAdmin[]): ReviewType[] {
  return reviews.map(mapAdminReviewToManageReview)
}

