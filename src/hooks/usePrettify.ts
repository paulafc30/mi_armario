import { useState } from 'react'

type PrettifyStatus = 'idle' | 'loading' | 'done' | 'error'

/**
 * Elimina el fondo de una imagen usando @imgly/background-removal (WASM, sin API key).
 * El modelo (~30MB) se descarga de CDN en el primer uso y queda cacheado en el browser.
 */
export function usePrettify() {
  const [status, setStatus] = useState<PrettifyStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const prettify = async (source: File | string): Promise<File | null> => {
    setStatus('loading')
    setError(null)
    try {
      // Import dinamico para no penalizar el bundle inicial
      const { removeBackground } = await import('@imgly/background-removal')

      const config = {
        // Usar modelos desde el CDN de imgly (evita incluirlos en el build)
        publicPath: 'https://staticimgly.com/@imgly/background-removal/1.7.0/dist/',
        model: 'isnet' as const,
        output: { format: 'image/png' as const, quality: 1 },
      }

      const blob = await removeBackground(source, config)
      const file = new File([blob], 'prettified.png', { type: 'image/png' })
      setStatus('done')
      return file
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la imagen'
      setError(msg)
      setStatus('error')
      return null
    }
  }

  const reset = () => { setStatus('idle'); setError(null) }

  return { prettify, status, error, reset, isLoading: status === 'loading' }
}
