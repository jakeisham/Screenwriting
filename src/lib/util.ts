export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export function countWords(s: string) {
  const m = s.match(/[\p{L}\p{N}'’-]+/gu)
  return m ? m.length : 0
}

const pad = (n: number) => String(n).padStart(2, '0')

export function dateKey(d: Date | number = new Date()) {
  const x = typeof d === 'number' ? new Date(d) : d
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
}

export function parseKey(k: string) {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

// Weeks start Monday.
export function weekStart(d: Date = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (x.getDay() + 6) % 7
  return addDays(x, -dow)
}

export function monthKey(d: Date | number = new Date()) {
  const x = typeof d === 'number' ? new Date(d) : d
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`
}

export function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ago(ts: number) {
  const s = (Date.now() - ts) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`
  return fmtDate(ts)
}

export const filled = (s: string | undefined | null) => !!s && s.trim().length > 0
