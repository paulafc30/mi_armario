import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useClothes } from '@/hooks/useClothes'
import { useCategories } from '@/hooks/useCategories'
import { useSearchStore } from '@/store/search'
import SaleCard from '@/components/venta/SaleCard'
import ClotheForm from '@/components/armario/ClotheForm'
import type { Clothe, ClothesStatus } from '@/types/database'
import { cx, STATUS_LABELS } from '@/lib/utils'

const TABS: { status: ClothesStatus; label: string }[] = [
  { status: 'baul', label: 'Baúl' },
  { status: 'en_venta', label: 'En Venta' },
  { status: 'vendida', label: 'Vendida' },
  { status: 'archivada', label: 'Archivados' },
]

export default function Venta() {
  const [tab, setTab] = useState<ClothesStatus>('baul')
  const { data: clothes = [], isLoading } = useClothes(['baul', 'en_venta', 'vendida', 'archivada'])
  const { data: categories = [] } = useCategories()
  const { query } = useSearchStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Clothe | null>(null)

  const counts = useMemo(() => {
    const c: Record<ClothesStatus, number> = { closet: 0, baul: 0, en_venta: 0, vendida: 0, archivada: 0 }
    clothes.forEach((cl) => { c[cl.status]++ })
    return c
  }, [clothes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clothes.filter((c) => {
      if (c.status !== tab) return false
      if (!q) return true
      const cat = categories.find((cc) => cc.id === c.category_id)
      return c.name.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    })
  }, [clothes, tab, query, categories])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ropa a la Venta</h1>
          <p className="text-sm text-gray-500">{STATUS_LABELS[tab]} · {counts[tab]} prendas</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-4 px-4">
        {TABS.map((t) => (
          <button key={t.status} onClick={() => setTab(t.status)}
            className={cx('px-3 py-2 rounded-xl text-sm whitespace-nowrap transition',
              tab === t.status ? 'bg-brand-700 text-white' : 'bg-white border border-gray-200 text-gray-700')}>
            {t.label} <span className="opacity-60">{counts[t.status]}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 py-12">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Nada en {STATUS_LABELS[tab]}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <SaleCard key={c.id} clothe={c} onEdit={() => { setEditing(c); setFormOpen(true) }} />
          ))}
        </div>
      )}

      <ClotheForm open={formOpen} onClose={() => setFormOpen(false)} clothe={editing} defaultStatus={tab} />
    </div>
  )
}
