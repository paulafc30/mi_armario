import { useMemo } from 'react'
import { Calendar as CalIcon, Sparkles, Folder, Shirt } from 'lucide-react'
import StatCard from '@/components/shared/StatCard'
import { WearWithRefs } from '@/hooks/useWears'

export default function CalendarStats({ wears, label }: { wears: WearWithRefs[]; label: string }) {
  const stats = useMemo(() => {
    const totalLooks = wears.length
    const days = new Set(wears.map((w) => w.wear_date)).size

    const clotheCounts = new Map<string, number>()
    const clotheInfo = new Map<string, { name: string; image_url: string | null }>()
    const outfitCounts = new Map<string, number>()
    const outfitInfo = new Map<string, { name: string; cover_image_url: string | null }>()

    for (const w of wears) {
      if (w.clothe_id && w.clothes) {
        clotheCounts.set(w.clothe_id, (clotheCounts.get(w.clothe_id) ?? 0) + 1)
        clotheInfo.set(w.clothe_id, { name: w.clothes.name, image_url: w.clothes.image_url })
      }
      if (w.outfit_id && w.outfits) {
        outfitCounts.set(w.outfit_id, (outfitCounts.get(w.outfit_id) ?? 0) + 1)
        outfitInfo.set(w.outfit_id, { name: w.outfits.name, cover_image_url: w.outfits.cover_image_url })
      }
    }

    const [topClotheId, topClotheCount] = [...clotheCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0]
    const [topOutfitId, topOutfitCount] = [...outfitCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0]

    return {
      totalLooks,
      days,
      topClothe: topClotheId ? { ...clotheInfo.get(topClotheId)!, count: topClotheCount } : null,
      topOutfit: topOutfitId ? { ...outfitInfo.get(topOutfitId)!, count: topOutfitCount } : null,
    }
  }, [wears])

  if (stats.totalLooks === 0) {
    return (
      <div className="card p-4 text-center">
        <p className="text-sm text-muted">
          Aún no has registrado nada en <span className="font-medium text-ink">{label}</span>.
        </p>
        <p className="text-xs text-muted mt-1">Toca un día para empezar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={Sparkles}
          label="Looks"
          value={stats.totalLooks}
          hint={`${stats.days} ${stats.days === 1 ? 'día registrado' : 'días registrados'}`}
        />
        <StatCard
          icon={CalIcon}
          label={label}
          accent="emerald"
          value={`${Math.round((stats.days / 30) * 100)}%`}
          hint="del mes registrado"
        />
      </div>

      {(stats.topClothe || stats.topOutfit) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stats.topClothe && (
            <div className="card p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {stats.topClothe.image_url ? (
                  <img src={stats.topClothe.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Shirt className="w-5 h-5" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="label text-2xs mb-0">Prenda top</span>
                <p className="text-sm font-semibold truncate text-ink">{stats.topClothe.name}</p>
                <p className="text-xs text-muted">{stats.topClothe.count} {stats.topClothe.count === 1 ? 'vez' : 'veces'}</p>
              </div>
            </div>
          )}
          {stats.topOutfit && (
            <div className="card p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {stats.topOutfit.cover_image_url ? (
                  <img src={stats.topOutfit.cover_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Folder className="w-5 h-5" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="label text-2xs mb-0">Outfit top</span>
                <p className="text-sm font-semibold truncate text-ink">{stats.topOutfit.name}</p>
                <p className="text-xs text-muted">{stats.topOutfit.count} {stats.topOutfit.count === 1 ? 'vez' : 'veces'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
