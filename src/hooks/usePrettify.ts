import { useState } from 'react'

/**
 * "Prettify" — retoque de foto de producto al estilo catálogo de tienda:
 *
 *   1. Elimina el fondo con @imgly/background-removal (WASM, sin API key).
 *      Usamos el modelo `isnet_fp16` porque da mejores bordes que el default,
 *      con un coste de descarga solo ligeramente mayor (~40MB, cacheado).
 *
 *   2. Compone el sujeto sobre un lienzo cuadrado (1600×1600):
 *      - Fondo neutro (blanco puro o crema, según `style`).
 *      - Sujeto centrado horizontalmente, ligeramente elevado del centro
 *        para dejar sitio a la sombra.
 *      - Sujeto escalado a ~78% del frame → tamaño consistente entre fotos.
 *      - Sombra de suelo radial sutil bajo el producto, para dar volumen
 *        sin que se note artificial.
 *
 *   3. Exporta como JPEG calidad 0.92 (≈150-350KB, ideal para Wallapop/Vinted).
 *
 * Devuelve un File listo para reemplazar la foto original en el picker.
 * El resultado pasa después por el flujo normal de subida al Storage.
 */

export type PrettifyStyle = 'studio' | 'cream' | 'transparent'
export type PrettifyStatus = 'idle' | 'loading' | 'done' | 'error'

export interface PrettifyOptions {
  /** Estilo de acabado. Por defecto `'studio'` (fondo blanco + sombra). */
  style?: PrettifyStyle
  /** Callback opcional para progreso (0-1) mientras corre el modelo. */
  onProgress?: (fraction: number) => void
}

export function usePrettify() {
  const [status, setStatus] = useState<PrettifyStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const prettify = async (
    source: File | string,
    options: PrettifyOptions = {}
  ): Promise<File> => {
    const style: PrettifyStyle = options.style ?? 'studio'
    setStatus('loading')
    setProgress(0)
    setError(null)
    try {
      const { removeBackground } = await import('@imgly/background-removal')

      // Normalizamos el formato ANTES de pasarlo al modelo. Sin esto, si la
      // foto original es AVIF (iPhone/Android modernos a veces guardan así,
      // y algunos sitios sirven las imágenes en AVIF) la librería lanza:
      //     "Invalid format: image/avif with params: [object Object]"
      // La compresión previa a veces no lo detecta porque el AVIF pesa menos
      // que un JPEG del mismo contenido y `compressImage` prefiere no tocarlo.
      const normalizedSource = await normalizeToSupportedFormat(source)

      const cutout = await removeBackground(normalizedSource, {
        // Mejor modelo disponible → menos halos en pelo, tejidos finos, etc.
        model: 'isnet_fp16',
        output: { format: 'image/png', quality: 1 },
        progress: (_key: string, current: number, total: number) => {
          const frac = total > 0 ? current / total : 0
          setProgress(frac)
          options.onProgress?.(frac)
        },
      })

      let result: File
      if (style === 'transparent') {
        result = new File([cutout], 'prettified.png', { type: 'image/png' })
      } else {
        result = await compositeOnBackground(cutout, style)
      }

      setStatus('done')
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setStatus('error')
      throw new Error(msg)
    }
  }

  const reset = () => {
    setStatus('idle')
    setError(null)
    setProgress(0)
  }

  return { prettify, status, error, progress, reset, isLoading: status === 'loading' }
}

/**
 * Formatos que `@imgly/background-removal` acepta directamente. Cualquier
 * otro formato (avif, heic, gif, tiff, bmp…) provoca un "Invalid format"
 * de la librería, así que lo convertimos a PNG con canvas antes de pasarlo.
 */
const SUPPORTED_INPUT_FORMATS = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
])

/**
 * Si el input es un File en un formato no soportado por el modelo, lo
 * decodifica con canvas y lo re-empaqueta como PNG. Si el navegador tampoco
 * puede decodificarlo (HEIC en Chrome, típicamente), lanza un error con
 * mensaje entendible para la usuaria.
 *
 * Para inputs de tipo `string` (URLs) no hacemos nada: la librería hace
 * el fetch internamente y sí acepta AVIF por HTTP (usa el decoder nativo
 * del navegador, no la validación de tipos que aplica al File).
 */
async function normalizeToSupportedFormat(source: File | string): Promise<File | string> {
  if (typeof source === 'string') return source
  const type = source.type.toLowerCase()
  if (SUPPORTED_INPUT_FORMATS.has(type)) return source

  try {
    const bitmap = await createImageBitmap(source)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D no disponible')
      ctx.drawImage(bitmap, 0, 0)

      return await new Promise<File>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('No se pudo convertir el formato'))
            const baseName = (source.name || 'foto').replace(/\.\w+$/, '')
            resolve(new File([blob], `${baseName}.png`, { type: 'image/png' }))
          },
          'image/png'
        )
      })
    } finally {
      bitmap.close()
    }
  } catch {
    throw new Error(
      `El formato "${source.type || 'desconocido'}" no se puede procesar en este navegador. ` +
        'Prueba con una foto JPG o PNG, o abre la app en Safari si es un HEIC del iPhone.'
    )
  }
}

/**
 * Toma el PNG con transparencia devuelto por el modelo y lo composita sobre
 * un fondo limpio con sombra de suelo, todo a 1600×1600. Devuelve JPEG.
 */
async function compositeOnBackground(
  cutout: Blob,
  style: 'studio' | 'cream'
): Promise<File> {
  const OUTPUT = 1600
  const bitmap = await createImageBitmap(cutout)

  try {
    // 1) Detectar bounding box del sujeto (píxeles con alpha > umbral)
    const bbox = findSubjectBoundingBox(bitmap)

    // 2) Escala para que el bbox ocupe ~78% del frame
    const targetFrame = OUTPUT * 0.78
    const scale = Math.min(targetFrame / bbox.w, targetFrame / bbox.h)

    // 3) Padding alrededor del bbox para conservar bordes anti-aliased
    const pad = Math.max(bbox.w, bbox.h) * 0.03
    const sx = Math.max(0, bbox.x - pad)
    const sy = Math.max(0, bbox.y - pad)
    const sw = Math.min(bitmap.width - sx, bbox.w + pad * 2)
    const sh = Math.min(bitmap.height - sy, bbox.h + pad * 2)

    // 4) Centro donde queremos que caiga el bbox en el canvas
    const canvasCX = OUTPUT / 2
    const canvasCY = OUTPUT / 2 - OUTPUT * 0.015 // elevado 1.5% para hueco de sombra

    // Traducción bbox-image → canvas
    const bboxCX_img = bbox.x + bbox.w / 2
    const bboxCY_img = bbox.y + bbox.h / 2
    const dx = canvasCX - (bboxCX_img - sx) * scale
    const dy = canvasCY - (bboxCY_img - sy) * scale
    const dw = sw * scale
    const dh = sh * scale

    // 5) Preparar canvas y contexto de alta calidad
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D no disponible')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // 6) Fondo neutro
    const bgColor = style === 'studio' ? '#FFFFFF' : '#F8F3EE'
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, OUTPUT, OUTPUT)

    // 7) Sombra de suelo debajo del sujeto (elipse radial sutil)
    const shadowCY = canvasCY + (bbox.h * scale) / 2 - OUTPUT * 0.005
    const shadowRadX = bbox.w * scale * 0.42
    const shadowRadY = Math.max(6, shadowRadX * 0.13)
    const grad = ctx.createRadialGradient(
      canvasCX, shadowCY, 0,
      canvasCX, shadowCY, shadowRadX
    )
    grad.addColorStop(0, 'rgba(0,0,0,0.20)')
    grad.addColorStop(0.5, 'rgba(0,0,0,0.08)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.save()
    ctx.beginPath()
    ctx.ellipse(canvasCX, shadowCY, shadowRadX, shadowRadY, 0, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
    ctx.restore()

    // 8) Sujeto encima de la sombra
    ctx.drawImage(bitmap, sx, sy, sw, sh, dx, dy, dw, dh)

    // 9) Exportar como JPEG (más ligero que PNG y fondo ya es opaco)
    return await new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(
                new File([blob], 'prettified.jpg', {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
              )
            : reject(new Error('No se pudo exportar la imagen')),
        'image/jpeg',
        0.92
      )
    })
  } finally {
    bitmap.close()
  }
}

/**
 * Encuentra el rectángulo mínimo que contiene todos los píxeles del sujeto
 * (con alpha > umbral). Trabaja a resolución reducida (512×512) para no
 * gastar CPU en imágenes grandes; el resultado se traduce a coords originales.
 */
function findSubjectBoundingBox(
  bitmap: ImageBitmap
): { x: number; y: number; w: number; h: number } {
  const ANALYZE = 512
  const canvas = document.createElement('canvas')
  canvas.width = ANALYZE
  canvas.height = ANALYZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { x: 0, y: 0, w: bitmap.width, h: bitmap.height }

  const iw = bitmap.width
  const ih = bitmap.height
  const scale = Math.min(ANALYZE / iw, ANALYZE / ih)
  const aw = iw * scale
  const ah = ih * scale
  const offX = (ANALYZE - aw) / 2
  const offY = (ANALYZE - ah) / 2
  ctx.drawImage(bitmap, offX, offY, aw, ah)

  const { data } = ctx.getImageData(0, 0, ANALYZE, ANALYZE)
  const threshold = 24 // ignoramos anti-alias muy tenue
  let minX = ANALYZE, minY = ANALYZE, maxX = -1, maxY = -1

  for (let y = 0; y < ANALYZE; y++) {
    for (let x = 0; x < ANALYZE; x++) {
      const alpha = data[(y * ANALYZE + x) * 4 + 3]
      if (alpha > threshold) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // Sin sujeto detectado → devolvemos el frame completo
  if (maxX < 0) return { x: 0, y: 0, w: iw, h: ih }

  // Traducir de coords "analyze" a coords "imagen original"
  return {
    x: Math.max(0, (minX - offX) / scale),
    y: Math.max(0, (minY - offY) / scale),
    w: (maxX - minX + 1) / scale,
    h: (maxY - minY + 1) / scale,
  }
}
