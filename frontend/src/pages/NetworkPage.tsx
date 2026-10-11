import { ArrowDown, ArrowUp, Network } from 'lucide-react'
import { useState } from 'react'

import { MetricChart } from '../components/charts/MetricChart'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Panel } from '../components/ui/Panel'
import { StatusPill } from '../components/ui/StatusPill'
import { usePolling } from '../hooks/usePolling'
import type { HistoryPoint, NetworkInterface } from '../types'
import { formatBytes, formatRate } from '../utils/format'

export function NetworkPage() {
  const [bridges, setBridges] = useState(false)
  const network = usePolling<NetworkInterface[]>(`/network?include_bridges=${bridges}`, 2000)
  const history = usePolling<HistoryPoint[]>('/history/network?minutes=15', 2000)
  if (network.loading && !network.data) return <PageSkeleton />
  if (!network.data) return <ErrorBanner message={network.error ?? 'Network telemetry unavailable'} onRetry={network.refresh} />
  const down = network.data.reduce((sum, item) => sum + item.download_bytes_per_second, 0)
  const up = network.data.reduce((sum, item) => sum + item.upload_bytes_per_second, 0)
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={ArrowDown} label="Download" value={formatRate(down)} detail="Aggregate throughput" accent="cyan" /><MetricCard icon={ArrowUp} label="Upload" value={formatRate(up)} detail="Aggregate throughput" /><MetricCard icon={Network} label="Interfaces" value={String(network.data.length)} detail={`${network.data.filter((item) => item.is_up).length} up`} accent="green" /><MetricCard icon={Network} label="Total traffic" value={formatBytes(network.data.reduce((sum, item) => sum + item.rx_bytes + item.tx_bytes, 0))} detail="RX + TX counters" accent="violet" /></div>
      <Panel title="Network Throughput" eyebrow="15 minutes"><div className="p-4"><MetricChart data={history.data ?? []} series={[{ key: 'rx_bytes_per_second', label: 'Download', color: '#22D3EE' }, { key: 'tx_bytes_per_second', label: 'Upload', color: '#60A5FA' }]} formatValue={formatRate} height={260} /></div></Panel>
      <Panel title="Interfaces" eyebrow="Host network stack" action={<label className="flex cursor-pointer items-center gap-2 font-mono text-[10px] text-secondary"><input type="checkbox" checked={bridges} onChange={(event) => setBridges(event.target.checked)} className="accent-blue-500" /> SHOW DOCKER BRIDGES</label>}>
        <div className="grid gap-3 p-5 lg:grid-cols-2">
          {network.data.map((item) => <div key={item.interface} className="rounded-xl border border-line bg-canvas/40 p-4"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-blue-400"><Network size={16} /></div><div><p className="font-mono text-sm font-semibold">{item.interface}</p>{item.is_bridge && <p className="font-mono text-[9px] text-slate-600">DOCKER BRIDGE</p>}</div></div><StatusPill label={item.is_up ? 'Up' : 'Down'} tone={item.is_up ? 'online' : 'neutral'} /></div><div className="space-y-2 font-mono text-[11px] text-secondary"><p className="truncate"><span className="mr-3 text-slate-600">IPv4</span>{item.ipv4.join(', ') || '—'}</p><p className="truncate"><span className="mr-3 text-slate-600">IPv6</span>{item.ipv6.join(', ') || '—'}</p></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-xs"><div><p className="metric-label">RX</p><p className="mt-1 font-mono">{formatBytes(item.rx_bytes)} <span className="text-cyan">· {formatRate(item.download_bytes_per_second)}</span></p></div><div><p className="metric-label">TX</p><p className="mt-1 font-mono">{formatBytes(item.tx_bytes)} <span className="text-blue-400">· {formatRate(item.upload_bytes_per_second)}</span></p></div></div></div>)}
        </div>
      </Panel>
    </div>
  )
}
