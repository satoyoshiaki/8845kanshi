import {
  Activity,
  Box,
  Boxes,
  Bot,
  Gauge,
  Network,
  Server,
  Settings,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Overview', to: '/', icon: Gauge },
  { label: 'Monitoring', to: '/monitoring', icon: Activity },
  { label: 'Docker', to: '/docker', icon: Boxes },
  { label: 'Minecraft', to: '/minecraft', icon: Box },
  { label: 'Codex', to: '/codex', icon: Bot },
  { label: 'Network', to: '/network', icon: Network },
  { label: 'System', to: '/system', icon: Server },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-[#070A0F]/95 backdrop-blur-xl transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-line px-5">
          <NavLink to="/" className="focus-ring flex items-center gap-3 rounded-lg" onClick={onClose}>
            <div className="relative grid h-9 w-9 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-cyan shadow-glow">
              <Server size={18} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-[#070A0F] bg-emerald-400" />
            </div>
            <div>
              <p className="font-mono text-sm font-semibold tracking-[0.16em]">8845</p>
              <p className="font-mono text-[9px] tracking-[0.2em] text-secondary">KANSHI // NOC</p>
            </div>
          </NavLink>
          <button className="focus-ring rounded-lg p-2 text-secondary hover:bg-panel-hover hover:text-primary lg:hidden" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="px-4 pb-2 pt-7"><p className="px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-600">Server</p></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => `focus-ring group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-accent/10 text-primary' : 'text-secondary hover:bg-panel-hover hover:text-primary'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-cyan shadow-[0_0_10px_#22D3EE]" />}
                  <Icon size={17} className={isActive ? 'text-cyan' : 'text-slate-500 group-hover:text-blue-400'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-xl border border-line bg-panel p-3">
          <div className="mb-2 flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-wider text-secondary">Monitor only</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /></div>
          <p className="text-[11px] leading-relaxed text-slate-500">Read-only telemetry. No terminal or container controls.</p>
        </div>
      </aside>
    </>
  )
}
