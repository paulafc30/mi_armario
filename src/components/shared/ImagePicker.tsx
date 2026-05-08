import { useState } from 'react'
import { Upload, Link as LinkIcon, ImageOff } from 'lucide-react'
import { cx } from '@/lib/utils'

export type PickerValue = { mode: 'file'; file: File | null; preview: string | null } | { mode: 'url'; url: string }

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

  const previewSrc =
    value.mode === 'file' ? value.preview ?? initialPreview ?? null
    : value.mode === 'url' ? value.url || initialPreview || null
    : null

  function selectFile(file: File | null) {
    if (!file) {
      onChange({ mode: 'file', file: null, preview: null })
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange({ mode: 'file', file, preview: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => { setTab('file'); onChange({ mode: 'file', file: null, preview: null }) }}
          className={cx('flex-1 btn', tab === 'file' ? 'bg-brand-100 text-brand-800' : 'btn-secondary')}>
          <Upload className="w-4 h-4" /> Subir
        </button>
        <button type="button" onClick={() => { setTab('url'); onChange({ mode: 'url', url: '' }) }}
          className={cx('flex-1 btn', tab === 'url' ? 'bg-brand-100 text-brand-800' : 'btn-secondary')}>
          <LinkIcon className="w-4 h-4" /> Por URL
        </button>
      </div>

      {tab === 'file' && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-brand-100 file:text-brand-800 hover:file:bg-brand-200"
        />
      )}

      {tab === 'url' && value.mode === 'url' && (
        <input
          type="url"
          value={value.url}
          onChange={(e) => onChange({ mode: 'url', url: e.target.value })}
          placeholder="https://…"
          className="input"
        />
      )}

      <div className="aspect-square w-full rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
        {previewSrc ? (
          <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <ImageOff className="w-10 h-10 text-gray-300" />
        )}
      </div>
    </div>
  )
}
