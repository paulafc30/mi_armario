import { useEffect, useState } from 'react'
import Modal from '@/components/shared/Modal'
import ImageCarousel from '@/components/shared/ImageCarousel'
import { useChangeClothesStatus } from '@/hooks/useClothes'
import { useProfile } from '@/hooks/useProfile'
import { colorHexByName } from '@/components/shared/ColorPicker'
import { useConfirm } from '@/components/shared/ConfirmModal'
import { supabase } from '@/lib/supabase'
import { checkFit, FIT_META } from '@/lib/sizeFit'
import { cx } from '@/lib/utils'
import type { Clothe } from '@/types/database'
import { Pencil, Tag, Ruler } from 'lucide-react'

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
  const confirm = useConfirm()
  const { data: profile } = useProfile()
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])

  const fitVerdict = clothe ? checkFit(clothe.size, {
    bust_cm: profile?.bust_cm ?? null,
    waist_cm: profile?.waist_cm ?? null,
    hips_cm: profile?.hips_cm ?? null,
  }) : 'unknown'
  const showFit = fitVerdict !== 'unknown'

  useEffect(() => {
    if (!open || !clothe) return
    setGalleryUrls(clothe.image_url ? [clothe.image_url] : [])
    supabase
      .from('clothe_images')
      .select('url, position, created_at')
      .eq('clothe_id', clothe.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const urls = (data ?? []).map((r: { url: string }) => r.url)
        if (urls.length > 0) setGalleryUrls(urls)
      })
  }, [open, clothe])

  if (!clothe) return null

  async function moveToVenta() {
    if (!clothe) return
    const ok = await confirm({
      title: 'Mover a la sección de Venta',
      message: `Vas a mover "${clothe.name}" a Venta. Se quedará en estado Baúl hasta que la publiques.`,
      confirmText: 'Mover',
    })
    if (!ok) return
    await changeStatus.mutateAsync({ id: clothe.id, status: 'baul' })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={clothe.name}>
      <div className="space-y-4">
        <ImageCarousel images={galleryUrls} />

        {(() => {
          const clotheColors = clothe.colors ?? (clothe.color ? [clothe.color] : [])
          const hasAny = clothe.brand || clothe.size || clotheColors.length > 0
          if (!hasAny) return null
          return (
            <div className="flex flex-wrap gap-1.5">
              {clothe.brand && <span className="chip bg-surface-soft text-ink/80">{clothe.brand}</span>}
              {clothe.size && <span className="chip bg-surface-soft text-ink/80">Talla {clothe.size}</span>}
              {clotheColors.map((c) => (
                <span key={c} className="chip bg-surface-soft text-ink/80">
                  <span
                    className="w-3 h-3 rounded-full border border-line inline-block"
                    style={{
                      background:
                        colorHexByName(c) === 'multicolor'
                          ? 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)'
                          : colorHexByName(c) ?? '#999',
                    }}
                  />
                  {c}
                </span>
              ))}
            </div>
          )
        })()}

        {clothe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clothe.tags.map((t) => (
              <span key={t} className="chip bg-surface-soft text-ink/80"><Tag className="w-3 h-3" />{t}</span>
            ))}
          </div>
        )}

        {showFit && (
          <div className={cx('rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm', FIT_META[fitVerdict].className)}>
            <Ruler className="w-4 h-4 shrink-0" />
            <span><span className="font-semibold">Según tus medidas:</span> {FIT_META[fitVerdict].label}</span>
          </div>
        )}

        {clothe.notes && <p className="text-sm text-muted whitespace-pre-line">{clothe.notes}</p>}

        {/* Acción primaria: editar la prenda */}
        <button onClick={onEdit} className="btn-primary w-full">
          <Pencil className="w-4 h-4" /> Editar
        </button>

        {/* Acción secundaria, deliberadamente discreta */}
        <div className="pt-3 mt-1 border-t border-line-soft">
          <button onClick={moveToVenta}
            className="w-full py-2 text-xs text-muted hover:text-ink transition">
            Mover a la sección de Venta
          </button>
        </div>
      </div>
    </Modal>
  )
}
