import type { ReviewAdmin } from '@/api/admin/types'

type ReviewDistribution = Array<{ rating: number; value: number }>

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function computeReviewStats(reviews: ReviewAdmin[]) {
  const totalReviews = reviews.length
  const sum = reviews.reduce((acc, r) => acc + (typeof r.rating === 'number' ? r.rating : 0), 0)
  const averageRating = totalReviews > 0 ? sum / totalReviews : 0

  const distributionMap = new Map<number, number>([
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0]
  ])

  reviews.forEach(r => {
    const rating = Math.max(1, Math.min(5, Number(r.rating || 0)))
    if (Number.isFinite(rating)) distributionMap.set(rating, (distributionMap.get(rating) || 0) + 1)
  })

  const distribution: ReviewDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    value: distributionMap.get(rating) || 0
  }))

  const now = new Date()
  const today0 = startOfDay(now)
  const weekStart = new Date(today0)
  weekStart.setDate(weekStart.getDate() - 6)

  const dailyCounts = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    dailyCounts.set(d.toISOString().slice(0, 10), 0)
  }

  let thisWeekDelta = 0
  reviews.forEach(r => {
    const created = r.createdAt ? new Date(r.createdAt) : null
    if (!created || Number.isNaN(created.getTime())) return

    if (created >= weekStart) {
      thisWeekDelta++
      const key = startOfDay(created).toISOString().slice(0, 10)
      if (dailyCounts.has(key)) dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1)
    }
  })

  const weeklyCounts = Array.from(dailyCounts.values())

  const positive = reviews.filter(r => Number(r.rating || 0) >= 4).length
  const positivePercent = totalReviews > 0 ? Math.round((positive / totalReviews) * 100) : 0

  return {
    totalReviews,
    averageRating,
    distribution,
    thisWeekDelta,
    weeklyCounts,
    positivePercent
  }
}

