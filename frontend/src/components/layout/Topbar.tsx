import { Menu, Radio, RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router-dom'

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
  const title = location.pathname.startsWith('/docker/') ? 'Container Detail' : (titles[location.pathname] ?? '8845 KANSHI')
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-line bg-canvas/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button className="focus-ring rounded-lg p-2 text-secondary hover:bg-panel lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
        <div className="min-w-0">
          <p className="eyebrow">Server Infrastructure</p>
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] text-emerald-400 sm:inline-flex"><Radio size={12} className="animate-pulse" /> LIVE TELEMETRY</span>
        <button className="focus-ring rounded-xl border border-line bg-panel p-2.5 text-secondary transition-colors hover:bg-panel-hover hover:text-primary" onClick={onRefresh} aria-label="Refresh dashboard"><RefreshCw size={16} /></button>
      </div>
    </header>
  )
}
