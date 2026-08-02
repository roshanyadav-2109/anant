/** Recency buckets + compact relative labels for the conversation history. */

const DAY = 86_400_000

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Which recency group a timestamp belongs to. Older than this month → month + year. */
export function bucketFor(ts: number): string {
  const now = new Date()
  const today0 = startOfDay(now)
  if (ts >= today0) return 'Today'
  if (ts >= today0 - DAY) return 'Yesterday'
  const dow = (now.getDay() + 6) % 7 // 0 = Monday
  const weekStart = today0 - dow * DAY
  if (ts >= weekStart) return 'This week'
  if (ts >= weekStart - 7 * DAY) return 'Last week'
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  if (ts >= monthStart) return 'This month'
  return new Date(ts).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

/** A short label for the row: Today / Yesterday / weekday / date. */
export function relativeShort(ts: number): string {
  const now = new Date()
  const today0 = startOfDay(now)
  const d = new Date(ts)
  if (ts >= today0) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (ts >= today0 - DAY) return 'Yesterday'
  if (ts >= today0 - 6 * DAY) return d.toLocaleDateString(undefined, { weekday: 'short' })
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(
    undefined,
    sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: '2-digit' },
  )
}
