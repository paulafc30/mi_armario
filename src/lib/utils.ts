import { ClothesStatus } from '@/types/database'

export const STATUS_LABELS: Record<ClothesStatus, string> = {
  closet: 'Armario',
  baul: 'Baúl',
  en_venta: 'En Venta',
  vendida: 'Vendida',
  archivada: 'Archivada',
}

export const STATUS_COLORS: Record<ClothesStatus, string> = {
  closet:    'bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200',
  baul:      'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  en_venta:  'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  vendida:   'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
  archivada: 'bg-surface-soft text-muted',
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return ''
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
}

/** Llama al endpoint público de microlink.io para extraer metadatos de una URL. */
export async function fetchUrlPreview(url: string): Promise<{
  title?: string
  image?: string
  price?: string
} | null> {
  try {
    const r = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
    if (!r.ok) return null
    const json = await r.json()
    if (json.status !== 'success') return null
    return {
      title: json.data?.title,
      image: json.data?.image?.url ?? json.data?.logo?.url,
    }
  } catch {
    return null
  }
}
