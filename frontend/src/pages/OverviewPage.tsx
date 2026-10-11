import { Box, Bot, Boxes, Cpu, Database, MemoryStick, Network, Server } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MetricChart } from '../components/charts/MetricChart'
import { StatusCard } from '../components/dashboard/StatusCard'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Panel } from '../components/ui/Panel'
import { StatusPill } from '../components/ui/StatusPill'
import { usePolling } from '../hooks/usePolling'
import { useI18n } from '../i18n/I18nProvider'
import type { DashboardResponse, HistoryPoint } from '../types'
import { formatBytes, formatRate } from '../utils/format'

export function OverviewPage() {
  const { t, status } = useI18n()
  const dashboard = usePolling<DashboardResponse>('/dashboard', 3000)
  const hostHistory = usePolling<HistoryPoint[]>('/history/host?minutes=5', 2000)
  const networkHistory = usePolling<HistoryPoint[]>('/history/network?minutes=5', 2000)
  if (dashboard.loading && !dashboard.data) return <PageSkeleton />
  if (!dashboard.data) return <ErrorBanner message={dashboard.error ?? t('Dashboard data unavailable')} onRetry={dashboard.refresh} />

  const { system, docker, minecraft, codex } = dashboard.data
  const primaryDisk = system?.disks[0]
  const networkDown = system?.network.reduce((sum, item) => sum + item.download_bytes_per_second, 0) ?? 0
  const networkUp = system?.network.reduce((sum, item) => sum + item.upload_bytes_per_second, 0) ?? 0
  const running = docker.containers.filter((container) => container.status === 'running')

  return (
    <div className="space-y-5">
      {dashboard.error && <ErrorBanner message={dashboard.error} onRetry={dashboard.refresh} />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard icon={Server} label={t('Host')} status={t(system ? 'Online' : 'Unavailable')} detail={system?.info.hostname ?? t('No host telemetry')} tone={system ? 'online' : 'error'} />
        <StatusCard icon={Boxes} label="Docker" status={t(docker.available ? 'Healthy' : 'Unavailable')} detail={`${running.length} / ${docker.containers.length} ${t('running')}`} tone={docker.available ? 'online' : 'error'} />
        <StatusCard icon={Box} label="Minecraft" status={t(minecraft.online ? 'Online' : 'Offline')} detail={minecraft.online ? `${minecraft.players_online} / ${minecraft.players_max} ${t('Players')}` : t('Server did not respond')} tone={minecraft.online ? 'online' : 'error'} />
        <StatusCard icon={Bot} label="Codex" status={t(codex.active ? 'Active' : 'Idle')} detail={codex.working_directory?.split('/').pop() ?? t('No active workspace')} tone={codex.active ? 'online' : 'neutral'} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Cpu} label="CPU" value={`${system?.cpu.usage_percent.toFixed(1) ?? '—'}%`} detail={system?.cpu.model ?? t('Unavailable')} />
        <MetricCard icon={MemoryStick} label={t('Memory')} value={`${system?.memory.usage_percent.toFixed(1) ?? '—'}%`} detail={system ? `${formatBytes(system.memory.used)} / ${formatBytes(system.memory.total)}` : t('Unavailable')} accent="violet" />
        <MetricCard icon={Database} label={t('Disk')} value={`${primaryDisk?.usage_percent.toFixed(1) ?? '—'}%`} detail={primaryDisk ? `${formatBytes(primaryDisk.used)} / ${formatBytes(primaryDisk.total)}` : t('Unavailable')} accent="green" />
        <MetricCard icon={Network} label={t('Network')} value={`↓ ${formatRate(networkDown)}`} detail={`↑ ${formatRate(networkUp)}`} accent="cyan" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={t('Host Utilization')} eyebrow={t('Realtime // 5 minutes')}>
          <div className="p-4"><MetricChart data={hostHistory.data ?? []} series={[{ key: 'cpu_percent', label: 'CPU', color: '#218BFF' }, { key: 'memory_percent', label: t('Memory'), color: '#8B5CF6' }]} domain={[0, 100]} /></div>
        </Panel>
        <Panel title={t('Network Throughput')} eyebrow={t('Aggregate // 5 minutes')}>
          <div className="p-4"><MetricChart data={networkHistory.data ?? []} series={[{ key: 'rx_bytes_per_second', label: t('Download'), color: '#22D3EE' }, { key: 'tx_bytes_per_second', label: t('Upload'), color: '#60A5FA' }]} formatValue={formatRate} /></div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.75fr]">
        <Panel title={t('Docker Fleet')} eyebrow={t('Container telemetry')} action={<Link to="/docker" className="focus-ring rounded-lg px-2 py-1 font-mono text-[10px] text-blue-400 hover:bg-accent/10">{t('View all').toUpperCase()} →</Link>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-secondary"><tr><th className="px-5 py-3 font-medium">{t('Container')}</th><th className="px-4 py-3 font-medium">{t('State')}</th><th className="px-4 py-3 font-medium">CPU</th><th className="px-4 py-3 font-medium">{t('Memory')}</th><th className="px-5 py-3 text-right font-medium">{t('Network')}</th></tr></thead>
              <tbody className="divide-y divide-line/70">
                {docker.containers.slice(0, 7).map((container) => (
                  <tr key={container.id} className="transition-colors hover:bg-panel-hover">
                    <td className="px-5 py-3"><Link className="focus-ring rounded font-medium hover:text-cyan" to={`/docker/${container.id}`}>{container.name}</Link><p className="mt-0.5 max-w-56 truncate font-mono text-[10px] text-slate-600">{container.image}</p></td>
                    <td className="px-4 py-3"><StatusPill label={status(container.status)} tone={container.status === 'running' ? 'online' : 'neutral'} /></td>
                    <td className="px-4 py-3 font-mono text-xs">{container.cpu_percent.toFixed(1)}%</td>
                    <td className="px-4 py-3 font-mono text-xs">{formatBytes(container.memory_usage)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-secondary">↓ {formatBytes(container.network_rx)} · ↑ {formatBytes(container.network_tx)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title={t('Service Focus')} eyebrow="Minecraft + Codex">
          <div className="divide-y divide-line">
            <Link to="/minecraft" className="focus-ring block p-5 transition-colors hover:bg-panel-hover">
              <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-medium"><Box size={16} className="text-emerald-400" /> Minecraft</span><StatusPill label={t(minecraft.online ? 'Online' : 'Offline')} tone={minecraft.online ? 'online' : 'error'} /></div>
              <div className="grid grid-cols-2 gap-3"><div><p className="metric-label">{t('Players')}</p><p className="mt-1 font-mono text-lg">{minecraft.players_online} / {minecraft.players_max}</p></div><div><p className="metric-label">{t('Latency')}</p><p className="mt-1 font-mono text-lg">{minecraft.latency_ms == null ? '—' : `${minecraft.latency_ms} ms`}</p></div></div>
            </Link>
            <Link to="/codex" className="focus-ring block p-5 transition-colors hover:bg-panel-hover">
              <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-medium"><Bot size={16} className="text-blue-400" /> Codex CLI</span><StatusPill label={t(codex.active ? 'Active' : 'Idle')} tone={codex.active ? 'online' : 'neutral'} /></div>
              <p className="mb-3 truncate font-mono text-xs text-secondary">{codex.working_directory ?? t('No active workspace')}</p>
              <div className="flex gap-5 font-mono text-xs"><span>CPU <b className="text-primary">{codex.cpu_percent.toFixed(1)}%</b></span><span>RAM <b className="text-primary">{formatBytes(codex.memory_bytes)}</b></span></div>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  )
}
