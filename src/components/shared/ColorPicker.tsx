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

export default function ColorPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (v: string | null) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {CLOTHING_COLORS.map((c) => {
        const selected = value === c.name
        const isMulti = c.hex === 'multicolor'
        return (
          <button
            key={c.name}
            type="button"
            title={c.name}
            onClick={() => onChange(selected ? null : c.name)}
            className={cx(
              'aspect-square rounded-xl transition relative',
              selected ? 'ring-2 ring-offset-2 ring-brand-700' : 'hover:scale-105',
              c.border ? 'border border-gray-300' : ''
            )}
            style={{
              background: isMulti
                ? 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)'
                : c.hex,
            }}
          />
        )
      })}
    </div>
  )
}
