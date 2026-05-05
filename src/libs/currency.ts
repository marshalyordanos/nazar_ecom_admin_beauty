/** Default ISO currency for admin / storefront display */
export const DEFAULT_CURRENCY_CODE = 'ETB'

/** Format a numeric amount as `12,345.67 ETB` (no $). */
export function formatAmountEt(
  amount: number | string | null | undefined,
  opts?: { minFrac?: number; maxFrac?: number }
): string {
  const n = typeof amount === 'number' ? amount : Number(amount)
  const v = Number.isFinite(n) ? n : 0
  const minF = opts?.minFrac ?? 0
  const maxF = opts?.maxFrac ?? 2

  return `${v.toLocaleString('en-US', { minimumFractionDigits: minF, maximumFractionDigits: maxF })} ETB`
}
