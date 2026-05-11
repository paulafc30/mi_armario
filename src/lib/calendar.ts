/** Devuelve YYYY-MM-DD a partir de un Date local. */
export function formatISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Construye los 42 días (6 semanas) que componen la vista mensual, empezando en lunes. */
export interface MonthDay {
  date: Date
  iso: string
  inMonth: boolean
  isToday: boolean
}

export function getMonthGrid(year: number, month: number): MonthDay[] {
  const firstOfMonth = new Date(year, month, 1)
  // getDay(): 0=Domingo … 6=Sábado. Queremos lunes como índice 0.
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7
  const start = new Date(year, month, 1 - firstWeekday)
  const todayISO = formatISODate(new Date())

  const days: MonthDay[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    const iso = formatISODate(d)
    days.push({
      date: d,
      iso,
      inMonth: d.getMonth() === month,
      isToday: iso === todayISO,
    })
  }
  return days
}

export function monthLabel(year: number, month: number): string {
  const label = new Date(year, month, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function longDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const text = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
