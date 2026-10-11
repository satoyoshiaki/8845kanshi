import { Box, Clock3, Cpu, Gauge, MemoryStick, Network, Users } from 'lucide-react'

import { ErrorBanner } from '../components/ui/ErrorBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Panel } from '../components/ui/Panel'
import { StatusPill } from '../components/ui/StatusPill'
import { usePolling } from '../hooks/usePolling'
import { useI18n } from '../i18n/I18nProvider'
import type { MinecraftStatus } from '../types'
import { formatBytes, formatDuration } from '../utils/format'

export function MinecraftPage() {
  const { locale, t } = useI18n()
  const minecraft = usePolling<MinecraftStatus>('/minecraft', 5000)
  if (minecraft.loading && !minecraft.data) return <PageSkeleton />
  if (!minecraft.data) return <ErrorBanner message={minecraft.error ?? t('Minecraft telemetry unavailable')} onRetry={minecraft.refresh} />
  const data = minecraft.data
  return (
    <div className="space-y-5">
      {minecraft.error && <ErrorBanner message={minecraft.error} onRetry={minecraft.refresh} />}
      <Panel className="overflow-hidden">
        <div className="relative px-6 py-8 sm:px-8"><div className="absolute right-[-4rem] top-[-8rem] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" /><div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="eyebrow mb-3">{t('Minecraft Server')}</p><div className="mb-3 flex items-center gap-3"><h2 className="text-3xl font-semibold tracking-tight">{data.motd || 'Minecraft'}</h2><StatusPill label={t(data.online ? 'Online' : 'Offline')} tone={data.online ? 'online' : 'error'} pulse={data.online} /></div><p className="font-mono text-xs text-secondary">{data.host}:{data.port} · {data.version ?? t('Version unavailable')}</p></div><div className="grid grid-cols-2 gap-8 md:text-right"><div><p className="metric-label">{t('Players')}</p><p className="mt-2 font-mono text-3xl font-semibold">{data.players_online}<span className="text-base text-secondary"> / {data.players_max}</span></p></div><div><p className="metric-label">{t('Latency')}</p><p className="mt-2 font-mono text-3xl font-semibold">{data.latency_ms ?? '—'}<span className="text-base text-secondary"> ms</span></p></div></div></div></div>
      </Panel>
      {!data.online && <ErrorBanner message={t('Minecraft is offline or unreachable. The dashboard and all other monitors remain operational.')} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label={t('Players')} value={`${data.players_online} / ${data.players_max}`} detail={t(data.player_list_available ? 'Player sample available' : 'Player list unavailable')} accent="green" />
        <MetricCard icon={Gauge} label={t('Ping')} value={data.latency_ms == null ? t('Unavailable') : `${data.latency_ms} ms`} detail={t('Server list latency')} accent="cyan" />
        <MetricCard icon={Box} label={t('Version')} value={data.version ?? t('Unavailable')} detail={t('Reported by server')} />
        <MetricCard icon={Clock3} label={t('Uptime')} value={data.container ? formatDuration(data.container.uptime_seconds, locale) : t('Unavailable')} detail={data.container?.name ?? t('Container not found')} accent="violet" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title={t('Online Players')} eyebrow={`${data.players_online} ${t('connected')}`}>
          <div className="p-5">
            {data.player_names?.length ? <div className="space-y-2">{data.player_names.map((player) => <div key={player} className="flex items-center gap-3 rounded-xl border border-line bg-canvas/40 p-3"><img src={`https://mc-heads.net/avatar/${encodeURIComponent(player)}/40`} alt="" className="h-9 w-9 rounded-lg bg-panel" /><div><p className="font-medium">{player}</p><p className="font-mono text-[10px] text-emerald-400">● {t('Online').toUpperCase()}</p></div></div>)}</div> : <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-line text-center"><div><Users className="mx-auto mb-3 text-slate-600" /><p className="text-sm text-secondary">{t(data.player_list_available ? 'No players online' : 'Player list unavailable')}</p></div></div>}
          </div>
        </Panel>
        <Panel title={t('Minecraft Resources')} eyebrow={t('Docker container telemetry')}>
          {data.container ? <div className="grid gap-px bg-line sm:grid-cols-2"><Resource icon={Cpu} label="CPU" value={`${data.container.cpu_percent.toFixed(2)}%`} percent={Math.min(100, data.container.cpu_percent)} /><Resource icon={MemoryStick} label={t('Memory')} value={`${formatBytes(data.container.memory_usage)} / ${formatBytes(data.container.memory_limit)}`} percent={data.container.memory_percent} /><Resource icon={Network} label={t('Network RX')} value={formatBytes(data.container.network_rx)} /><Resource icon={Network} label={t('Network TX')} value={formatBytes(data.container.network_tx)} /></div> : <div className="grid min-h-72 place-items-center p-6 text-center text-sm text-secondary">{t('Minecraft container telemetry is unavailable.')}<br />{t('Set MINECRAFT_CONTAINER_NAME to the actual container name.')}</div>}
        </Panel>
      </div>
    </div>
  )
}

function Resource({ icon: Icon, label, value, percent }: { icon: typeof Cpu; label: string; value: string; percent?: number }) {
  return <div className="bg-panel p-5"><div className="mb-4 flex items-center gap-2 text-secondary"><Icon size={15} /><span className="metric-label">{label}</span></div><p className="font-mono text-lg">{value}</p>{percent != null && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan" style={{ width: `${Math.min(100, percent)}%` }} /></div>}</div>
}
