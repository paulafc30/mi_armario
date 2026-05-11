import { useEffect, useMemo, useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import { generateDescription, generateShortDescription } from '@/lib/description'
import { useCategories } from '@/hooks/useCategories'
import { cx } from '@/lib/utils'
import type { Clothe } from '@/types/database'

type Variant = 'wallapop' | 'vinted'

export default function DescriptionModal({
  open,
  onClose,
  clothe,
}: {
  open: boolean
  onClose: () => void
  clothe: Clothe | null
}) {
  const { data: categories = [] } = useCategories()
  const [variant, setVariant] = useState<Variant>('wallapop')
  const [version, setVersion] = useState(0)
  const [edited, setEdited] = useState('')
  const [copied, setCopied] = useState(false)

  const generated = useMemo(() => {
    if (!clothe) return ''
    const cat = categories.find((c) => c.id === clothe.category_id)
    return variant === 'wallapop'
      ? generateDescription(clothe, cat)
      : generateShortDescription(clothe, cat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clothe, categories, variant, version])

  // Cuando se regenera (cambia generated), reflejarlo en el textarea editable
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

  return (
    <Modal open={open} onClose={onClose} title="Descripción del anuncio">
      <div className="space-y-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setVariant('wallapop')}
            className={cx('flex-1 py-1.5 rounded-lg text-sm font-medium transition',
              variant === 'wallapop' ? 'bg-white shadow text-gray-900' : 'text-gray-600')}>
            Wallapop
          </button>
          <button onClick={() => setVariant('vinted')}
            className={cx('flex-1 py-1.5 rounded-lg text-sm font-medium transition',
              variant === 'vinted' ? 'bg-white shadow text-gray-900' : 'text-gray-600')}>
            Vinted
          </button>
        </div>

        <textarea
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          className="input min-h-[220px] leading-relaxed"
        />

        <div className="flex gap-2">
          <button onClick={() => setVersion((v) => v + 1)} className="btn-secondary" title="Volver a generar">
            <RefreshCw className="w-4 h-4" /> Regenerar
          </button>
          <button onClick={handleCopy} className="btn-primary flex-1">
            {copied ? <><Check className="w-4 h-4" /> Copiado</> : <><Copy className="w-4 h-4" /> Copiar</>}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Edita lo que quieras antes de copiar. Se genera a partir del nombre, marca, talla, color y notas.
        </p>
      </div>
    </Modal>
  )
}
