import { useEffect, useState } from 'react'
import Modal from '@/components/shared/Modal'
import { useClothes } from '@/hooks/useClothes'
import { useCreateOutfit, useDeleteOutfit, useUpdateOutfit, OutfitWithItems } from '@/hooks/useOutfits'
import { useAuth } from '@/hooks/useAuth'
import { Trash2, Check } from 'lucide-react'
import { cx } from '@/lib/utils'

export default function OutfitForm({ open, onClose, outfit }: { open: boolean; onClose: () => void; outfit?: OutfitWithItems | null }) {
  const { user } = useAuth()
  const { data: closet = [] } = useClothes(['closet'])
  const create = useCreateOutfit()
  const update = useUpdateOutfit()
  const del = useDeleteOutfit()

  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(outfit?.name ?? '')
    setSelected(new Set(outfit?.clothe_ids ?? []))
  }, [open, outfit])

  function toggle(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      if (outfit) {
        await update.mutateAsync({ id: outfit.id, name, clothe_ids: [...selected] })
      } else {
        await create.mutateAsync({ user_id: user.id, name, clothe_ids: [...selected] })
      }
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!outfit) return
    if (!confirm('¿Eliminar outfit?')) return
    await del.mutateAsync(outfit.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={outfit ? 'Editar outfit' : 'Nuevo outfit'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nombre</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Look domingo" />
        </div>

        <div>
          <label className="label">Prendas</label>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {closet.map((c) => {
              const isSelected = selected.has(c.id)
              return (
                <button key={c.id} type="button" onClick={() => toggle(c.id)}
                  className={cx('relative aspect-square rounded-xl overflow-hidden border-2 transition',
                    isSelected ? 'border-brand-600' : 'border-transparent')}
                >
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full bg-gray-100" />}
                  {isSelected && (
                    <div className="absolute inset-0 bg-brand-700/30 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white drop-shadow" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {closet.length === 0 && <p className="text-sm text-gray-500">No hay prendas en tu armario aún.</p>}
        </div>

        <div className="flex gap-2 pt-2">
          {outfit && <button type="button" onClick={handleDelete} className="btn-danger"><Trash2 className="w-4 h-4" /></button>}
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}
