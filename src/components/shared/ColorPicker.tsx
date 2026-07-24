import { useState } from 'react'
import { Check, ChevronDown, Pipette, Plus, X } from 'lucide-react'
import { cx } from '@/lib/utils'
import { hslToHex, nearestPaletteName } from '@/lib/colorFamily'
import { CLOTHING_COLORS, colorHexByName } from '@/lib/colorPalette'
import ImageEyedropper from '@/components/shared/ImageEyedropper'

// Re-exportados para no romper a los consumidores existentes que importan
// la paleta desde este componente.
export { CLOTHING_COLORS, colorHexByName }

export interface ColorSelection {
  /** Familia a la que pertenece (se usa para agrupar en búsqueda/filtros). */
  name: string
  /** Tono exacto elegido (hex). Puede ser más específico que el de la familia. */
  hex: string
}

const HUE_GRADIENT =
  'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'

/**
 * Selector multi-color. Combina swatches rápidos (paleta fija de 14
 * familias) con un slider de tono (hue + luminosidad) para elegir un color
 * más específico. Sea cual sea el origen, cada selección se guarda con su
 * `hex` exacto y su `name` de familia (el hex más cercano de la paleta se
 * usa para clasificarla), así el filtro de búsqueda sigue agrupando por
 * familia sin cambios aunque el tono guardado sea preciso.
 */
export default function ColorPicker({
  value,
  onChange,
  max = 3,
  imageUrl,
}: {
  value: ColorSelection[]
  onChange: (v: ColorSelection[]) => void
  max?: number
  /** Foto de la prenda, si hay alguna — habilita el cuentagotas sobre la imagen. */
  imageUrl?: string | null
}) {
  const atMax = value.length >= max
  const [panel, setPanel] = useState<'none' | 'hue' | 'eyedropper'>('none')
  const [hue, setHue] = useState(200)
  const [lightness, setLightness] = useState(55)

  function addColor(sel: ColorSelection) {
    if (atMax) return
    if (value.some((v) => v.name === sel.name)) return // ya hay una de esa familia
    onChange([...value, sel])
  }

  function removeColor(name: string) {
    onChange(value.filter((v) => v.name !== name))
  }

  function toggleQuick(c: { name: string; hex: string }) {
    if (value.some((v) => v.name === c.name)) {
      removeColor(c.name)
    } else {
      addColor({ name: c.name, hex: c.hex })
    }
  }

  const fineHex = hslToHex(hue, 70, lightness)
  const fineFamily = nearestPaletteName(fineHex) ?? 'Multicolor'
  const fineAlreadyUsed = value.some((v) => v.name === fineFamily)

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((c) => (
            <span key={c.name} className="flex items-center gap-1.5 pl-1.5 pr-1 py-1 rounded-full border border-line bg-surface text-xs">
              <span
                className="w-3.5 h-3.5 rounded-full border border-line shrink-0"
                style={{
                  background: c.hex === 'multicolor'
                    ? 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)'
                    : c.hex,
                }}
              />
              {c.name}
              <button type="button" onClick={() => removeColor(c.name)} className="p-0.5 rounded hover:bg-surface-soft" aria-label={`Quitar ${c.name}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {CLOTHING_COLORS.map((c) => {
          const selected = value.some((v) => v.name === c.name)
          const disabled = atMax && !selected
          const isMulti = c.hex === 'multicolor'
          return (
            <button
              key={c.name}
              type="button"
              title={c.name + (disabled ? ' — quita uno para añadir otro' : '')}
              onClick={() => toggleQuick(c)}
              disabled={disabled}
              className={cx(
                'aspect-square rounded-xl transition relative',
                selected
                  ? 'ring-2 ring-offset-2 ring-brand-700'
                  : disabled
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:scale-105',
                c.border ? 'border border-line' : ''
              )}
              style={{
                background: isMulti
                  ? 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)'
                  : c.hex,
              }}
            >
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check
                    className={cx(
                      'w-4 h-4 drop-shadow',
                      c.hex === '#ffffff' || c.hex === '#e8d5b7' || c.hex === '#fbbf24'
                        ? 'text-ink'
                        : 'text-white'
                    )}
                  />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPanel((p) => (p === 'hue' ? 'none' : 'hue'))}
          className="flex items-center gap-1 text-xs font-medium text-brand-700"
        >
          <ChevronDown className={cx('w-3.5 h-3.5 transition-transform', panel === 'hue' && 'rotate-180')} />
          Afinar tono
        </button>
        {imageUrl && (
          <button
            type="button"
            onClick={() => setPanel((p) => (p === 'eyedropper' ? 'none' : 'eyedropper'))}
            className="flex items-center gap-1 text-xs font-medium text-brand-700"
          >
            <Pipette className="w-3.5 h-3.5" />
            Sacar de la foto
          </button>
        )}
      </div>

      {panel === 'eyedropper' && imageUrl && (
        <div className="p-3 rounded-xl bg-surface-soft border border-line-soft">
          <ImageEyedropper
            imageUrl={imageUrl}
            onPick={(hex) => {
              const family = nearestPaletteName(hex) ?? 'Multicolor'
              if (!value.some((v) => v.name === family)) addColor({ name: family, hex })
              setPanel('none')
            }}
          />
        </div>
      )}

      {panel === 'hue' && (
        <div className="space-y-2.5 p-3 rounded-xl bg-surface-soft border border-line-soft">
          <div>
            <div
              className="h-3 rounded-full border border-line"
              style={{ background: HUE_GRADIENT }}
            />
            <input
              type="range"
              min={0}
              max={360}
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-full -mt-1"
              aria-label="Tono"
            />
          </div>
          <div>
            <input
              type="range"
              min={15}
              max={90}
              value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: fineHex }}
              aria-label="Luminosidad"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full border border-line shrink-0" style={{ background: fineHex }} />
            <div className="flex-1 text-xs text-muted leading-tight">
              <span className="font-mono">{fineHex}</span> · se guardará como <strong className="text-ink">{fineFamily}</strong>
            </div>
            <button
              type="button"
              onClick={() => addColor({ name: fineFamily, hex: fineHex })}
              disabled={atMax || fineAlreadyUsed}
              className="btn-secondary text-xs py-1 px-2 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Añadir
            </button>
          </div>
          {fineAlreadyUsed && (
            <p className="text-[11px] text-muted">Ya tienes un color de la familia "{fineFamily}" — quítalo primero para añadir este tono.</p>
          )}
        </div>
      )}

      <p className="text-xs text-muted text-center">
        {value.length === 0
          ? `Hasta ${max} colores`
          : value.length >= max
            ? `${value.length} / ${max} — máximo alcanzado`
            : `${value.length} / ${max} seleccionados`}
      </p>
    </div>
  )
}
