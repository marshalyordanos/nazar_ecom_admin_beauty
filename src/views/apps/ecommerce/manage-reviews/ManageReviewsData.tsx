'use client'

import Grid from '@mui/material/Grid'

import { useAdminReviews } from '@/api/admin/reviews'
import type { ReviewAdmin } from '@/api/admin/types'
import type { ReviewType } from '@/types/apps/ecommerceTypes'

import TotalReviews from '@views/apps/ecommerce/manage-reviews/TotalReviews'
import ReviewsStatistics from '@views/apps/ecommerce/manage-reviews/ReviewsStatistics'
import ManageReviewsTable from '@views/apps/ecommerce/manage-reviews/ManageReviewsTable'

import { mapAdminReviewsToManageReviews } from './reviewAdapter'
import { computeReviewStats } from './reviewStats'

const LARGE_PAGE_SIZE = 500

const ManageReviewsData = () => {
  const { data, isLoading, isError } = useAdminReviews({ page: 1, pageSize: LARGE_PAGE_SIZE })

  const adminReviews: ReviewAdmin[] = data?.data ?? []
  const reviewsData: ReviewType[] = mapAdminReviewsToManageReviews(adminReviews)
  const stats = computeReviewStats(adminReviews)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TotalReviews
          averageRating={stats.averageRating}
          totalReviews={stats.totalReviews}
          thisWeekDelta={stats.thisWeekDelta}
          distribution={stats.distribution}
          isLoading={isLoading}
          isError={isError}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ReviewsStatistics
          weeklyCounts={stats.weeklyCounts}
          positivePercent={stats.positivePercent}
          newReviews={stats.thisWeekDelta}
          isLoading={isLoading}
          isError={isError}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ManageReviewsTable reviewsData={reviewsData} />
      </Grid>
    </Grid>
  )
}

export default ManageReviewsData

