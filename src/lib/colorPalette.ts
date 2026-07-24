/**
 * Paleta fija de familias de color de la app. Vive en su propio módulo
 * (en vez de en ColorPicker.tsx) para que tanto el componente de UI como
 * las utilidades de `colorFamily.ts` puedan importarla sin crear un
 * import circular entre ambos.
 */

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
