import { ChevronRight, LucideIcon } from 'lucide-react'
import { cx } from '@/lib/utils'

export default function SettingsRow({
  icon: Icon,
  iconAccent = 'brand',
  label,
  value,
  onClick,
  destructive = false,
  chevron = true,
  loading = false,
}: {
  icon: LucideIcon
  iconAccent?: 'brand' | 'rose' | 'emerald' | 'amber' | 'muted'
  label: string
  value?: string | React.ReactNode
  onClick?: () => void
  destructive?: boolean
  chevron?: boolean
  loading?: boolean
}) {
  const accents: Record<string, string> = {
    brand:   'bg-brand-soft text-brand-700 dark:text-brand-300',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
    muted:   'bg-surface-soft text-muted',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cx(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition',
        onClick ? 'hover:bg-surface-soft' : 'cursor-default',
        destructive && 'hover:bg-red-50 dark:hover:bg-red-500/10'
      )}
    >
      <div className={cx(
        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
        destructive ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' : accents[iconAccent]
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cx('text-sm font-semibold', destructive ? 'text-red-600 dark:text-red-300' : 'text-ink')}>
          {label}
        </p>
      </div>
      {value !== undefined && (
        <span className="text-sm text-muted truncate max-w-[55%] text-right">{value}</span>
      )}
      {chevron && onClick && !destructive && !loading && (
        <ChevronRight className="w-4 h-4 text-muted/70 shrink-0" />
      )}
      {loading && <span className="text-xs text-muted">…</span>}
    </button>
  )
}

export function SettingsSection({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      {title && (
        <h2 className="text-2xs uppercase tracking-wider font-bold text-muted px-1">{title}</h2>
      )}
      <div className="card overflow-hidden">
        <div className="divide-y divide-line-soft">{children}</div>
      </div>
      {description && <p className="text-xs text-muted px-1 mt-1">{description}</p>}
    </section>
  )
}
