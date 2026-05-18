import { useEffect, useMemo, useState } from 'react'
import { Ruler, Sparkles } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import { BODY_TYPE_LABELS, BODY_TYPE_DESCRIPTIONS, calculateBodyType } from '@/lib/bodyType'
import type { Profile } from '@/types/database'

type FormState = {
  height_cm: string
  bust_cm: string
  waist_cm: string
  hips_cm: string
  shoulder_cm: string
  weight_kg: string
  top_size: string
  bottom_size: string
  shoe_size: string
}

const empty: FormState = {
  height_cm: '', bust_cm: '', waist_cm: '', hips_cm: '',
  shoulder_cm: '', weight_kg: '', top_size: '', bottom_size: '', shoe_size: '',
}

function num(s: string): number | null {
  const v = s.replace(',', '.').trim()
  if (!v) return null
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

export default function MeasurementsModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean
  onClose: () => void
  initial?: Partial<Profile> | null
  onSave: (patch: Partial<Profile>) => Promise<{ error?: string } | void>
}) {
  const [m, setM] = useState<FormState>(empty)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setM({
      height_cm:   initial?.height_cm?.toString() ?? '',
      bust_cm:     initial?.bust_cm?.toString() ?? '',
      waist_cm:    initial?.waist_cm?.toString() ?? '',
      hips_cm:     initial?.hips_cm?.toString() ?? '',
      shoulder_cm: initial?.shoulder_cm?.toString() ?? '',
      weight_kg:   initial?.weight_kg?.toString() ?? '',
      top_size:    initial?.top_size ?? '',
      bottom_size: initial?.bottom_size ?? '',
      shoe_size:   initial?.shoe_size ?? '',
    })
    setError(null)
  }, [open, initial])

  // Previsualización del tipo de cuerpo en vivo
  const bodyType = useMemo(() => calculateBodyType({
    bust_cm: num(m.bust_cm),
    waist_cm: num(m.waist_cm),
    hips_cm: num(m.hips_cm),
  }), [m.bust_cm, m.waist_cm, m.hips_cm])

  function update<K extends keyof FormState>(k: K, v: string) {
    setM((prev) => ({ ...prev, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setError(null)
    const patch: Partial<Profile> = {
      height_cm:   num(m.height_cm),
      bust_cm:     num(m.bust_cm),
      waist_cm:    num(m.waist_cm),
      hips_cm:     num(m.hips_cm),
      shoulder_cm: num(m.shoulder_cm),
      weight_kg:   num(m.weight_kg),
      top_size:    m.top_size.trim() || null,
      bottom_size: m.bottom_size.trim() || null,
      shoe_size:   m.shoe_size.trim() || null,
    }
    const res = await onSave(patch)
    setSubmitting(false)
    if (res?.error) { setError(res.error); return }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Test de silueta">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card-glass p-4 rounded-2xl">
          <p className="text-sm text-muted leading-relaxed">
            Mídete con cinta métrica sobre la ropa interior. Pecho a la altura de los pezones, cintura en la zona más estrecha, cadera en la zona más ancha. Solo con esas tres ya calculamos tu silueta.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="label flex items-center gap-1.5 mb-2">
            <Ruler className="w-3.5 h-3.5" /> Para tu silueta
          </legend>
          <div className="grid grid-cols-3 gap-2">
            <NumberField label="Pecho" unit="cm" placeholder="88" value={m.bust_cm}  onChange={(v) => update('bust_cm', v)} />
            <NumberField label="Cintura" unit="cm" placeholder="70" value={m.waist_cm} onChange={(v) => update('waist_cm', v)} />
            <NumberField label="Cadera" unit="cm" placeholder="96" value={m.hips_cm}  onChange={(v) => update('hips_cm', v)} />
          </div>
        </fieldset>

        {/* Resultado en vivo */}
        {bodyType ? (
          <div className="card p-4 rounded-2xl border-2 border-brand-200 dark:border-brand-500/30 animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wide text-brand-700">Tu silueta</span>
            </div>
            <p className="heading-md mb-1">{BODY_TYPE_LABELS[bodyType]}</p>
            <p className="text-sm text-muted leading-relaxed">{BODY_TYPE_DESCRIPTIONS[bodyType]}</p>
          </div>
        ) : (
          <div className="card p-4 rounded-2xl border-dashed border-2 border-line">
            <p className="text-sm text-muted text-center">
              Rellena pecho, cintura y cadera para ver tu silueta.
            </p>
          </div>
        )}

        <fieldset className="space-y-3">
          <legend className="label mb-2">Más medidas (opcional)</legend>
          <div className="grid grid-cols-3 gap-2">
            <NumberField label="Altura" unit="cm" placeholder="165" value={m.height_cm}   onChange={(v) => update('height_cm', v)} />
            <NumberField label="Peso"   unit="kg" placeholder="60"  value={m.weight_kg}   onChange={(v) => update('weight_kg', v)} />
            <NumberField label="Hombro" unit="cm" placeholder="38"  value={m.shoulder_cm} onChange={(v) => update('shoulder_cm', v)} />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="label mb-2">Tallas habituales</legend>
          <div className="grid grid-cols-3 gap-2">
            <TextField label="Top"      placeholder="M / 38" value={m.top_size}    onChange={(v) => update('top_size', v)} />
            <TextField label="Pantalón" placeholder="M / 38" value={m.bottom_size} onChange={(v) => update('bottom_size', v)} />
            <TextField label="Pie"      placeholder="38"     value={m.shoe_size}   onChange={(v) => update('shoe_size', v)} />
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function NumberField({ label, unit, value, onChange, placeholder }: {
  label: string; unit: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-2xs font-semibold uppercase tracking-wide text-muted mb-1">{label}</span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">{unit}</span>
      </div>
    </label>
  )
}

function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-2xs font-semibold uppercase tracking-wide text-muted mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
    </label>
  )
}
