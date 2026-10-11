import { Box, Boxes, Cpu, MemoryStick, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { ErrorBanner } from '../components/ui/ErrorBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Panel } from '../components/ui/Panel'
import { StatusPill } from '../components/ui/StatusPill'
import { usePolling } from '../hooks/usePolling'
import type { DockerResponse } from '../types'
import { formatBytes, formatDuration } from '../utils/format'

export function DockerPage() {
  const docker = usePolling<DockerResponse>('/docker', 3000)
  const [query, setQuery] = useState('')
  const containers = useMemo(() => docker.data?.containers.filter((item) => `${item.name} ${item.image}`.toLowerCase().includes(query.toLowerCase())) ?? [], [docker.data, query])
  if (docker.loading && !docker.data) return <PageSkeleton />
  if (!docker.data) return <ErrorBanner message={docker.error ?? 'Docker unavailable'} onRetry={docker.refresh} />
  const running = docker.data.containers.filter((item) => item.status === 'running')
  const totalMemory = running.reduce((sum, item) => sum + item.memory_usage, 0)
  const totalCpu = running.reduce((sum, item) => sum + item.cpu_percent, 0)
  return (
    <div className="space-y-5">
      {!docker.data.available && <ErrorBanner message={docker.data.error ?? 'Docker unavailable'} onRetry={docker.refresh} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Boxes} label="Containers" value={String(docker.data.containers.length)} detail="Total discovered" />
        <MetricCard icon={Box} label="Running" value={String(running.length)} detail={`${docker.data.containers.length - running.length} stopped`} accent="green" />
        <MetricCard icon={Cpu} label="Aggregate CPU" value={`${totalCpu.toFixed(1)}%`} detail="Running containers" accent="cyan" />
        <MetricCard icon={MemoryStick} label="Memory" value={formatBytes(totalMemory)} detail="Running containers" accent="violet" />
      </div>
      <Panel title="Container Inventory" eyebrow="Docker Engine" action={<label className="relative hidden sm:block"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter containers" className="focus-ring w-52 rounded-lg border border-line bg-canvas py-2 pl-9 pr-3 text-xs text-primary placeholder:text-slate-600" /></label>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-secondary"><tr><th className="px-5 py-3 font-medium">Container</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Uptime</th><th className="px-4 py-3 font-medium">CPU</th><th className="px-4 py-3 font-medium">Memory</th><th className="px-4 py-3 font-medium">Network I/O</th><th className="px-5 py-3 font-medium">Block I/O</th></tr></thead>
            <tbody className="divide-y divide-line/70">
              {containers.map((container) => (
                <tr key={container.id} className="transition-colors hover:bg-panel-hover">
                  <td className="px-5 py-3"><Link to={`/docker/${container.id}`} className="focus-ring rounded font-medium hover:text-cyan">{container.name}</Link><p className="mt-1 max-w-64 truncate font-mono text-[10px] text-slate-600">{container.image}</p></td>
                  <td className="px-4 py-3"><StatusPill label={container.health ?? container.status} tone={container.status === 'running' ? 'online' : 'neutral'} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{formatDuration(container.uptime_seconds)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{container.cpu_percent.toFixed(2)}%</td>
                  <td className="px-4 py-3"><p className="font-mono text-xs">{formatBytes(container.memory_usage)}</p><p className="mt-1 font-mono text-[10px] text-secondary">{container.memory_percent.toFixed(1)}% of {formatBytes(container.memory_limit)}</p></td>
                  <td className="px-4 py-3 font-mono text-[11px] text-secondary">↓ {formatBytes(container.network_rx)}<br />↑ {formatBytes(container.network_tx)}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-secondary">R {formatBytes(container.block_read)}<br />W {formatBytes(container.block_write)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!containers.length && <div className="p-12 text-center text-sm text-secondary">No containers match this filter.</div>}
        </div>
      </Panel>
    </div>
  )
}
