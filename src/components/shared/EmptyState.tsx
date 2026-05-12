import { LucideIcon } from 'lucide-react'

export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-14 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-brand-50 text-brand-600">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="heading-md text-ink mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-muted max-w-xs mx-auto">{subtitle}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}
