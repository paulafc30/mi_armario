import { useState } from 'react'

type PrettifyStatus = 'idle' | 'loading' | 'done' | 'error'

/**
 * Elimina el fondo de una imagen usando @imgly/background-removal (WASM, sin API key).
 * El modelo (~30MB) se descarga de CDN en el primer uso y queda cacheado en el browser.
 */
export function usePrettify() {
  const [status, setStatus] = useState<PrettifyStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // Lanza el error en lugar de devolverlo como estado,
  // para que el caller pueda ver el mensaje real inmediatamente.
  const prettify = async (source: File | string): Promise<File> => {
    setStatus('loading')
    setError(null)
    try {
      const { removeBackground } = await import('@imgly/background-removal')

      const config = {
        // publicPath omitido → usa el default del paquete:
        // https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/
        model: 'isnet' as const,
        output: { format: 'image/png' as const, quality: 1 },
      }

      const blob = await removeBackground(source, config)
      const file = new File([blob], 'prettified.png', { type: 'image/png' })
      setStatus('done')
      return file
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setStatus('error')
      throw new Error(msg)
    }
  }

  const reset = () => { setStatus('idle'); setError(null) }

  return { prettify, status, error, reset, isLoading: status === 'loading' }
}
