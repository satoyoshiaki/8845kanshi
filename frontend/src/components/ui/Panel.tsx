import type { ReactNode } from 'react'

interface PanelProps {
  children: ReactNode
  className?: string
  title?: string
  eyebrow?: string
  action?: ReactNode
}

export function Panel({ children, className = '', title, eyebrow, action }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      {(title || eyebrow || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            {title && <h2 className="text-base font-semibold tracking-tight text-primary">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
