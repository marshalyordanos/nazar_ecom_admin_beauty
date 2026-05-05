/** Compact display like template "8.14k", "155k" */
export function formatCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(Math.round(n * 100) / 100)
}

export function formatCurrencyCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `ETB ${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `ETB ${(n / 1_000).toFixed(1)}k`
  return `ETB ${Math.round(n)}`
}

/** Trend string like "+22%" or "-3%" */
export function formatTrendPercent(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}
