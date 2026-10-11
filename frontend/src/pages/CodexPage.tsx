import { Bot, Clock3, Cpu, FolderGit2, GitBranch, MemoryStick } from 'lucide-react'

import { MetricChart } from '../components/charts/MetricChart'
import { ErrorBanner } from '../components/ui/ErrorBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Panel } from '../components/ui/Panel'
import { StatusPill } from '../components/ui/StatusPill'
import { usePolling } from '../hooks/usePolling'
import { useI18n } from '../i18n/I18nProvider'
import type { CodexStatus, HistoryPoint } from '../types'
import { formatBytes, formatDuration, formatRelative } from '../utils/format'

export function CodexPage() {
  const { locale, t } = useI18n()
  const codex = usePolling<CodexStatus>('/codex', 2500)
  const history = usePolling<HistoryPoint[]>('/history/codex?minutes=15', 2500)
  if (codex.loading && !codex.data) return <PageSkeleton />
  if (!codex.data) return <ErrorBanner message={codex.error ?? t('Codex telemetry unavailable')} onRetry={codex.refresh} />
  const data = codex.data
  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden"><div className="relative p-7"><div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" /><div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center"><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-cyan"><Bot size={25} /></div><div><div className="mb-2 flex items-center gap-3"><h2 className="text-3xl font-semibold">CODEX</h2><StatusPill label={t(data.active ? 'Active' : 'Idle')} tone={data.active ? 'online' : 'neutral'} pulse={data.active} /></div><p className="font-mono text-xs text-secondary">{t('OS-observable process telemetry only · no prompts or content')}</p></div></div><div className="font-mono text-xs text-secondary">PID <span className="ml-2 text-primary">{data.pid ?? '—'}</span> · {data.process_count} {t('processes')}</div></div></div></Panel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Cpu} label="CPU" value={`${data.cpu_percent.toFixed(2)}%`} detail={t('Codex process aggregate')} />
        <MetricCard icon={MemoryStick} label={t('Memory')} value={formatBytes(data.memory_bytes)} detail={t('Resident memory')} accent="violet" />
        <MetricCard icon={Clock3} label={t('Uptime')} value={formatDuration(data.uptime_seconds, locale)} detail={`${t('Last activity')} ${formatRelative(data.last_activity, locale)}`} accent="cyan" />
        <MetricCard icon={GitBranch} label={t('Branch')} value={data.git_branch ?? t('Unavailable')} detail={data.git_repository?.split('/').pop() ?? t('No Git repository')} accent="green" />
      </div>
      <Panel title={t('Codex Resource History')} eyebrow={t('15 minutes')}><div className="grid gap-4 p-4 lg:grid-cols-2"><MetricChart data={history.data ?? []} series={[{ key: 'cpu_percent', label: 'CPU', color: '#218BFF' }]} domain={[0, 'auto']} height={230} /><MetricChart data={history.data ?? []} series={[{ key: 'memory_bytes', label: t('Memory'), color: '#8B5CF6' }]} formatValue={formatBytes} height={230} /></div></Panel>
      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Panel title={t('Workspace')} eyebrow={t('Sanitized process context')}><dl className="divide-y divide-line">{[[FolderGit2, t('Working directory'), data.working_directory ?? t('Unavailable')], [GitBranch, t('Git repository'), data.git_repository ?? t('Unavailable')], [GitBranch, t('Current branch'), data.git_branch ?? t('Unavailable')], [Clock3, t('Last activity'), formatRelative(data.last_activity, locale)]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof FolderGit2; return <div key={String(label)} className="flex gap-3 p-4"><ItemIcon size={16} className="mt-0.5 shrink-0 text-blue-400" /><div className="min-w-0"><dt className="metric-label mb-1.5">{String(label)}</dt><dd className="break-all font-mono text-xs">{String(value)}</dd></div></div> })}</dl></Panel>
        <Panel title={t('Recent Activity')} eyebrow={t('File metadata only')}><div className="divide-y divide-line">{data.recent_files.length ? data.recent_files.map((file) => <div key={file.path} className="flex items-center justify-between gap-4 px-5 py-3.5"><div className="min-w-0"><p className="truncate font-mono text-xs text-primary">{file.path}</p><p className="mt-1 text-[10px] text-slate-600">{t('Content is never read or returned')}</p></div><span className="shrink-0 font-mono text-[10px] text-cyan">{formatRelative(file.modified_at, locale)}</span></div>) : <div className="grid min-h-64 place-items-center text-sm text-secondary">{t('No recent source file metadata available.')}</div>}</div></Panel>
      </div>
    </div>
  )
}
