interface StatusPillProps {
  label: string
  tone?: 'online' | 'warning' | 'error' | 'neutral'
  pulse?: boolean
}

const tones = {
  online: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  error: 'border-red-500/20 bg-red-500/10 text-red-400',
  neutral: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
}

const dots = {
  online: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-red-400',
  neutral: 'bg-slate-400',
}

export function StatusPill({ label, tone = 'neutral', pulse = false }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[tone]} ${pulse ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}
