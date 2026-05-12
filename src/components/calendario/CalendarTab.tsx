import { useMemo, useState } from 'react'
import CalendarGrid from './CalendarGrid'
import CalendarStats from './CalendarStats'
import DayDetailModal from './DayDetailModal'
import { useWearsInRange } from '@/hooks/useWears'
import { formatISODate, getMonthGrid, monthLabel } from '@/lib/calendar'

export default function CalendarTab() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed

  const days = useMemo(() => getMonthGrid(year, month), [year, month])
  const startISO = days[0].iso
  const endISO = days[days.length - 1].iso
  const { data: wears = [] } = useWearsInRange(startISO, endISO)

  const wearsByDate = useMemo(() => {
    const map = new Map<string, typeof wears>()
    for (const w of wears) {
      const list = map.get(w.wear_date) ?? []
      list.push(w)
      map.set(w.wear_date, list)
    }
    return map
  }, [wears])

  const [selected, setSelected] = useState<string | null>(null)

  function go(delta: number) {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 0) { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0; newYear++ }
    setMonth(newMonth)
    setYear(newYear)
  }

  function goToday() {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth(t.getMonth())
    setSelected(formatISODate(t))
  }

  // Filtrar wears solo del mes activo (no de la padding) para las stats
  const monthOnly = useMemo(
    () => wears.filter((w) => {
      const m = Number(w.wear_date.split('-')[1])
      const y = Number(w.wear_date.split('-')[0])
      return m === month + 1 && y === year
    }),
    [wears, month, year]
  )

  return (
    <div className="space-y-4">
      <CalendarStats wears={monthOnly} label={monthLabel(year, month)} />
      <CalendarGrid
        year={year}
        month={month}
        days={days}
        wearsByDate={wearsByDate}
        onSelectDay={setSelected}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onToday={goToday}
      />
      <DayDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        iso={selected}
        wears={selected ? wearsByDate.get(selected) ?? [] : []}
      />
    </div>
  )
}
