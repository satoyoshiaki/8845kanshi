import { Activity, Cpu, Database, MemoryStick, Thermometer } from 'lucide-react'

import { MetricChart } from '../components/charts/MetricChart'
import { MetricCard } from '../components/ui/MetricCard'
import { PageSkeleton } from '../components/ui/Skeleton'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { Panel } from '../components/ui/Panel'
import { usePolling } from '../hooks/usePolling'
import type { HistoryPoint, SystemSnapshot } from '../types'
import { formatBytes, formatRate } from '../utils/format'

export function MonitoringPage() {
  const system = usePolling<SystemSnapshot>('/system?include_bridges=false', 2000)
  const history = usePolling<HistoryPoint[]>('/history/host?minutes=15', 2000)
  if (system.loading && !system.data) return <PageSkeleton />
  if (!system.data) return <ErrorBanner message={system.error ?? 'System telemetry unavailable'} onRetry={system.refresh} />
  const data = system.data
  return (
    <div className="space-y-5">
      {system.error && <ErrorBanner message={system.error} onRetry={system.refresh} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Cpu} label="CPU usage" value={`${data.cpu.usage_percent.toFixed(1)}%`} detail={`${data.cpu.physical_cores} cores / ${data.cpu.logical_cpus} threads`} />
        <MetricCard icon={MemoryStick} label="Memory" value={`${data.memory.usage_percent.toFixed(1)}%`} detail={`${formatBytes(data.memory.used)} / ${formatBytes(data.memory.total)}`} accent="violet" />
        <MetricCard icon={Thermometer} label="Temperature" value={data.cpu.temperature_celsius == null ? 'Unavailable' : `${data.cpu.temperature_celsius.toFixed(1)}°C`} detail="CPU package sensor" accent="green" />
        <MetricCard icon={Activity} label="Load average" value={data.cpu.load_average['1m'].toFixed(2)} detail={`${data.cpu.load_average['5m']} / ${data.cpu.load_average['15m']} (5m / 15m)`} accent="cyan" />
      </div>
      <Panel title="CPU & Memory History" eyebrow="Host telemetry // 15 minutes"><div className="p-4"><MetricChart data={history.data ?? []} series={[{ key: 'cpu_percent', label: 'CPU', color: '#218BFF' }, { key: 'memory_percent', label: 'Memory', color: '#8B5CF6' }]} domain={[0, 100]} height={270} /></div></Panel>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Logical CPU Cores" eyebrow={`${data.cpu.logical_cpus} processors`}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 p-5 sm:grid-cols-4">
            {data.cpu.per_core_percent.map((value, index) => (
              <div key={index}>
                <div className="mb-2 flex justify-between font-mono text-[10px]"><span className="text-secondary">CPU {String(index).padStart(2, '0')}</span><span>{value.toFixed(0)}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan transition-all" style={{ width: `${Math.min(100, value)}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Memory & Swap" eyebrow="Allocation">
          <div className="space-y-5 p-5">
            {[['Memory', data.memory.used, data.memory.total, data.memory.usage_percent], ['Swap', data.memory.swap_used, data.memory.swap_total, data.memory.swap_percent]].map(([label, used, total, percent]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-end justify-between"><div><p className="metric-label">{label}</p><p className="mt-1 font-mono text-sm">{formatBytes(Number(used))} / {formatBytes(Number(total))}</p></div><span className="font-mono text-xl">{Number(percent).toFixed(1)}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-400" style={{ width: `${Math.min(100, Number(percent))}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Storage" eyebrow="Mounted volumes">
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {data.disks.map((disk) => (
            <div key={disk.mountpoint} className="rounded-xl border border-line bg-canvas/40 p-4">
              <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 font-mono text-sm"><Database size={15} className="text-emerald-400" />{disk.mountpoint}</span><span className="font-mono text-sm">{disk.usage_percent.toFixed(1)}%</span></div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan" style={{ width: `${disk.usage_percent}%` }} /></div>
              <div className="grid grid-cols-2 gap-3 text-xs text-secondary"><span>Used <b className="font-mono text-primary">{formatBytes(disk.used)}</b></span><span>Free <b className="font-mono text-primary">{formatBytes(disk.free)}</b></span><span>Read <b className="font-mono text-primary">{formatRate(disk.read_bytes_per_second)}</b></span><span>Write <b className="font-mono text-primary">{formatRate(disk.write_bytes_per_second)}</b></span></div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
