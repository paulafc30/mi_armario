import { useRef, useState } from 'react'
import { ImagePlus, X, Star, Link as LinkIcon, Plus, Loader2, GripVertical } from 'lucide-react'
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

function keyOf(img: PickerImage): string {
  return img.kind === 'existing' ? img.id : img.tempId
}

export default function MultiImagePicker({
  images,
  onChange,
}: {
  images: PickerImage[]
  onChange: (next: PickerImage[]) => void
}) {
  const [filesDragging, setFilesDragging] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  // Drag-reorder interno entre miniaturas
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)
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
    onChange(images.filter((_, i) => i !== index))
  }

  function setCover(index: number) {
    if (index === 0) return
    const next = [...images]
    const [item] = next.splice(index, 1)
    next.unshift(item)
    onChange(next)
  }

  function reorder(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return
    const next = [...images]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    onChange(next)
  }

  // --------- Drop de archivos externos en el grid ---------
  function isFileDrag(e: React.DragEvent) {
    return e.dataTransfer.types?.includes('Files')
  }

  function handleGridDragOver(e: React.DragEvent) {
    if (!isFileDrag(e)) return
    e.preventDefault()
    setFilesDragging(true)
  }

  function handleGridDragLeave(e: React.DragEvent) {
    if (!isFileDrag(e)) return
    e.preventDefault()
    setFilesDragging(false)
  }

  function handleGridDrop(e: React.DragEvent) {
    if (!isFileDrag(e)) return
    e.preventDefault()
    setFilesDragging(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  // --------- Drag-reorder interno entre miniaturas ---------
  function handleTileDragStart(e: React.DragEvent, i: number) {
    e.dataTransfer.effectAllowed = 'move'
    // Marcamos el payload como reorder interno (no son archivos)
    e.dataTransfer.setData('text/x-mi-armario-reorder', String(i))
    setDraggingIdx(i)
  }

  function handleTileDragOver(e: React.DragEvent, i: number) {
    if (isFileDrag(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (overIdx !== i) setOverIdx(i)
  }

  function handleTileDrop(e: React.DragEvent, i: number) {
    if (isFileDrag(e)) return
    e.preventDefault()
    if (draggingIdx !== null) reorder(draggingIdx, i)
    setDraggingIdx(null)
    setOverIdx(null)
  }

  function handleTileDragEnd() {
    setDraggingIdx(null)
    setOverIdx(null)
  }

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleGridDragOver}
        onDragOver={handleGridDragOver}
        onDragLeave={handleGridDragLeave}
        onDrop={handleGridDrop}
        className={cx(
          'grid grid-cols-3 gap-2 p-2 rounded-2xl transition border-2 border-dashed',
          filesDragging ? 'border-brand-600 bg-brand-soft' : 'border-transparent'
        )}
      >
        {images.map((img, i) => {
          const isDragging = draggingIdx === i
          const isOver = overIdx === i && draggingIdx !== null && draggingIdx !== i
          return (
            <div
              key={keyOf(img)}
              draggable
              onDragStart={(e) => handleTileDragStart(e, i)}
              onDragOver={(e) => handleTileDragOver(e, i)}
              onDrop={(e) => handleTileDrop(e, i)}
              onDragEnd={handleTileDragEnd}
              className={cx(
                'relative aspect-square rounded-xl overflow-hidden bg-surface-soft group transition cursor-grab active:cursor-grabbing',
                isDragging && 'opacity-40 scale-95',
                isOver && 'ring-2 ring-brand-500 ring-offset-1 ring-offset-page'
              )}
            >
              <img src={previewOf(img)} alt="" className="w-full h-full object-cover pointer-events-none" />

              {/* Indicador de arrastre (visible en hover) */}
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none flex items-end justify-center pb-0.5">
                <GripVertical className="w-3.5 h-3.5 text-white/90 rotate-90" />
              </div>

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
          )
        })}

        {/* Tile para añadir */}
        <button
          type="button"
          disabled={processing}
          onClick={() => inputRef.current?.click()}
          className={cx(
            'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition',
            processing
              ? 'border-brand-600 bg-brand-soft text-brand-700 cursor-wait'
              : filesDragging
                ? 'border-brand-600 bg-brand-soft text-brand-700'
                : 'border-line bg-surface-soft text-muted hover:bg-surface hover:border-muted/40'
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
                {filesDragging ? '¡Suelta aquí!' : images.length === 0 ? 'Arrastra o pulsa' : 'Añadir'}
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

      {error && <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-200 rounded-lg px-3 py-2">{error}</p>}

      {images.length > 0 && (
        <p className="text-xs text-muted text-center">
          La primera es la portada. Arrastra para reordenar o usa la estrella para cambiarla.
        </p>
      )}
    </div>
  )
}
