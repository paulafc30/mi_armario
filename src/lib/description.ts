import type { Clothe, Category } from '@/types/database'

// Categorías de género femenino en español (uso de "esta" en lugar de "este")
const FEM_KEYWORDS = [
  'camiseta', 'camisetas', 'blusa', 'blusas', 'falda', 'faldas',
  'chaqueta', 'chaquetas', 'sudadera', 'sudaderas', 'americana', 'americanas',
  'rebeca', 'rebecas', 'chaqueta', 'gabardina', 'gabardinas',
  'parka', 'parkas', 'camisa', 'camisas', 'cazadora', 'cazadoras',
  'bota', 'botas', 'sandalia', 'sandalias', 'zapatilla', 'zapatillas',
  'bolsa', 'bolsas', 'mochila', 'mochilas', 'gorra', 'gorras',
  'bufanda', 'bufandas', 'prenda', 'prendas',
]

function inferArticle(name: string, category?: Category): 'este' | 'esta' {
  const text = `${category?.name ?? ''} ${name}`.toLowerCase()
  const isPlural = /s$/.test(text.trim().split(/\s+/)[0] ?? '')
  const isFem = FEM_KEYWORDS.some((w) => text.includes(w))
  if (isFem) return isPlural ? 'esta' : 'esta'
  return isPlural ? 'este' : 'este'
}

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/**
 * Genera una descripción amable para un anuncio de Wallapop/Vinted
 * a partir de los datos de una prenda. Tono cercano y amigable.
 */
export function generateDescription(clothe: Clothe, category?: Category): string {
  const articulo = inferArticle(clothe.name, category)
  const lines: string[] = []

  // 1. Apertura con datos básicos
  const partes: string[] = []
  partes.push(`¡Vendo ${articulo} ${lowerFirst(clothe.name)}`)
  if (clothe.color) partes.push(`color ${clothe.color.toLowerCase()}`)
  if (clothe.brand) partes.push(`de ${clothe.brand}`)
  if (clothe.size) partes.push(`talla ${clothe.size}`)
  lines.push(partes.join(' ').replace(/\s+/g, ' ').trim() + '!')

  // 2. Notas / detalles personales si las hay
  if (clothe.notes && clothe.notes.trim()) {
    lines.push(clothe.notes.trim())
  } else {
    lines.push('Está en muy buen estado, apenas la he usado.')
  }

  // 3. Precio
  if (clothe.price) {
    lines.push(`Lo dejo en ${clothe.price.toFixed(2).replace(/\.00$/, '')}€.`)
  }

  // 4. Cierre amable
  lines.push('Si te interesa o tienes cualquier duda, escríbeme 😊')

  return lines.join('\n\n')
}

/** Devuelve también una versión corta para Vinted con hashtags. */
export function generateShortDescription(clothe: Clothe, category?: Category): string {
  const parts: string[] = [clothe.name]
  if (clothe.brand) parts.push(clothe.brand)
  if (clothe.size) parts.push(`Talla ${clothe.size}`)
  if (clothe.color) parts.push(clothe.color)

  const head = parts.join(' · ')
  const hashtags: string[] = []
  if (clothe.brand) hashtags.push(`#${clothe.brand.replace(/\s+/g, '').toLowerCase()}`)
  if (category) hashtags.push(`#${category.name.replace(/\s+/g, '').toLowerCase()}`)
  if (clothe.color) hashtags.push(`#${clothe.color.replace(/\s+/g, '').toLowerCase()}`)

  const tail = clothe.notes?.trim() || 'En muy buen estado, apenas usada.'
  return `${head}\n\n${tail}\n\n${hashtags.join(' ')}`.trim()
}
