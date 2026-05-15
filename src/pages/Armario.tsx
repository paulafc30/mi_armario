import { useEffect, useMemo, useState } from 'react'
import { consumeSharedPayload } from '@/lib/sharedItem'
import type { ClothePrefill } from '@/components/armario/ClotheForm'
import { Plus, Settings2, Folder, Calendar as CalendarIcon, Shirt } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { useClothes } from '@/hooks/useClothes'
import { useCategories } from '@/hooks/useCategories'
import { useOutfits, OutfitWithItems } from '@/hooks/useOutfits'
import { useSearchStore } from '@/store/search'
import ClotheCard from '@/components/armario/ClotheCard'
import ClotheForm from '@/components/armario/ClotheForm'
import ClotheDetail from '@/components/armario/ClotheDetail'
import CategoryManager from '@/components/armario/CategoryManager'
import OutfitForm from '@/components/armario/OutfitForm'
import CalendarTab from '@/components/calendario/CalendarTab'
import type { Clothe } from '@/types/database'
import { cx } from '@/lib/utils'

type Tab = 'prendas' | 'outfits' | 'calendario'

export default function Armario() {
  const [tab, setTab] = useState<Tab>('prendas')
  const { data: clothes = [], isLoading } = useClothes(['closet'])
  const { data: categories = [] } = useCategories()
  const { data: outfits = [] } = useOutfits()
  const { query } = useSearchStore()

  const [filterCat, setFilterCat] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Clothe | null>(null)
  const [prefill, setPrefill] = useState<ClothePrefill | undefined>(undefined)

  // Si la usuaria viene desde "Compartir → Armario", abrir el formulario
  // prerellenado con lo que llegue del share.
  useEffect(() => {
    const shared = consumeSharedPayload('armario')
    if (shared) {
      setPrefill({
        name: shared.title || undefined,
        url: shared.url || undefined,
        notes: shared.url ? `Compartido desde: ${shared.url}` : undefined,
      })
      setEditing(null)
      setFormOpen(true)
    }
  }, [])
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Clothe | null>(null)
  const [catModal, setCatModal] = useState(false)
  const [outfitFormOpen, setOutfitFormOpen] = useState(false)
  const [outfitEditing, setOutfitEditing] = useState<OutfitWithItems | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clothes.filter((c) => {
      if (filterCat && c.category_id !== filterCat) return false
      if (!q) return true
      const cat = categories.find((cc) => cc.id === c.category_id)
      return (
        c.name.toLowerCase().includes(q) ||
        (c.brand?.toLowerCase().includes(q) ?? false) ||
        (c.color?.toLowerCase().includes(q) ?? false) ||
        (c.size?.toLowerCase().includes(q) ?? false) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        (cat?.name.toLowerCase().includes(q) ?? false)
      )
    })
  }, [clothes, query, filterCat, categories])

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])

  return (
    <div className="px-4 pb-4 space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="heading-xl">Mi Armario</h1>
          <p className="text-sm text-muted mt-0.5">{clothes.length} prendas · {outfits.length} outfits</p>
        </div>
        <div className="flex gap-2">
          {tab !== 'calendario' && (
            <button onClick={() => setCatModal(true)} className="btn-secondary" title="Categorías">
              <Settings2 className="w-4 h-4" />
            </button>
          )}
          {tab === 'prendas' && (
            <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-primary">
              <Plus className="w-4 h-4" /> Añadir
            </button>
          )}
          {tab === 'outfits' && (
            <button onClick={() => { setOutfitEditing(null); setOutfitFormOpen(true) }} className="btn-primary">
              <Plus className="w-4 h-4" /> Outfit
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-line">
        {(['prendas', 'outfits', 'calendario'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cx('px-3 py-2 text-sm font-medium border-b-2 -mb-[1px] flex items-center gap-1.5',
              tab === t ? 'border-brand-700 text-brand-700' : 'border-transparent text-muted')}>
            {t === 'calendario' && <CalendarIcon className="w-3.5 h-3.5" />}
            {t === 'prendas' ? 'Prendas' : t === 'outfits' ? 'Outfits' : 'Calendario'}
          </button>
        ))}
      </div>

      {tab === 'prendas' && (
        <>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            <button onClick={() => setFilterCat(null)}
              className={cx('chip whitespace-nowrap font-medium border transition',
                filterCat === null
                  ? 'bg-brand-gradient text-white border-transparent shadow-soft'
                  : 'bg-surface border-line text-muted hover:text-ink')}>
              Todas
            </button>
            {categories.map((c) => {
              const isActive = filterCat === c.id
              return (
                <button key={c.id} onClick={() => setFilterCat(c.id === filterCat ? null : c.id)}
                  className={cx('chip whitespace-nowrap font-medium gap-1.5 transition',
                    isActive
                      ? 'bg-surface text-ink border-2 shadow-soft'
                      : 'bg-surface border border-line text-muted hover:text-ink')}
                  style={isActive ? { borderColor: c.color } : undefined}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  {c.name}
                </button>
              )
            })}
          </div>

          {isLoading ? (
            <p className="text-center text-muted py-12">Cargando…</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Shirt}
              title="Tu armario está vacío"
              subtitle="Añade la primera prenda para empezar a organizar tu ropa."
              action={
                <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-primary">
                  <Plus className="w-4 h-4" /> Añadir prenda
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((c) => (
                <ClotheCard key={c.id} clothe={c} category={c.category_id ? catMap[c.category_id] : undefined}
                  onClick={() => { setSelected(c); setDetailOpen(true) }} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'calendario' && <CalendarTab />}

      {tab === 'outfits' && (
        outfits.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No tienes outfits aún"
            subtitle="Combina prendas de tu armario en looks para tenerlos a mano."
            action={
              <button onClick={() => { setOutfitEditing(null); setOutfitFormOpen(true) }} className="btn-primary">
                <Plus className="w-4 h-4" /> Crear outfit
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {outfits.map((o) => {
              const previews = o.clothe_ids.slice(0, 4)
                .map((id) => clothes.find((c) => c.id === id)?.image_url).filter(Boolean) as string[]
              return (
                <button key={o.id} onClick={() => { setOutfitEditing(o); setOutfitFormOpen(true) }} className="card overflow-hidden text-left">
                  <div className="aspect-square grid grid-cols-2 gap-px bg-surface-soft">
                    {previews.length > 0 ? previews.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-full h-full object-cover" />
                    )) : <div className="col-span-2 row-span-2 flex items-center justify-center text-muted/50">Sin prendas</div>}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium truncate">{o.name}</p>
                    <p className="text-xs text-muted">{o.clothe_ids.length} prendas</p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      )}

      <ClotheForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setPrefill(undefined) }}
        clothe={editing}
        prefill={editing ? undefined : prefill}
      />
      <ClotheDetail open={detailOpen} onClose={() => setDetailOpen(false)} clothe={selected}
        onEdit={() => { setEditing(selected); setDetailOpen(false); setFormOpen(true) }} />
      <CategoryManager open={catModal} onClose={() => setCatModal(false)} />
      <OutfitForm open={outfitFormOpen} onClose={() => setOutfitFormOpen(false)} outfit={outfitEditing} />
    </div>
  )
}
