import { useMemo, useState } from 'react'
import { Plus, ExternalLink, Bookmark, ShoppingBag, ImageOff, Lightbulb } from 'lucide-react'
import { useInspirations } from '@/hooks/useInspirations'
import { useSearchStore } from '@/store/search'
import InspirationForm from '@/components/inspiracion/InspirationForm'
import EmptyState from '@/components/shared/EmptyState'
import type { Inspiration, InspirationKind } from '@/types/database'

export default function Inspiracion() {
  const { data: items = [], isLoading } = useInspirations()
  const { query } = useSearchStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Inspiration | null>(null)
  const [defaultKind, setDefaultKind] = useState<InspirationKind>('pinterest')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) =>
      (i.title ?? '').toLowerCase().includes(q) || i.url.toLowerCase().includes(q)
    )
  }, [items, query])

  const pinterest = filtered.filter((i) => i.kind === 'pinterest')
  const stores = filtered.filter((i) => i.kind === 'store')

  function openAdd(kind: InspirationKind) {
    setEditing(null)
    setDefaultKind(kind)
    setFormOpen(true)
  }

  return (
    <div className="px-4 pb-4 space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="heading-xl">Ideas</h1>
          <p className="text-sm text-muted mt-0.5">
            Tus boards de Pinterest y atajos a las novedades de tus tiendas favoritas.
          </p>
        </div>
        <button onClick={() => { setEditing(null); setDefaultKind('pinterest'); setFormOpen(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted py-12">Cargando…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Aún no tienes ideas guardadas"
          subtitle="Guarda boards de Pinterest, atajos a Zara, Stradivarius o donde te inspires. Todo en un sitio."
          action={
            <button onClick={() => openAdd('pinterest')} className="btn-primary">
              <Plus className="w-4 h-4" /> Guardar la primera
            </button>
          }
        />
      ) : (
        <div className="space-y-7">
          <Section
            title="Pinterest"
            icon={Bookmark}
            items={pinterest}
            emptyText="Aún no has guardado boards. Pega la URL de un board público y tendrás un atajo directo."
            onAdd={() => openAdd('pinterest')}
            onEdit={(item) => { setEditing(item); setFormOpen(true) }}
          />
          <Section
            title="Tiendas favoritas"
            icon={ShoppingBag}
            items={stores}
            emptyText="Guarda enlaces directos a las secciones de novedades de las tiendas que más te gusten."
            onAdd={() => openAdd('store')}
            onEdit={(item) => { setEditing(item); setFormOpen(true) }}
          />
        </div>
      )}

      <InspirationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={editing}
        defaultKind={defaultKind}
      />
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  items,
  emptyText,
  onAdd,
  onEdit,
}: {
  title: string
  icon: typeof Bookmark
  items: Inspiration[]
  emptyText: string
  onAdd: () => void
  onEdit: (item: Inspiration) => void
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="heading-md flex items-center gap-2">
          <Icon className="w-4 h-4 text-brand-700" /> {title}
        </h2>
        <button onClick={onAdd} className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Añadir
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted bg-surface-soft rounded-xl p-4 text-center">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((it) => (
            <div key={it.id} className="card overflow-hidden">
              <button onClick={() => onEdit(it)} className="block w-full text-left">
                <div className="aspect-square bg-surface-soft">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.title ?? ''} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-8 h-8 text-muted/50" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-medium truncate">{it.title ?? 'Sin título'}</p>
                  <p className="text-xs text-muted truncate">{hostnameOf(it.url)}</p>
                </div>
              </button>
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 py-2 border-t border-line-soft"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
