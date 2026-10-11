import { Clock3, Eye, LockKeyhole, ShieldCheck } from 'lucide-react'

import { Panel } from '../components/ui/Panel'

const refreshRates = [
  ['System / Network', '2 seconds'],
  ['Docker', '3 seconds'],
  ['Minecraft', '5 seconds'],
  ['Codex', '2.5 seconds'],
]

export function SettingsPage() {
  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden"><div className="relative p-7"><div className="absolute right-0 top-0 h-40 w-72 bg-emerald-500/5 blur-3xl" /><div className="relative flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><ShieldCheck size={22} /></div><div><p className="eyebrow mb-1">Security posture</p><h2 className="text-2xl font-semibold">Monitor-only by design</h2><p className="mt-1 text-sm text-secondary">This interface does not expose control actions, shells, or file content.</p></div></div></div></Panel>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Refresh Intervals" eyebrow="Configured by environment"><div className="divide-y divide-line">{refreshRates.map(([label, value]) => <div key={label} className="flex items-center justify-between px-5 py-4"><span className="flex items-center gap-3 text-sm"><Clock3 size={15} className="text-blue-400" />{label}</span><span className="font-mono text-xs text-cyan">{value}</span></div>)}</div></Panel>
        <Panel title="Data Boundaries" eyebrow="What the API can observe"><div className="divide-y divide-line"><Boundary icon={Eye} title="Metrics only" text="Host counters, container metadata, Minecraft status, and process resource usage." /><Boundary icon={LockKeyhole} title="Secrets excluded" text="Environment variables, command lines, tokens, cookies, keys, and file contents are never returned." /><Boundary icon={ShieldCheck} title="No mutations" text="Docker write APIs are disabled by the socket proxy. No exec, stop, restart, or delete endpoints exist." /></div></Panel>
      </div>
      <Panel title="Configuration" eyebrow="Environment variables"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-secondary"><tr><th className="px-5 py-3">Variable</th><th className="px-5 py-3">Purpose</th></tr></thead><tbody className="divide-y divide-line">{[['MINECRAFT_HOST', 'Minecraft Java server address'], ['MINECRAFT_PORT', 'Minecraft Java server port'], ['MINECRAFT_CONTAINER_NAME', 'Container name used for resource telemetry'], ['CODEX_WORKSPACE_ROOT', 'Only workspace tree eligible for metadata scanning'], ['MONITORED_MOUNTS', 'Comma-separated host mount points'], ['FRONTEND_PORT / BACKEND_PORT', 'Published dashboard ports']].map(([key, description]) => <tr key={key}><td className="px-5 py-3 font-mono text-xs text-cyan">{key}</td><td className="px-5 py-3 text-xs text-secondary">{description}</td></tr>)}</tbody></table></div></Panel>
    </div>
  )
}

function Boundary({ icon: Icon, title, text }: { icon: typeof Eye; title: string; text: string }) {
  return <div className="flex gap-3 p-5"><Icon size={17} className="mt-0.5 shrink-0 text-emerald-400" /><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-relaxed text-secondary">{text}</p></div></div>
}
