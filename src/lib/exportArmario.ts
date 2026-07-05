import { supabase } from '@/lib/supabase'

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const keys = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v == null ? '' : Array.isArray(v) ? v.join(', ') : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }
  const header = keys.join(',')
  const body = rows.map((r) => keys.map((k) => escape(r[k])).join(',')).join('\n')
  return `${header}\n${body}`
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportArmario() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  // Fetch clothes, categories, seasons, outfits, outfit items
  const [
    { data: clothes = [] },
    { data: categories = [] },
    { data: seasons = [] },
    { data: clotheSeasons = [] },
    { data: outfits = [] },
    { data: outfitItems = [] },
    { data: wears = [] },
  ] = await Promise.all([
    supabase.from('clothes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
    supabase.from('categories').select('*').eq('user_id', user.id),
    supabase.from('seasons').select('*').or(`user_id.eq.${user.id},is_global.eq.true`),
    supabase.from('clothe_seasons').select('clothe_id, season_id'),
    supabase.from('outfits').select('*').eq('user_id', user.id),
    supabase.from('outfit_items').select('*'),
    supabase.from('wears').select('*').eq('user_id', user.id).order('wear_date', { ascending: false }),
  ])

  const catMap = Object.fromEntries((categories ?? []).map((c: any) => [c.id, c.name]))
  const seasonMap = Object.fromEntries((seasons ?? []).map((s: any) => [s.id, s.name]))

  // Build season names per clothe
  const clotheSeasonsMap: Record<string, string[]> = {}
  for (const cs of (clotheSeasons ?? []) as any[]) {
    if (!clotheSeasonsMap[cs.clothe_id]) clotheSeasonsMap[cs.clothe_id] = []
    clotheSeasonsMap[cs.clothe_id].push(seasonMap[cs.season_id] ?? cs.season_id)
  }

  // Build outfit clothe names per outfit
  const outfitClotheMap: Record<string, string[]> = {}
  for (const oi of (outfitItems ?? []) as any[]) {
    if (!outfitClotheMap[oi.outfit_id]) outfitClotheMap[oi.outfit_id] = []
    const clothe = (clothes ?? []).find((c: any) => c.id === oi.clothe_id) as any
    if (clothe) outfitClotheMap[oi.outfit_id].push(clothe.name)
  }

  const clotheRows = (clothes ?? []).map((c: any) => ({
    id: c.id,
    nombre: c.name,
    categoria: catMap[c.category_id] ?? '',
    marca: c.brand ?? '',
    talla: c.size ?? '',
    colores: (c.colors ?? []).join(' / '),
    material: c.material ?? '',
    temporadas: (clotheSeasonsMap[c.id] ?? []).join(' / '),
    etiquetas: (c.tags ?? []).join(', '),
    estado: c.status,
    precio: c.price ?? '',
    notas: c.notes ?? '',
    imagen: c.image_url ?? '',
    creada: c.created_at?.slice(0, 10) ?? '',
  }))

  const outfitRows = (outfits ?? []).map((o: any) => ({
    id: o.id,
    nombre: o.name,
    prendas: (outfitClotheMap[o.id] ?? []).join(' / '),
    creado: o.created_at?.slice(0, 10) ?? '',
  }))

  const wearRows = (wears ?? []).map((w: any) => {
    const clothe = (clothes ?? []).find((c: any) => c.id === w.clothe_id) as any
    const outfit = (outfits ?? []).find((o: any) => o.id === w.outfit_id) as any
    return {
      fecha: w.wear_date,
      prenda: clothe?.name ?? '',
      outfit: outfit?.name ?? '',
      planificado: w.planned ? 'Sí' : 'No',
      notas: w.notes ?? '',
    }
  })

  const now = new Date().toISOString().slice(0, 10)

  // Export as JSON bundle
  const bundle = {
    exportado: now,
    prendas: clotheRows,
    outfits: outfitRows,
    historial_looks: wearRows,
  }
  downloadFile(JSON.stringify(bundle, null, 2), `mi-armario-${now}.json`, 'application/json')

  // Also export clothes CSV
  downloadFile(toCsv(clotheRows), `mi-armario-prendas-${now}.csv`, 'text/csv;charset=utf-8;')
}
