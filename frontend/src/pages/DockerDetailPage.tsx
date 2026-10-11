import { ArrowLeft, Box, Cpu, MemoryStick, Network, RotateCcw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'

import { MetricChart } from '../components/charts/MetricChart'
import { RangeSelector, type RangeMinutes } from '../components/charts/RangeSelector'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Panel } from '../components/ui/Panel'
import { StatusPill } from '../components/ui/StatusPill'
import { usePolling } from '../hooks/usePolling'
import type { ContainerMetrics, HistoryPoint } from '../types'
import { formatBytes, formatDate, formatDuration } from '../utils/format'

export function DockerDetailPage() {
  const { id = '' } = useParams()
  const [range, setRange] = useState<RangeMinutes>(5)
  const container = usePolling<ContainerMetrics>(`/docker/${id}`, 3000)
  const history = usePolling<HistoryPoint[]>(`/docker/${id}/history?minutes=${range}`, 3000)
  if (container.loading && !container.data) return <PageSkeleton />
  if (!container.data) return <ErrorBanner message={container.error ?? 'Container unavailable'} onRetry={container.refresh} />
  const data = container.data
  return (
    <div className="space-y-5">
      <Link to="/docker" className="focus-ring inline-flex items-center gap-2 rounded-lg text-xs text-secondary hover:text-primary"><ArrowLeft size={14} /> Back to containers</Link>
      <Panel className="overflow-hidden">
        <div className="relative p-6 sm:p-7"><div className="absolute right-0 top-0 h-40 w-72 bg-accent/10 blur-3xl" /><div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-cyan"><Box size={24} /></div><div><div className="mb-2 flex items-center gap-3"><h2 className="text-2xl font-semibold">{data.name}</h2><StatusPill label={data.health ?? data.status} tone={data.status === 'running' ? 'online' : 'neutral'} /></div><p className="font-mono text-xs text-secondary">{data.short_id} · {data.image}</p></div></div><div className="font-mono text-xs text-secondary">Uptime <span className="ml-2 text-primary">{formatDuration(data.uptime_seconds)}</span></div></div></div>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Cpu} label="CPU" value={`${data.cpu_percent.toFixed(2)}%`} detail="Current usage" />
        <MetricCard icon={MemoryStick} label="Memory" value={formatBytes(data.memory_usage)} detail={`${data.memory_percent.toFixed(1)}% of ${formatBytes(data.memory_limit)}`} accent="violet" />
        <MetricCard icon={Network} label="Network" value={`↓ ${formatBytes(data.network_rx)}`} detail={`↑ ${formatBytes(data.network_tx)}`} accent="cyan" />
        <MetricCard icon={RotateCcw} label="Restarts" value={String(data.restart_count)} detail={`Started ${formatDate(data.started)}`} accent="green" />
      </div>
      <Panel title="Resource History" eyebrow="CPU + Memory" action={<RangeSelector value={range} onChange={setRange} />}><div className="p-4"><MetricChart data={history.data ?? []} series={[{ key: 'cpu_percent', label: 'CPU', color: '#218BFF' }, { key: 'memory_percent', label: 'Memory', color: '#8B5CF6' }]} domain={[0, 100]} height={280} /></div></Panel>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Container Metadata" eyebrow="Runtime identity"><dl className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">{[['Container ID', data.id], ['Image', data.image], ['Created', formatDate(data.created)], ['Started', formatDate(data.started)], ['Block Read', formatBytes(data.block_read)], ['Block Write', formatBytes(data.block_write)]].map(([label, value]) => <div key={label} className="bg-panel p-4"><dt className="metric-label mb-2">{label}</dt><dd className="break-all font-mono text-xs text-primary">{value}</dd></div>)}</dl></Panel>
        <Panel title="Network & Ports" eyebrow="Read-only inspection"><div className="space-y-5 p-5"><div>{data.networks.map((network) => <div key={network.name} className="mb-2 flex items-center justify-between rounded-lg border border-line bg-canvas/40 px-3 py-2 font-mono text-xs"><span>{network.name}</span><span className="text-secondary">{network.ip_address || 'No IP'}</span></div>)}</div><div>{data.ports.length ? data.ports.map((port, index) => <div key={`${port.container}-${index}`} className="mb-2 flex items-center justify-between rounded-lg border border-line bg-canvas/40 px-3 py-2 font-mono text-xs"><span>{port.container}</span><span className="text-secondary">{port.host_ip}:{port.host_port}</span></div>) : <p className="text-sm text-secondary">No published ports.</p>}</div></div></Panel>
      </div>
    </div>
  )
}
