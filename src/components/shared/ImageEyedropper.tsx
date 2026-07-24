import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

function toHex(n: number): string {
  return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
}

/**
 * Cuentagotas de color sobre una imagen, implementado con canvas (funciona
 * en cualquier navegador/móvil, a diferencia de la API nativa `EyeDropper`
 * que solo existe en Chrome/Edge de escritorio).
 *
 * Dibuja la imagen en un canvas oculto-a-resolución-controlada y, al
 * arrastrar el dedo/ratón sobre ella, lee el píxel bajo el puntero con
 * `getImageData`. Si la imagen viene de una URL externa sin cabeceras CORS,
 * el canvas queda "manchado" y la lectura falla — en ese caso avisamos y
 * sugerimos usar el slider de tono como alternativa.
 */
export default function ImageEyedropper({
  imageUrl,
  onPick,
}: {
  imageUrl: string
  onPick: (hex: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loupe, setLoupe] = useState<{ x: number; y: number; hex: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setError(null)
    setLoupe(null)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (cancelled) return
      const canvas = canvasRef.current
      if (!canvas) return
      const maxSize = 700
      const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setReady(true)
    }
    img.onerror = () => !cancelled && setError('No se pudo cargar la imagen.')
    img.src = imageUrl

    return () => { cancelled = true }
  }, [imageUrl])

  function pixelAt(clientX: number, clientY: number): string | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((clientX - rect.left) * scaleX)))
    const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((clientY - rect.top) * scaleY)))
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    try {
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    } catch {
      setError('No se puede leer el color de esta imagen (viene de una fuente externa sin permiso CORS). Usa "Afinar tono" en su lugar.')
      return null
    }
  }

  function handleMove(clientX: number, clientY: number) {
    const hex = pixelAt(clientX, clientY)
    if (hex) setLoupe({ x: clientX, y: clientY, hex })
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    handleMove(e.clientX, e.clientY)
  }
  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.buttons !== 1) return
    handleMove(e.clientX, e.clientY)
  }
  function handlePointerUp() {
    if (loupe) onPick(loupe.hex)
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="relative rounded-xl overflow-hidden border border-line bg-surface-soft touch-none select-none">
        {!ready && !error && (
          <div className="aspect-square flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={ready ? 'w-full h-auto block cursor-crosshair' : 'hidden'}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {loupe && (
          <div
            className="pointer-events-none fixed z-50 w-14 h-14 rounded-full border-2 border-white shadow-lg -translate-x-1/2"
            style={{ left: loupe.x, top: loupe.y - 74, background: loupe.hex }}
          />
        )}
      </div>

      {ready && (
        <p className="text-xs text-muted text-center">
          Toca y arrastra sobre la prenda para elegir el tono exacto — suelta para añadirlo.
        </p>
      )}
    </div>
  )
}
