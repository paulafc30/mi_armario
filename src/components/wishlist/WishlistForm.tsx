import { useEffect, useState } from 'react'
import Modal from '@/components/shared/Modal'
import { useCreateWishlistItem, useUpdateWishlistItem, useDeleteWishlistItem } from '@/hooks/useWishlist'
import { useAuth } from '@/hooks/useAuth'
import { useConfirm } from '@/components/shared/ConfirmModal'
import { fetchUrlPreview } from '@/lib/utils'
import { Trash2, Sparkles } from 'lucide-react'
import type { WishlistItem } from '@/types/database'

export interface WishlistPrefill {
  url?: string
  name?: string
  notes?: string
  /** Si true, intenta cargar la vista previa automáticamente al abrir. */
  autoFetchPreview?: boolean
}

export default function WishlistForm({
  open,
  onClose,
  item,
  prefill,
}: {
  open: boolean
  onClose: () => void
  item?: WishlistItem | null
  prefill?: WishlistPrefill
}) {
  const { user } = useAuth()
  const create = useCreateWishlistItem()
  const update = useUpdateWishlistItem()
  const del = useDeleteWishlistItem()
  const confirm = useConfirm()

  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (item) {
      setUrl(item.url)
      setName(item.name ?? '')
      setPrice(item.price ? String(item.price) : '')
      setImageUrl(item.image_url ?? '')
      setNotes(item.notes ?? '')
    } else {
      setUrl(prefill?.url ?? '')
      setName(prefill?.name ?? '')
      setPrice('')
      setImageUrl('')
      setNotes(prefill?.notes ?? '')
    }
    setError(null)
  }, [open, item, prefill])

  // Auto-fetch del preview cuando llega prefill con URL y autoFetchPreview activo
  useEffect(() => {
    if (!open || item) return
    if (prefill?.autoFetchPreview && prefill.url) {
      doFetchPreview(prefill.url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item, prefill?.url, prefill?.autoFetchPreview])

  async function doFetchPreview(targetUrl: string) {
    setLoadingPreview(true); setError(null)
    const preview = await fetchUrlPreview(targetUrl)
    setLoadingPreview(false)
    if (!preview) { setError('No se pudo obtener la previsualización.'); return }
    if (preview.title) setName((n) => n || preview.title!)
    if (preview.image) setImageUrl((u) => u || preview.image!)
  }

  async function handleFetchPreview() {
    if (!url) return
    await doFetchPreview(url)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true); setError(null)
    try {
      const payload = {
        user_id: user.id,
        url,
        name: name || null,
        price: price ? Number(price) : null,
        image_url: imageUrl || null,
        notes: notes || null,
      }
      if (item) await update.mutateAsync({ id: item.id, ...payload })
      else await create.mutateAsync(payload)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Editar deseo' : 'Añadir a deseos'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Enlace</label>
          <div className="flex gap-2">
            <input className="input flex-1" type="url" required value={url}
              onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            <button type="button" onClick={handleFetchPreview} disabled={loadingPreview || !url}
              className="btn-secondary" title="Obtener vista previa">
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {imageUrl && (
          <div className="aspect-square rounded-2xl overflow-hidden bg-surface-soft max-h-64">
            <img src={imageUrl} alt="" className="w-full h-full object-contain" />
          </div>
        )}

        <div>
          <label className="label">Nombre</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="label">Precio</label>
          <input className="input" type="number" step="0.01" value={price}
            onChange={(e) => setPrice(e.target.value)} />
        </div>

        <div>
          <label className="label">Imagen (URL)</label>
          <input className="input" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>

        <div>
          <label className="label">Notas</label>
          <textarea className="input min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          {item && (
            <button type="button" onClick={async () => {
              const ok = await confirm({
                title: 'Eliminar de deseos',
                message: `Vas a borrar "${item.name ?? item.url}" de tu lista de deseos.`,
                confirmText: 'Eliminar',
                destructive: true,
              })
              if (ok) { await del.mutateAsync(item.id); onClose() }
            }} className="btn-danger"><Trash2 className="w-4 h-4" /></button>
          )}
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
