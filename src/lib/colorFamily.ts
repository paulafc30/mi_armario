/**
 * Utilidades de color compartidas: conversión HSL→hex y clasificación de
 * un hex arbitrario en la "familia" más cercana de CLOTHING_COLORS.
 *
 * Esto permite que la usuaria elija un tono preciso (slider de hue) y aun
 * así se siga agrupando bajo un nombre de familia estable (ej. "Azul")
 * para que el filtro de búsqueda por color siga funcionando sin cambios.
 */

import { CLOTHING_COLORS } from '@/lib/colorPalette'

interface RGB { r: number; g: number; b: number }

export function hexToRgb(hex: string): RGB | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

/** Distancia perceptual aproximada (redmean) — más realista que la euclidiana cruda. */
export function colorDistance(a: RGB, b: RGB): number {
  const rMean = (a.r + b.r) / 2
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr +
    4 * dg * dg +
    (2 + (255 - rMean) / 256) * db * db
  )
}

/** Nombre de familia de CLOTHING_COLORS más cercano a un hex arbitrario. */
export function nearestPaletteName(hex: string): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  let bestName: string | null = null
  let bestDist = Infinity
  for (const c of CLOTHING_COLORS) {
    if (c.hex === 'multicolor') continue
    const target = hexToRgb(c.hex)
    if (!target) continue
    const dist = colorDistance(rgb, target)
    if (dist < bestDist) {
      bestDist = dist
      bestName = c.name
    }
  }
  return bestName
}

/** Convierte HSL (h: 0-360, s/l: 0-100) a hex "#rrggbb". */
export function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100
  const lN = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sN * Math.min(lN, 1 - lN)
  const f = (n: number) => lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (n: number) => Math.round(f(n) * 255).toString(16).padStart(2, '0')
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`
}
