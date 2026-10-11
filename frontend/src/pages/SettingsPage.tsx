import { Check, Clock3, Eye, Languages, LockKeyhole, ShieldCheck } from 'lucide-react'

import { Panel } from '../components/ui/Panel'
import { useI18n, type Locale } from '../i18n/I18nProvider'

export function SettingsPage() {
  const { locale, setLocale, t } = useI18n()
  const refreshRates = [
    [t('System / Network'), `2 ${t('seconds')}`],
    ['Docker', `3 ${t('seconds')}`],
    ['Minecraft', `5 ${t('seconds')}`],
    ['Codex', `2.5 ${t('seconds')}`],
  ]
  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden"><div className="relative p-7"><div className="absolute right-0 top-0 h-40 w-72 bg-emerald-500/5 blur-3xl" /><div className="relative flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"><ShieldCheck size={22} /></div><div><p className="eyebrow mb-1">{t('Security posture')}</p><h2 className="text-2xl font-semibold">{t('Monitor-only by design')}</h2><p className="mt-1 text-sm text-secondary">{t('This interface does not expose control actions, shells, or file content.')}</p></div></div></div></Panel>
      <Panel title={t('Language')} eyebrow={t('Display language')}>
        <div className="p-5">
          <div className="grid max-w-lg gap-3 sm:grid-cols-2">
            <LanguageButton locale="ja" current={locale} label={t('Japanese')} onSelect={setLocale} />
            <LanguageButton locale="en" current={locale} label={t('English')} onSelect={setLocale} />
          </div>
          <p className="mt-3 text-xs text-secondary">{t('Language preference is saved in this browser.')}</p>
        </div>
      </Panel>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={t('Refresh Intervals')} eyebrow={t('Configured by environment')}><div className="divide-y divide-line">{refreshRates.map(([label, value]) => <div key={label} className="flex items-center justify-between px-5 py-4"><span className="flex items-center gap-3 text-sm"><Clock3 size={15} className="text-blue-400" />{label}</span><span className="font-mono text-xs text-cyan">{value}</span></div>)}</div></Panel>
        <Panel title={t('Data Boundaries')} eyebrow={t('What the API can observe')}><div className="divide-y divide-line"><Boundary icon={Eye} title={t('Metrics only')} text={t('Host counters, container metadata, Minecraft status, and process resource usage.')} /><Boundary icon={LockKeyhole} title={t('Secrets excluded')} text={t('Environment variables, command lines, tokens, cookies, keys, and file contents are never returned.')} /><Boundary icon={ShieldCheck} title={t('No mutations')} text={t('Docker write APIs are disabled by the socket proxy. No exec, stop, restart, or delete endpoints exist.')} /></div></Panel>
      </div>
      <Panel title={t('Configuration')} eyebrow={t('Environment variables')}><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-secondary"><tr><th className="px-5 py-3">{t('Variable')}</th><th className="px-5 py-3">{t('Purpose')}</th></tr></thead><tbody className="divide-y divide-line">{[['MINECRAFT_HOST', t('Minecraft Java server address')], ['MINECRAFT_PORT', t('Minecraft Java server port')], ['MINECRAFT_CONTAINER_NAME', t('Container name used for resource telemetry')], ['CODEX_WORKSPACE_ROOT', t('Only workspace tree eligible for metadata scanning')], ['MONITORED_MOUNTS', t('Comma-separated host mount points')], ['FRONTEND_PORT / BACKEND_PORT', t('Published dashboard ports')]].map(([key, description]) => <tr key={key}><td className="px-5 py-3 font-mono text-xs text-cyan">{key}</td><td className="px-5 py-3 text-xs text-secondary">{description}</td></tr>)}</tbody></table></div></Panel>
    </div>
  )
}

function LanguageButton({ locale, current, label, onSelect }: { locale: Locale; current: Locale; label: string; onSelect: (locale: Locale) => void }) {
  const selected = locale === current
  return <button type="button" onClick={() => onSelect(locale)} className={`focus-ring flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${selected ? 'border-accent/50 bg-accent/10 text-primary' : 'border-line bg-canvas/40 text-secondary hover:bg-panel-hover hover:text-primary'}`}><span className="flex items-center gap-3"><Languages size={17} className={selected ? 'text-cyan' : 'text-slate-500'} /><span className="text-sm font-medium">{label}</span></span>{selected && <Check size={16} className="text-cyan" />}</button>
}

function Boundary({ icon: Icon, title, text }: { icon: typeof Eye; title: string; text: string }) {
  return <div className="flex gap-3 p-5"><Icon size={17} className="mt-0.5 shrink-0 text-emerald-400" /><div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-relaxed text-secondary">{text}</p></div></div>
}
