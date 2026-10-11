import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  detail?: string
  accent?: 'blue' | 'cyan' | 'violet' | 'green'
}

const accents = {
  blue: 'from-accent/20 text-blue-400',
  cyan: 'from-cyan/20 text-cyan',
  violet: 'from-violet-500/20 text-violet-400',
  green: 'from-emerald-500/20 text-emerald-400',
}

export function MetricCard({ icon: Icon, label, value, detail, accent = 'blue' }: MetricCardProps) {
  return (
    <div className="panel group relative overflow-hidden p-5 transition-colors hover:bg-panel-hover">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accents[accent]} via-current to-transparent opacity-60`} />
      <div className="mb-5 flex items-center justify-between">
        <span className="metric-label">{label}</span>
        <span className={`rounded-lg bg-gradient-to-br p-2 ${accents[accent]}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="font-mono text-2xl font-semibold tracking-tight text-primary">{value}</p>
      {detail && <p className="mt-1.5 truncate text-xs text-secondary">{detail}</p>}
    </div>
  )
}
