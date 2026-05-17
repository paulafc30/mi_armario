import { Clock, AlertTriangle } from 'lucide-react'
import { cx } from '@/lib/utils'

/** Umbral a partir del cual la prenda lleva demasiado tiempo publicada. */
const STALE_THRESHOLD_DAYS = 30

/**
 * Pequeña chip que indica cuánto tiempo lleva publicada una prenda en venta.
 * - Verde-muted si pocos días
 * - Ámbar con icono de aviso si lleva >= 30 días sin moverse
 */
export default function DaysListedBadge({ listedAt }: { listedAt: string }) {
  const ms = Date.now() - new Date(listedAt).getTime()
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
  const stale = days >= STALE_THRESHOLD_DAYS

  let label: string
  if (days === 0) label = 'Publicada hoy'
  else if (days === 1) label = 'Publicada ayer'
  else label = `Publicada hace ${days} días`

  return (
    <span
      className={cx(
        'chip text-[10px]',
        stale
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
          : 'bg-surface-soft text-muted'
      )}
      title={stale ? 'Lleva mucho tiempo publicada — quizá baja el precio o retírala' : undefined}
    >
      {stale ? <AlertTriangle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
      {label}
    </span>
  )
}
