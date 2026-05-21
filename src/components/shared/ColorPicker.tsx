import { Check } from 'lucide-react'
import { cx } from '@/lib/utils'

export const CLOTHING_COLORS: { name: string; hex: string; border?: boolean }[] = [
  { name: 'Blanco', hex: '#ffffff', border: true },
  { name: 'Negro', hex: '#111111' },
  { name: 'Gris', hex: '#9ca3af' },
  { name: 'Beige', hex: '#e8d5b7' },
  { name: 'Marrón', hex: '#8b5e3c' },
  { name: 'Rojo', hex: '#dc2626' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Amarillo', hex: '#fbbf24' },
  { name: 'Verde', hex: '#10b981' },
  { name: 'Azul', hex: '#2563eb' },
  { name: 'Azul marino', hex: '#1e3a8a' },
  { name: 'Morado', hex: '#7c3aed' },
  { name: 'Multicolor', hex: 'multicolor' },
]

export function colorHexByName(name: string | null | undefined): string | null {
  if (!name) return null
  const found = CLOTHING_COLORS.find((c) => c.name.toLowerCase() === name.toLowerCase())
  return found?.hex ?? null
}

/**
 * Selector multi-color. Permite elegir hasta `max` colores (3 por defecto).
 * Cuando ya hay `max` seleccionados, los no-seleccionados quedan deshabilitados.
 */
export default function ColorPicker({
  value,
  onChange,
  max = 3,
}: {
  value: string[]
  onChange: (v: string[]) => void
  max?: number
}) {
  const atMax = value.length >= max

  function toggle(name: string) {
    if (value.includes(name)) {
      onChange(value.filter((n) => n !== name))
    } else if (!atMax) {
      onChange([...value, name])
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {CLOTHING_COLORS.map((c) => {
          const selected = value.includes(c.name)
          const disabled = atMax && !selected
          const isMulti = c.hex === 'multicolor'
          return (
            <button
              key={c.name}
              type="button"
              title={c.name + (disabled ? ' — quita uno para añadir otro' : '')}
              onClick={() => toggle(c.name)}
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
