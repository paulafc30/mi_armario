import Modal from '@/components/shared/Modal'
import { useChangeClothesStatus } from '@/hooks/useClothes'
import { colorHexByName } from '@/components/shared/ColorPicker'
import type { Clothe } from '@/types/database'
import { ArrowRight, Pencil, Tag } from 'lucide-react'

export default function ClotheDetail({
  open,
  onClose,
  clothe,
  onEdit,
}: {
  open: boolean
  onClose: () => void
  clothe: Clothe | null
  onEdit: () => void
}) {
  const changeStatus = useChangeClothesStatus()
  if (!clothe) return null

  async function moveToVenta() {
    if (!clothe) return
    await changeStatus.mutateAsync({ id: clothe.id, status: 'baul' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={clothe.name}>
      <div className="space-y-4">
        {clothe.image_url && (
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <img src={clothe.image_url} alt={clothe.name} className="w-full h-full object-cover" />
          </div>
        )}
        {(clothe.brand || clothe.size || clothe.color) && (
          <div className="flex flex-wrap gap-1.5">
            {clothe.brand && <span className="chip bg-gray-100 text-gray-700">{clothe.brand}</span>}
            {clothe.size && <span className="chip bg-gray-100 text-gray-700">Talla {clothe.size}</span>}
            {clothe.color && (
              <span className="chip bg-gray-100 text-gray-700">
                <span
                  className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                  style={{
                    background:
                      colorHexByName(clothe.color) === 'multicolor'
                        ? 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)'
                        : colorHexByName(clothe.color) ?? '#999',
                  }}
                />
                {clothe.color}
              </span>
            )}
          </div>
        )}
        {clothe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clothe.tags.map((t) => (
              <span key={t} className="chip bg-gray-100 text-gray-700"><Tag className="w-3 h-3" />{t}</span>
            ))}
          </div>
        )}
        {clothe.notes && <p className="text-sm text-gray-600 whitespace-pre-line">{clothe.notes}</p>}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button onClick={onEdit} className="btn-secondary"><Pencil className="w-4 h-4" /> Editar</button>
          <button onClick={moveToVenta} className="btn-primary">
            Mover a Venta <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  )
}
