/**
 * Extracción del color dominante de una imagen (sin librerías externas).
 *
 *  1. Dibuja la imagen en un canvas pequeño (64×64).
 *  2. Considera solo el rectángulo central (60%) para evitar fondos/marcos.
 *  3. Bucketea los píxeles en cubos de 32×32×32 en RGB y cuenta cuál es el
 *     más popular.
 *  4. Promedia los píxeles del cubo ganador → color "dominante".
 *  5. Mapea ese color al más parecido de nuestra paleta de prendas
 *     (CLOTHING_COLORS), usando la distancia redmean (aproximación
 *     barata de la distancia perceptual sin necesidad de LAB).
 *
 *  Devuelve el NOMBRE del color de la paleta (p. ej. "Verde") o null
 *  si no pudo determinar uno (CORS, imagen vacía, etc.).
 */

import { CLOTHING_COLORS } from '@/components/shared/ColorPicker'

interface RGB { r: number; g: number; b: number }

export async function extractDominantColorName(imageUrl: string): Promise<string | null> {
  try {
    const img = await loadImage(imageUrl)
    const rgb = computeDominantRGB(img)
    if (!rgb) return null
    return nearestPaletteName(rgb)
  } catch {
    return null
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = url
  })
}

function computeDominantRGB(img: HTMLImageElement): RGB | null {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  try {
    ctx.drawImage(img, 0, 0, size, size)
  } catch {
    // Si la imagen tiñó el canvas por CORS, no podemos leer los píxeles
    return null
  }

  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, size, size).data
  } catch {
    return null
  }

  // Solo el 60% central: descartamos un margen del 20% en cada lado
  const start = Math.floor(size * 0.2)
  const end = size - start

  // Buckets: índices con 8 cubos por canal → 8*8*8 = 512 posibles
  const buckets = new Map<number, { count: number; r: number; g: number; b: number }>()

  for (let y = start; y < end; y++) {
    for (let x = start; x < end; x++) {
      const idx = (y * size + x) * 4
      const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3]
      if (a < 128) continue

      // Ignoramos pixeles cuasi-totalmente blancos (fondo de catálogo)
      if (r > 245 && g > 245 && b > 245) continue
      // Y cuasi-totalmente negros (sombras puras)
      if (r < 10 && g < 10 && b < 10) continue

      const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5)
      const existing = buckets.get(key)
      if (existing) {
        existing.count++; existing.r += r; existing.g += g; existing.b += b
      } else {
        buckets.set(key, { count: 1, r, g, b })
      }
    }
  }

  if (buckets.size === 0) {
    // Probablemente todo blanco o todo negro → repetir sin skip
    let count = 0, sr = 0, sg = 0, sb = 0
    for (let y = start; y < end; y++) {
      for (let x = start; x < end; x++) {
        const idx = (y * size + x) * 4
        if (data[idx + 3] < 128) continue
        sr += data[idx]; sg += data[idx + 1]; sb += data[idx + 2]; count++
      }
    }
    if (count === 0) return null
    return { r: Math.round(sr / count), g: Math.round(sg / count), b: Math.round(sb / count) }
  }

  // Bucket más poblado
  let winner: { count: number; r: number; g: number; b: number } | null = null
  for (const v of buckets.values()) {
    if (!winner || v.count > winner.count) winner = v
  }
  if (!winner) return null

  return {
    r: Math.round(winner.r / winner.count),
    g: Math.round(winner.g / winner.count),
    b: Math.round(winner.b / winner.count),
  }
}

function hexToRgb(hex: string): RGB | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

/** Distancia perceptual aproximada (redmean) — más realista que la euclidiana cruda. */
function colorDistance(a: RGB, b: RGB): number {
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

function nearestPaletteName(rgb: RGB): string | null {
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
