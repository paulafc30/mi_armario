import { useEffect, useMemo, useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import {
  generateDescription,
  generateShortDescription,
  generateProductDescription,
} from '@/lib/description'
import { useCategories } from '@/hooks/useCategories'
import { cx } from '@/lib/utils'
import type { Clothe } from '@/types/database'

type SaleVariant = 'wallapop' | 'vinted'
export type DescriptionMode = 'sale' | 'product'

export default function DescriptionModal({
  open,
  onClose,
  clothe,
  mode = 'sale',
}: {
  open: boolean
  onClose: () => void
  clothe: Clothe | null
  /**
   * 'sale'    → genera texto para anuncio (Wallapop / Vinted, con dos pestañas).
   * 'product' → genera ficha catalogada del producto (neutra, sin tabs).
   */
  mode?: DescriptionMode
}) {
  const { data: categories = [] } = useCategories()
  const [variant, setVariant] = useState<SaleVariant>('wallapop')
  const [version, setVersion] = useState(0)
  const [edited, setEdited] = useState('')
  const [copied, setCopied] = useState(false)

  const generated = useMemo(() => {
    if (!clothe) return ''
    const cat = categories.find((c) => c.id === clothe.category_id)
    if (mode === 'product') return generateProductDescription(clothe, cat)
    return variant === 'wallapop'
      ? generateDescription(clothe, cat)
      : generateShortDescription(clothe, cat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clothe, categories, variant, version, mode])

  useEffect(() => { setEdited(generated) }, [generated])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(edited)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = edited
      document.body.appendChild(ta)
      ta.select(); document.execCommand('copy'); ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!clothe) return null

  const title = mode === 'product' ? 'Ficha del producto' : 'Descripción del anuncio'

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {mode === 'sale' && (
          <div className="flex gap-1 bg-surface-soft rounded-xl p-1">
            <button onClick={() => setVariant('wallapop')}
              className={cx('flex-1 py-1.5 rounded-lg text-sm font-medium transition',
                variant === 'wallapop' ? 'bg-surface shadow text-ink' : 'text-muted')}>
              Wallapop
            </button>
            <button onClick={() => setVariant('vinted')}
              className={cx('flex-1 py-1.5 rounded-lg text-sm font-medium transition',
                variant === 'vinted' ? 'bg-surface shadow text-ink' : 'text-muted')}>
              Vinted
            </button>
          </div>
        )}

        <textarea
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          className="input min-h-[200px] leading-relaxed"
        />

        <div className="flex gap-2">
          <button onClick={() => setVersion((v) => v + 1)} className="btn-secondary" title="Volver a generar">
            <RefreshCw className="w-4 h-4" /> Regenerar
          </button>
          <button onClick={handleCopy} className="btn-primary flex-1">
            {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
          </button>
        </div>

        <p className="text-xs text-muted text-center">
          {mode === 'product'
            ? 'Ficha catalográfica de la prenda. Edita lo que quieras antes de copiar.'
            : 'Edita lo que quieras antes de copiar. Pulsa "Regenerar" para probar otra redacción.'}
        </p>
      </div>
    </Modal>
  )
}
