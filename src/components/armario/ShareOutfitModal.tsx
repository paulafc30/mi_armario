import { useEffect, useState } from 'react'
import { Download, Share2, Loader2, AlertTriangle } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import { supabase } from '@/lib/supabase'
import { generateOutfitCollage, shareOrDownloadBlob } from '@/lib/outfitCollage'

export default function ShareOutfitModal({
  open,
  onClose,
  outfitName,
  clotheIds,
}: {
  open: boolean
  onClose: () => void
  outfitName: string
  clotheIds: string[]
}) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [busyAction, setBusyAction] = useState<'share' | 'download' | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Genera el collage al abrir
  useEffect(() => {
    if (!open) {
      setPreviewUrl(null); setBlob(null); setError(null); setFeedback(null)
      return
    }
    if (clotheIds.length === 0) {
      setError('Este outfit no tiene prendas para compartir.')
      return
    }

    let cancelled = false
    setGenerating(true); setError(null)

    ;(async () => {
      try {
        const { data, error: dbErr } = await supabase
          .from('clothes')
          .select('id, image_url')
          .in('id', clotheIds.slice(0, 9))
        if (dbErr) throw dbErr
        const byId = new Map((data ?? []).map((r: { id: string; image_url: string | null }) => [r.id, r.image_url]))
        // Respetamos el orden de clotheIds tal como vinieron del outfit
        const urls = clotheIds
          .map((id) => byId.get(id))
          .filter((u): u is string => !!u)

        if (urls.length === 0) {
          if (!cancelled) setError('Las prendas del outfit no tienen foto.')
          return
        }

        const generated = await generateOutfitCollage(outfitName, urls)
        if (cancelled) return
        setBlob(generated)
        setPreviewUrl(URL.createObjectURL(generated))
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'No se pudo generar la imagen')
      } finally {
        if (!cancelled) setGenerating(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, outfitName, clotheIds.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  // Liberar la URL objeto cuando cambie o se cierre
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function handleShare() {
    if (!blob) return
    setBusyAction('share'); setFeedback(null)
    const result = await shareOrDownloadBlob(blob, `${slugify(outfitName)}.png`, {
      title: outfitName,
      text: `Mira este outfit: ${outfitName}`,
    })
    setBusyAction(null)
    if (result === 'shared') setFeedback('Compartido')
    else if (result === 'downloaded') setFeedback('Descargado (tu navegador no soporta compartir directo)')
    // cancelled → no decimos nada
  }

  async function handleDownload() {
    if (!blob) return
    setBusyAction('download'); setFeedback(null)
    await shareOrDownloadBlob(blob, `${slugify(outfitName)}.png`)
    setBusyAction(null)
    setFeedback('Imagen descargada')
  }

  return (
    <Modal open={open} onClose={onClose} title="Compartir outfit">
      <div className="space-y-4">
        <div className="aspect-square rounded-2xl bg-surface-soft overflow-hidden flex items-center justify-center relative">
          {generating && (
            <div className="flex flex-col items-center gap-2 text-muted">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Generando imagen…</span>
            </div>
          )}
          {error && !generating && (
            <div className="flex flex-col items-center gap-2 text-muted px-6 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {previewUrl && !generating && !error && (
            <img src={previewUrl} alt="Vista previa del outfit" className="w-full h-full object-cover" />
          )}
        </div>

        {feedback && (
          <p className="text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300 rounded-xl px-3 py-2 text-center">
            {feedback}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!blob || !!busyAction}
            className="btn-secondary flex-1"
          >
            {busyAction === 'download' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Descargar
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!blob || !!busyAction}
            className="btn-primary flex-1"
          >
            {busyAction === 'share' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Compartir
          </button>
        </div>

        <p className="text-xs text-muted text-center">
          La imagen se genera con un collage cuadrado de hasta 9 prendas, en alta resolución (1080×1080).
        </p>
      </div>
    </Modal>
  )
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    || 'outfit'
}
