import { useEffect, useState } from 'react'
import Modal from '@/components/shared/Modal'
import ImagePicker, { PickerValue } from '@/components/shared/ImagePicker'
import { useCategories } from '@/hooks/useCategories'
import { useCreateClothe, useDeleteClothe, useUpdateClothe } from '@/hooks/useClothes'
import { uploadImage, deleteImage } from '@/lib/images'
import { useAuth } from '@/hooks/useAuth'
import type { Clothe, ClothesStatus } from '@/types/database'
import { Trash2 } from 'lucide-react'

export default function ClotheForm({
  open,
  onClose,
  clothe,
  defaultStatus = 'closet',
}: {
  open: boolean
  onClose: () => void
  clothe?: Clothe | null
  defaultStatus?: ClothesStatus
}) {
  const { user } = useAuth()
  const { data: categories = [] } = useCategories()
  const createMut = useCreateClothe()
  const updateMut = useUpdateClothe()
  const deleteMut = useDeleteClothe()

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [price, setPrice] = useState<string>('')
  const [picker, setPicker] = useState<PickerValue>({ mode: 'file', file: null, preview: null })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (clothe) {
      setName(clothe.name)
      setCategoryId(clothe.category_id ?? '')
      setTags(clothe.tags.join(', '))
      setNotes(clothe.notes ?? '')
      setPrice(clothe.price ? String(clothe.price) : '')
      setPicker(
        clothe.image_path
          ? { mode: 'file', file: null, preview: clothe.image_url }
          : { mode: 'url', url: clothe.image_url ?? '' }
      )
    } else {
      setName(''); setCategoryId(''); setTags(''); setNotes(''); setPrice('')
      setPicker({ mode: 'file', file: null, preview: null })
    }
    setError(null)
  }, [open, clothe])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true); setError(null)
    try {
      let image_url: string | null = clothe?.image_url ?? null
      let image_path: string | null = clothe?.image_path ?? null

      if (picker.mode === 'file' && picker.file) {
        if (clothe?.image_path) await deleteImage(clothe.image_path)
        const up = await uploadImage(picker.file, user.id)
        image_url = up.url
        image_path = up.path
      } else if (picker.mode === 'url') {
        if (clothe?.image_path && picker.url !== clothe.image_url) {
          await deleteImage(clothe.image_path)
          image_path = null
        }
        image_url = picker.url || null
      }

      const payload = {
        name: name.trim(),
        category_id: categoryId || null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: notes.trim() || null,
        price: price ? Number(price) : null,
        image_url,
        image_path,
      }

      if (clothe) {
        await updateMut.mutateAsync({ id: clothe.id, ...payload })
      } else {
        await createMut.mutateAsync({ user_id: user.id, status: defaultStatus, ...payload })
      }
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!clothe) return
    if (!confirm('¿Eliminar esta prenda?')) return
    await deleteMut.mutateAsync(clothe)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={clothe ? 'Editar prenda' : 'Nueva prenda'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImagePicker value={picker} onChange={setPicker} initialPreview={clothe?.image_url} />

        <div>
          <label className="label">Nombre</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Camisa blanca" />
        </div>

        <div>
          <label className="label">Categoría</label>
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— Sin categoría —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Etiquetas (separadas por coma)</label>
          <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="verano, casual" />
        </div>

        <div>
          <label className="label">Precio (opcional)</label>
          <input className="input" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="20.00" />
        </div>

        <div>
          <label className="label">Notas</label>
          <textarea className="input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2 pt-2">
          {clothe && (
            <button type="button" onClick={handleDelete} className="btn-danger">
              <Trash2 className="w-4 h-4" />
            </button>
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
