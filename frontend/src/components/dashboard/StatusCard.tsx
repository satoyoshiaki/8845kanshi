import type { LucideIcon } from 'lucide-react'

import { StatusPill } from '../ui/StatusPill'

export function StatusCard({ icon: Icon, label, status, detail, tone }: { icon: LucideIcon; label: string; status: string; detail: string; tone: 'online' | 'warning' | 'error' | 'neutral' }) {
  return (
    <div className="panel flex items-center gap-4 p-4 transition-colors hover:bg-panel-hover">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-canvas/70 text-blue-400"><Icon size={18} /></div>
      <div className="min-w-0 flex-1"><p className="metric-label mb-1.5">{label}</p><p className="truncate text-xs text-secondary">{detail}</p></div>
      <StatusPill label={status} tone={tone} pulse={tone === 'online'} />
    </div>
  )
}
