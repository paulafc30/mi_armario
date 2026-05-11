import { useEffect, useState } from 'react'
import Modal from '@/components/shared/Modal'
import MultiImagePicker, { PickerImage } from '@/components/shared/MultiImagePicker'
import ColorPicker from '@/components/shared/ColorPicker'
import { useCategories } from '@/hooks/useCategories'
import { useCreateClothe, useDeleteClothe, useUpdateClothe } from '@/hooks/useClothes'
import { uploadImage, deleteImage } from '@/lib/images'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Clothe, ClothesStatus, ClotheImage } from '@/types/database'
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
  const [brand, setBrand] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState<string | null>(null)
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [price, setPrice] = useState<string>('')
  const [images, setImages] = useState<PickerImage[]>([])
  const [originalImages, setOriginalImages] = useState<ClotheImage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (clothe) {
      setName(clothe.name)
      setCategoryId(clothe.category_id ?? '')
      setBrand(clothe.brand ?? '')
      setSize(clothe.size ?? '')
      setColor(clothe.color ?? null)
      setTags(clothe.tags.join(', '))
      setNotes(clothe.notes ?? '')
      setPrice(clothe.price ? String(clothe.price) : '')
      // Cargar imágenes existentes desde clothe_images, ordenadas por position
      supabase
        .from('clothe_images')
        .select('*')
        .eq('clothe_id', clothe.id)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          const list = (data ?? []) as ClotheImage[]
          setOriginalImages(list)
          setImages(list.map((it) => ({ kind: 'existing', id: it.id, url: it.url, path: it.path })))
        })
    } else {
      setName(''); setCategoryId(''); setBrand(''); setSize(''); setColor(null)
      setTags(''); setNotes(''); setPrice('')
      setImages([]); setOriginalImages([])
    }
    setError(null)
  }, [open, clothe])

  async function syncImages(clotheId: string, userId: string) {
    // 1. Borrar imágenes que estaban antes y ya no están
    const stillThere = new Set(
      images.filter((i) => i.kind === 'existing').map((i) => i.kind === 'existing' ? i.id : '')
    )
    const toDelete = originalImages.filter((o) => !stillThere.has(o.id))
    for (const orig of toDelete) {
      if (orig.path) await deleteImage(orig.path)
      await supabase.from('clothe_images').delete().eq('id', orig.id)
    }

    // 2. Recorrer en orden e insertar/actualizar
    for (let i = 0; i < images.length; i++) {
      const item = images[i]
      if (item.kind === 'existing') {
        const orig = originalImages.find((o) => o.id === item.id)
        if (orig && orig.position !== i) {
          await supabase.from('clothe_images').update({ position: i }).eq('id', item.id)
        }
      } else if (item.kind === 'new-file') {
        const up = await uploadImage(item.file, userId)
        await supabase.from('clothe_images').insert({
          clothe_id: clotheId, user_id: userId, url: up.url, path: up.path, position: i,
        })
      } else if (item.kind === 'new-url') {
        await supabase.from('clothe_images').insert({
          clothe_id: clotheId, user_id: userId, url: item.url, path: null, position: i,
        })
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true); setError(null)
    try {
      const payload = {
        name: name.trim(),
        category_id: categoryId || null,
        brand: brand.trim() || null,
        size: size.trim() || null,
        color,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: notes.trim() || null,
        price: price ? Number(price) : null,
      }

      let clotheId: string
      if (clothe) {
        await updateMut.mutateAsync({ id: clothe.id, ...payload })
        clotheId = clothe.id
      } else {
        const created = await createMut.mutateAsync({
          user_id: user.id, status: defaultStatus, ...payload,
        })
        clotheId = created.id
      }

      await syncImages(clotheId, user.id)
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
        <MultiImagePicker images={images} onChange={setImages} />

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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Marca</label>
            <input className="input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Zara" />
          </div>
          <div>
            <label className="label">Talla</label>
            <input className="input" value={size} onChange={(e) => setSize(e.target.value)} placeholder="M / 38" />
          </div>
        </div>

        <div>
          <label className="label">Color</label>
          <ColorPicker value={color} onChange={setColor} />
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
