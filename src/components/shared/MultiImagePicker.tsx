import { useRef, useState } from 'react'
import { ImagePlus, X, Star, Link as LinkIcon, Plus, Loader2 } from 'lucide-react'
import { cx } from '@/lib/utils'
import { compressImage } from '@/lib/imageCompression'

/** Estado de cada imagen en el picker. */
export type PickerImage =
  | { kind: 'existing'; id: string; url: string; path: string | null }
  | { kind: 'new-file'; tempId: string; file: File; preview: string }
  | { kind: 'new-url'; tempId: string; url: string }

export function previewOf(img: PickerImage): string {
  if (img.kind === 'existing') return img.url
  if (img.kind === 'new-file') return img.preview
  return img.url
}

export default function MultiImagePicker({
  images,
  onChange,
}: {
  images: PickerImage[]
  onChange: (next: PickerImage[]) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function addFiles(files: FileList | File[]) {
    setError(null)
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) {
      setError('Solo se permiten imágenes (jpg, png, webp…)')
      return
    }
    setProcessing(true)
    try {
      const items: PickerImage[] = []
      for (const original of list) {
        const compressed = await compressImage(original)
        const preview = await new Promise<string>((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(r.result as string)
          r.onerror = reject
          r.readAsDataURL(compressed)
        })
        items.push({
          kind: 'new-file',
          tempId: crypto.randomUUID(),
          file: compressed,
          preview,
        })
      }
      onChange([...images, ...items])
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo procesar la imagen')
    } finally {
      setProcessing(false)
    }
  }

  function addUrl() {
    if (!urlValue.trim()) return
    onChange([
      ...images,
      { kind: 'new-url', tempId: crypto.randomUUID(), url: urlValue.trim() },
    ])
    setUrlValue('')
    setUrlMode(false)
  }

  function removeAt(index: number) {
    const next = images.filter((_, i) => i !== index)
    onChange(next)
  }

  function setCover(index: number) {
    if (index === 0) return
    const next = [...images]
    const [item] = next.splice(index, 1)
    next.unshift(item)
    onChange(next)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragging(false) }}
        onDrop={handleDrop}
        className={cx(
          'grid grid-cols-3 gap-2 p-2 rounded-2xl transition border-2 border-dashed',
          dragging ? 'border-brand-600 bg-brand-50' : 'border-transparent'
        )}
      >
        {images.map((img, i) => (
          <div key={img.kind === 'existing' ? img.id : img.tempId}
               className="relative aspect-square rounded-xl overflow-hidden bg-surface-soft group">
            <img src={previewOf(img)} alt="" className="w-full h-full object-cover" />

            {/* Botón eliminar */}
            <button type="button" onClick={() => removeAt(i)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-80 hover:opacity-100 hover:bg-black/80 transition"
              title="Quitar">
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Marcar como portada */}
            {i === 0 ? (
              <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-brand-700 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-white" /> Portada
              </div>
            ) : (
              <button type="button" onClick={() => setCover(i)}
                className="absolute top-1 left-1 p-1 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition"
                title="Marcar como portada">
                <Star className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Tile para añadir */}
        <button
          type="button"
          disabled={processing}
          onClick={() => inputRef.current?.click()}
          className={cx(
            'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition',
            processing
              ? 'border-brand-600 bg-brand-50 text-brand-700 cursor-wait'
              : dragging
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-gray-300 bg-gray-50 text-muted hover:bg-surface-soft hover:border-gray-400'
          )}
        >
          {processing ? (
            <>
              <Loader2 className="w-6 h-6 mb-0.5 animate-spin" />
              <span className="text-[11px] font-medium">Comprimiendo…</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-6 h-6 mb-0.5" />
              <span className="text-[11px] font-medium leading-tight text-center px-1">
                {dragging ? '¡Suelta aquí!' : images.length === 0 ? 'Arrastra o pulsa' : 'Añadir'}
              </span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />

      {/* Añadir por URL */}
      {urlMode ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://…"
            className="input flex-1"
            autoFocus
          />
          <button type="button" onClick={addUrl} className="btn-primary">
            <Plus className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { setUrlMode(false); setUrlValue('') }} className="btn-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setUrlMode(true)}
          className="btn-ghost w-full justify-center text-sm">
          <LinkIcon className="w-4 h-4" /> Añadir imagen por URL
        </button>
      )}

      {error && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">{error}</p>}

      {images.length > 0 && (
        <p className="text-xs text-muted text-center">
          La primera imagen es la portada. Toca la estrella para cambiarla.
        </p>
      )}
    </div>
  )
}
