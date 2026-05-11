import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '@/lib/utils'
import { MonthDay, WEEKDAY_LABELS, monthLabel } from '@/lib/calendar'
import { WearWithRefs } from '@/hooks/useWears'

export default function CalendarGrid({
  year,
  month,
  days,
  wearsByDate,
  onSelectDay,
  onPrev,
  onNext,
  onToday,
}: {
  year: number
  month: number
  days: MonthDay[]
  wearsByDate: Map<string, WearWithRefs[]>
  onSelectDay: (iso: string) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={onPrev} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-semibold min-w-[10ch] text-center">{monthLabel(year, month)}</h2>
          <button onClick={onNext} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <button onClick={onToday} className="text-sm text-brand-700 hover:underline">Hoy</button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="text-center text-[11px] font-medium text-gray-500 py-1">{w}</div>
        ))}

        {days.map((d) => {
          const wears = wearsByDate.get(d.iso) ?? []
          const previews = wears
            .map((w) => w.clothes?.image_url ?? w.outfits?.cover_image_url)
            .filter(Boolean) as string[]
          return (
            <button
              key={d.iso}
              onClick={() => onSelectDay(d.iso)}
              className={cx(
                'aspect-square rounded-lg text-left p-1 flex flex-col transition relative',
                d.inMonth ? 'bg-white border border-gray-200' : 'bg-gray-50 border border-transparent text-gray-400',
                d.isToday && 'ring-2 ring-brand-600',
                wears.length > 0 && 'hover:shadow-sm'
              )}
            >
              <span className={cx('text-[11px] font-medium leading-none', d.isToday && 'text-brand-700')}>
                {d.date.getDate()}
              </span>
              {previews.length > 0 && (
                <div className="flex-1 flex items-end gap-0.5 mt-1">
                  {previews.slice(0, 2).map((src, i) => (
                    <img key={i} src={src} alt=""
                      className="w-full h-4 sm:h-5 object-cover rounded-sm" />
                  ))}
                  {previews.length > 2 && (
                    <span className="text-[9px] text-gray-500 font-medium">+{previews.length - 2}</span>
                  )}
                </div>
              )}
              {wears.length > 0 && previews.length === 0 && (
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-brand-600" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
