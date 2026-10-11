import { Languages, Menu, Radio, RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { useI18n } from '../../i18n/I18nProvider'

const titles: Record<string, string> = {
  '/': 'Infrastructure Overview',
  '/monitoring': 'Host Monitoring',
  '/docker': 'Docker Fleet',
  '/minecraft': 'Minecraft Server',
  '/codex': 'Codex Activity',
  '/network': 'Network Interfaces',
  '/system': 'System Information',
  '/settings': 'Dashboard Settings',
}

export function Topbar({ onMenu, onRefresh }: { onMenu: () => void; onRefresh: () => void }) {
  const location = useLocation()
  const { locale, t, toggleLocale } = useI18n()
  const title = t(location.pathname.startsWith('/docker/') ? 'Container Detail' : (titles[location.pathname] ?? '8845 KANSHI'))
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-line bg-canvas/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button className="focus-ring rounded-lg p-2 text-secondary hover:bg-panel lg:hidden" onClick={onMenu} aria-label={t('Open menu')}><Menu size={20} /></button>
        <div className="min-w-0">
          <p className="eyebrow">{t('Server Infrastructure')}</p>
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] text-emerald-400 sm:inline-flex"><Radio size={12} className="animate-pulse" /> {t('Live telemetry').toUpperCase()}</span>
        <button className="focus-ring inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-2.5 py-2 text-secondary transition-colors hover:bg-panel-hover hover:text-primary sm:px-3" onClick={toggleLocale} aria-label={t(locale === 'ja' ? 'Switch to English' : 'Switch to Japanese')} title={t(locale === 'ja' ? 'Switch to English' : 'Switch to Japanese')}><Languages size={16} /><span className="font-mono text-[10px] font-semibold">{locale === 'ja' ? 'EN' : '日本語'}</span></button>
        <button className="focus-ring rounded-xl border border-line bg-panel p-2.5 text-secondary transition-colors hover:bg-panel-hover hover:text-primary" onClick={onRefresh} aria-label={t('Refresh dashboard')}><RefreshCw size={16} /></button>
      </div>
    </header>
  )
}
