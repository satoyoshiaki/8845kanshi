import { AlertTriangle, RefreshCw } from 'lucide-react'

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <div className="flex items-center gap-2"><AlertTriangle size={16} />{message}</div>
      {onRetry && (
        <button className="focus-ring rounded-lg p-1.5 hover:bg-red-500/10" onClick={onRetry} aria-label="Retry">
          <RefreshCw size={15} />
        </button>
      )}
    </div>
  )
}
