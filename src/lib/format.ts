export function formatCompactNumber(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${Math.floor(n / 100) / 10}K+`
  return `${Math.floor(n / 100_000) / 10}M+`
}

export function timeAgo(dateIso: string): string {
  const then = new Date(dateIso).getTime()
  const diff = Math.max(0, Date.now() - then)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
