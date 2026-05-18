import { Sparkles, ChevronRight } from 'lucide-react'
import {
  BODY_TYPE_LABELS,
  BODY_TYPE_DESCRIPTIONS,
  BODY_TYPE_TIPS,
  BodyType,
} from '@/lib/bodyType'

export default function BodyTypeCard({
  bodyType,
  onEdit,
}: {
  bodyType: BodyType | null
  onEdit: () => void
}) {
  if (!bodyType) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="w-full card p-4 text-left flex items-center gap-3 hover:bg-surface-soft transition"
      >
        <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand-700 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">Hacer test de silueta</p>
          <p className="text-xs text-muted">Sube tres medidas y te decimos qué cortes te favorecen.</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted shrink-0" />
      </button>
    )
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center shrink-0 shadow-lift">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-2xs font-bold uppercase tracking-wide text-brand-700">Tu silueta</span>
          <p className="heading-md mt-0.5">{BODY_TYPE_LABELS[bodyType]}</p>
        </div>
      </div>

      <p className="text-sm text-muted leading-relaxed">{BODY_TYPE_DESCRIPTIONS[bodyType]}</p>

      <div className="pt-1">
        <p className="text-2xs font-bold uppercase tracking-wide text-muted mb-2">Te favorece</p>
        <ul className="space-y-1.5">
          {BODY_TYPE_TIPS[bodyType].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
              <span className="text-ink/90">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="btn-secondary w-full text-sm mt-1"
      >
        Editar medidas
      </button>
    </div>
  )
}
