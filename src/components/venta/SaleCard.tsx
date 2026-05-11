import { useState } from 'react'
import { ImageOff, ArrowRight, ArrowLeft, Check, Trash2, Sparkles } from 'lucide-react'
import type { Clothe, ClothesStatus } from '@/types/database'
import { useChangeClothesStatus, useDeleteClothe, useUpdateClothe } from '@/hooks/useClothes'
import { cx, formatPrice, formatDate } from '@/lib/utils'
import DescriptionModal from './DescriptionModal'

const NEXT: Record<ClothesStatus, ClothesStatus | null> = {
  closet: 'baul',
  baul: 'en_venta',
  en_venta: 'vendida',
  vendida: 'archivada',
  archivada: null,
}

const PREV: Record<ClothesStatus, ClothesStatus | null> = {
  closet: null,
  baul: 'closet',
  en_venta: 'baul',
  vendida: 'en_venta',
  archivada: 'vendida',
}

const NEXT_LABEL: Record<ClothesStatus, string> = {
  closet: 'Mover a Baúl',
  baul: 'Publicar',
  en_venta: 'Marcar vendida',
  vendida: 'Archivar',
  archivada: '',
}

export default function SaleCard({ clothe, onEdit }: { clothe: Clothe; onEdit: () => void }) {
  const change = useChangeClothesStatus()
  const update = useUpdateClothe()
  const del = useDeleteClothe()
  const [descOpen, setDescOpen] = useState(false)

  const next = NEXT[clothe.status]
  const prev = PREV[clothe.status]

  return (
    <div className="card overflow-hidden">
      <button onClick={onEdit} className="block w-full text-left">
        <div className="aspect-square bg-gray-100">
          {clothe.image_url ? (
            <img src={clothe.image_url} alt={clothe.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-8 h-8 text-gray-300" /></div>
          )}
        </div>
        <div className="p-2.5">
          <p className="text-sm font-medium truncate">{clothe.name}</p>
          <div className="flex items-center justify-between mt-0.5 gap-1">
            <span className="text-xs text-gray-500">{formatPrice(clothe.price)}</span>
            {clothe.size && <span className="chip bg-gray-100 text-gray-700 text-[10px]">T. {clothe.size}</span>}
            {clothe.status === 'archivada' && clothe.sold_at && (
              <span className="text-xs text-gray-400">{formatDate(clothe.sold_at)}</span>
            )}
          </div>
        </div>
      </button>

      <div className="px-2.5 pb-2.5 space-y-2">
        <div className="flex gap-1">
          <button
            onClick={() => update.mutate({ id: clothe.id, on_wallapop: !clothe.on_wallapop })}
            className={cx('flex-1 chip justify-center cursor-pointer transition',
              clothe.on_wallapop ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500')}
            title="Wallapop"
          >
            W
          </button>
          <button
            onClick={() => update.mutate({ id: clothe.id, on_vinted: !clothe.on_vinted })}
            className={cx('flex-1 chip justify-center cursor-pointer transition',
              clothe.on_vinted ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500')}
            title="Vinted"
          >
            V
          </button>
        </div>

        {(clothe.status === 'baul' || clothe.status === 'en_venta') && (
          <button onClick={() => setDescOpen(true)}
            className="w-full chip bg-brand-100 text-brand-800 justify-center cursor-pointer hover:bg-brand-200 transition">
            <Sparkles className="w-3.5 h-3.5" /> Descripción
          </button>
        )}

        <div className="flex gap-1">
          {prev && (
            <button onClick={() => change.mutate({ id: clothe.id, status: prev })}
              className="btn-ghost px-2 py-1.5" title={`Volver a ${prev}`}>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {next && (
            <button onClick={() => change.mutate({ id: clothe.id, status: next })}
              className="btn-primary flex-1 text-xs py-1.5">
              {clothe.status === 'en_venta' ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              {NEXT_LABEL[clothe.status]}
            </button>
          )}
          <button onClick={() => { if (confirm('¿Eliminar?')) del.mutate(clothe) }}
            className="btn-ghost px-2 py-1.5 text-red-600">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <DescriptionModal open={descOpen} onClose={() => setDescOpen(false)} clothe={clothe} />
    </div>
  )
}
