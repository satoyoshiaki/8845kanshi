import { Cpu, Database, HardDrive, MemoryStick, Server } from 'lucide-react'

import { ErrorBanner } from '../components/ui/ErrorBanner'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Panel } from '../components/ui/Panel'
import { StatusPill } from '../components/ui/StatusPill'
import { usePolling } from '../hooks/usePolling'
import type { SystemSnapshot } from '../types'
import { formatBytes, formatDate, formatDuration } from '../utils/format'

export function SystemPage() {
  const system = usePolling<SystemSnapshot>('/system?include_bridges=false', 5000)
  if (system.loading && !system.data) return <PageSkeleton />
  if (!system.data) return <ErrorBanner message={system.error ?? 'System information unavailable'} onRetry={system.refresh} />
  const { info, cpu, memory, disks } = system.data
  const facts = [
    [Server, 'Hostname', info.hostname],
    [Server, 'Operating system', info.os],
    [Server, 'Kernel', info.kernel],
    [Cpu, 'Architecture', info.architecture],
    [Cpu, 'Processor', info.cpu_model],
    [Cpu, 'CPU topology', `${cpu.physical_cores} physical / ${cpu.logical_cpus} logical`],
    [MemoryStick, 'Installed RAM', formatBytes(info.ram_total)],
    [Database, 'Docker Engine', info.docker_version ?? 'Unavailable'],
    [HardDrive, 'Boot time', formatDate(info.boot_time)],
    [HardDrive, 'Uptime', formatDuration(info.uptime_seconds)],
  ] as const
  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden"><div className="relative p-7"><div className="absolute right-0 top-0 h-44 w-80 bg-cyan/5 blur-3xl" /><div className="relative flex items-center justify-between gap-5"><div><p className="eyebrow mb-2">System Identity</p><h2 className="text-3xl font-semibold tracking-tight">{info.hostname}</h2><p className="mt-2 text-sm text-secondary">{info.os} · {info.architecture}</p></div><StatusPill label="Online" tone="online" pulse /></div></div></Panel>
      <Panel title="Host Information" eyebrow="Read-only inventory"><div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-3">{facts.map(([Icon, label, value]) => <div key={label} className="bg-panel p-5"><Icon size={16} className="mb-4 text-blue-400" /><dt className="metric-label mb-2">{label}</dt><dd className="break-words font-mono text-xs leading-relaxed text-primary">{value}</dd></div>)}</div></Panel>
      <Panel title="Mounted Storage" eyebrow="Usage summary"><div className="grid gap-4 p-5 lg:grid-cols-2">{disks.map((disk) => <div key={disk.mountpoint} className="rounded-xl border border-line bg-canvas/40 p-4"><div className="mb-3 flex justify-between"><span className="font-mono text-sm">{disk.mountpoint}</span><span className="font-mono text-sm">{disk.usage_percent.toFixed(1)}%</span></div><div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-accent to-cyan" style={{ width: `${disk.usage_percent}%` }} /></div><p className="font-mono text-[11px] text-secondary">{formatBytes(disk.used)} used · {formatBytes(disk.free)} free · {formatBytes(disk.total)} total</p></div>)}</div></Panel>
    </div>
  )
}
