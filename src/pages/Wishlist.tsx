import { useEffect, useMemo, useState } from 'react'
import { Plus, ExternalLink, ImageOff, Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { useSearchStore } from '@/store/search'
import WishlistForm, { WishlistPrefill } from '@/components/wishlist/WishlistForm'
import EmptyState from '@/components/shared/EmptyState'
import { formatPrice } from '@/lib/utils'
import { consumeSharedPayload } from '@/lib/sharedItem'
import type { WishlistItem } from '@/types/database'

export default function Wishlist() {
  const { data: items = [], isLoading } = useWishlist()
  const { query } = useSearchStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<WishlistItem | null>(null)
  const [prefill, setPrefill] = useState<WishlistPrefill | undefined>(undefined)

  // Consumir share apuntado a wishlist y abrir el formulario con auto-preview
  useEffect(() => {
    const shared = consumeSharedPayload('wishlist')
    if (shared) {
      setPrefill({
        url: shared.url || undefined,
        name: shared.title || undefined,
        autoFetchPreview: !!shared.url,
      })
      setEditing(null)
      setFormOpen(true)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) =>
      (i.name ?? '').toLowerCase().includes(q) ||
      (i.notes ?? '').toLowerCase().includes(q) ||
      i.url.toLowerCase().includes(q)
    )
  }, [items, query])

  return (
    <div className="px-4 pb-4 space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="heading-xl">Deseos</h1>
          <p className="text-sm text-muted mt-0.5">{items.length} {items.length === 1 ? 'cosa que te gustaría' : 'cosas que te gustarían'}</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted py-12">Cargando…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Tu lista de deseos está vacía"
          subtitle="Pega un enlace de Zara, Vinted o donde quieras y guárdalo para más tarde."
          action={
            <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-primary">
              <Plus className="w-4 h-4" /> Añadir
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((it) => (
            <div key={it.id} className="card overflow-hidden">
              <button onClick={() => { setEditing(it); setFormOpen(true) }} className="block w-full text-left">
                <div className="aspect-square bg-surface-soft">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.name ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-8 h-8 text-muted/50" /></div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-medium truncate">{it.name ?? 'Sin nombre'}</p>
                  <p className="text-xs text-muted">{formatPrice(it.price)}</p>
                </div>
              </button>
              <a href={it.url} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-brand-700 hover:bg-brand-50 py-2 border-t border-line-soft">
                <ExternalLink className="w-3.5 h-3.5" /> Ver
              </a>
            </div>
          ))}
        </div>
      )}

      <WishlistForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setPrefill(undefined) }}
        item={editing}
        prefill={editing ? undefined : prefill}
      />
    </div>
  )
}
