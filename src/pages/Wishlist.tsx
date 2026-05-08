import { useMemo, useState } from 'react'
import { Plus, ExternalLink, ImageOff } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { useSearchStore } from '@/store/search'
import WishlistForm from '@/components/wishlist/WishlistForm'
import { formatPrice } from '@/lib/utils'
import type { WishlistItem } from '@/types/database'

export default function Wishlist() {
  const { data: items = [], isLoading } = useWishlist()
  const { query } = useSearchStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<WishlistItem | null>(null)

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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lista de Deseos</h1>
          <p className="text-sm text-gray-500">{items.length} items</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 py-12">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No hay nada en tu lista de deseos.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((it) => (
            <div key={it.id} className="card overflow-hidden">
              <button onClick={() => { setEditing(it); setFormOpen(true) }} className="block w-full text-left">
                <div className="aspect-square bg-gray-100">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.name ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-8 h-8 text-gray-300" /></div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-medium truncate">{it.name ?? 'Sin nombre'}</p>
                  <p className="text-xs text-gray-500">{formatPrice(it.price)}</p>
                </div>
              </button>
              <a href={it.url} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-brand-700 hover:bg-brand-50 py-2 border-t border-gray-100">
                <ExternalLink className="w-3.5 h-3.5" /> Ver
              </a>
            </div>
          ))}
        </div>
      )}

      <WishlistForm open={formOpen} onClose={() => setFormOpen(false)} item={editing} />
    </div>
  )
}
