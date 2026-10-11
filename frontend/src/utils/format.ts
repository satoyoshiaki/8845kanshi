export function formatBytes(value: number | null | undefined, decimals = 1): string {
  if (value == null || Number.isNaN(value)) return 'Unavailable'
  if (value === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const index = Math.min(Math.floor(Math.log(Math.abs(value)) / Math.log(1024)), units.length - 1)
  return `${(value / 1024 ** index).toFixed(index === 0 ? 0 : decimals)} ${units[index]}`
}

export function formatRate(value: number | null | undefined): string {
  return `${formatBytes(value)}/s`
}

type FormatLocale = 'ja' | 'en'

export function formatDuration(seconds: number | null | undefined, locale: FormatLocale = 'en'): string {
  if (seconds == null) return locale === 'ja' ? '取得不可' : 'Unavailable'
  if (seconds < 60) return locale === 'ja' ? `${Math.floor(seconds)}秒` : `${Math.floor(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return locale === 'ja' ? `${minutes}分` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return locale === 'ja' ? `${hours}時間 ${minutes % 60}分` : `${hours}h ${minutes % 60}m`
  const days = Math.floor(hours / 24)
  return locale === 'ja' ? `${days}日 ${hours % 24}時間` : `${days}d ${hours % 24}h`
}

export function formatDate(value: string | null | undefined, locale: FormatLocale = 'en'): string {
  if (!value) return locale === 'ja' ? '取得不可' : 'Unavailable'
  return new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value))
}

export function formatRelative(value: string | null | undefined, locale: FormatLocale = 'en'): string {
  if (!value) return locale === 'ja' ? '取得不可' : 'Unavailable'
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return locale === 'ja' ? `${seconds}秒前` : `${seconds}s ago`
  if (seconds < 3600) return locale === 'ja' ? `${Math.floor(seconds / 60)}分前` : `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return locale === 'ja' ? `${Math.floor(seconds / 3600)}時間前` : `${Math.floor(seconds / 3600)}h ago`
  return locale === 'ja' ? `${Math.floor(seconds / 86400)}日前` : `${Math.floor(seconds / 86400)}d ago`
}
