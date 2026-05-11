import { useRef, useState } from 'react'
import { Upload, Link as LinkIcon, ImageOff, ImagePlus, X } from 'lucide-react'
import { cx } from '@/lib/utils'

export type PickerValue =
  | { mode: 'file'; file: File | null; preview: string | null }
  | { mode: 'url'; url: string }

export default function ImagePicker({
  value,
  onChange,
  initialPreview,
}: {
  value: PickerValue
  onChange: (v: PickerValue) => void
  initialPreview?: string | null
}) {
  const [tab, setTab] = useState<'file' | 'url'>(value.mode)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filePreview =
    value.mode === 'file' ? value.preview ?? initialPreview ?? null : null
  const urlPreview =
    value.mode === 'url' ? value.url || initialPreview || null : null

  function handleFile(file: File | null) {
    setError(null)
    if (!file) {
      onChange({ mode: 'file', file: null, preview: null })
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (jpg, png, webp…)')
      return
    }
    // Aviso si la foto pesa más de 5 MB para que la usuaria lo sepa
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen pesa más de 5 MB. Considera comprimirla antes de subirla.')
      // No bloqueamos la subida — solo avisamos
    }
    const reader = new FileReader()
    reader.onload = () =>
      onChange({ mode: 'file', file, preview: reader.result as string })
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clearImage(e: React.MouseEvent) {
    e.stopPropagation()
    handleFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('file')
            onChange({ mode: 'file', file: null, preview: null })
            setError(null)
          }}
          className={cx('flex-1 btn', tab === 'file' ? 'bg-brand-100 text-brand-800' : 'btn-secondary')}
        >
          <Upload className="w-4 h-4" /> Subir
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('url')
            onChange({ mode: 'url', url: '' })
            setError(null)
          }}
          className={cx('flex-1 btn', tab === 'url' ? 'bg-brand-100 text-brand-800' : 'btn-secondary')}
        >
          <LinkIcon className="w-4 h-4" /> Por URL
        </button>
      </div>

      {tab === 'file' && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={(e) => { e.preventDefault(); setDragging(false) }}
            onDrop={handleDrop}
            className={cx(
              'relative aspect-square w-full rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer transition border-2 border-dashed',
              dragging
                ? 'border-brand-600 bg-brand-50 scale-[1.01]'
                : filePreview
                  ? 'border-transparent bg-gray-100'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
            )}
          >
            {filePreview ? (
              <>
                <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                  title="Quitar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center text-center px-4 pointer-events-none">
                <ImagePlus className={cx('w-10 h-10 mb-2', dragging ? 'text-brand-600' : 'text-gray-400')} />
                <p className={cx('text-sm font-medium', dragging ? 'text-brand-700' : 'text-gray-700')}>
                  {dragging ? '¡Suelta para subir!' : 'Arrastra una foto aquí'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">o pulsa para elegir desde el dispositivo</p>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">{error}</p>}
        </>
      )}

      {tab === 'url' && value.mode === 'url' && (
        <>
          <input
            type="url"
            value={value.url}
            onChange={(e) => onChange({ mode: 'url', url: e.target.value })}
            placeholder="https://…"
            className="input"
          />
          <div className="aspect-square w-full rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
            {urlPreview ? (
              <img src={urlPreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <ImageOff className="w-10 h-10 text-gray-300" />
            )}
          </div>
        </>
      )}
    </div>
  )
}
