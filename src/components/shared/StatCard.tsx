import { LucideIcon } from 'lucide-react'
import { cx } from '@/lib/utils'

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = 'brand',
}: {
  icon?: LucideIcon
  label: string
  value: React.ReactNode
  hint?: string
  accent?: 'brand' | 'emerald' | 'amber' | 'rose'
}) {
  const palettes: Record<string, string> = {
    brand:   'bg-brand-50 text-brand-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
    rose:    'bg-rose-50 text-rose-700',
  }
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        {Icon && (
          <span className={cx('w-7 h-7 rounded-lg flex items-center justify-center', palettes[accent])}>
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-ink leading-none">{value}</div>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  )
}
