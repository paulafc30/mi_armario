import type { Clothe, Category } from '@/types/database'

/**
 * Generador de descripciones cercanas y amigables para anuncios de venta.
 *
 * Detecta género y número en español (fem-singular, fem-plural, masc-singular,
 * masc-plural) para que la concordancia "este/esta/estos/estas" + el participio
 * ("usada", "usados") sea correcta. Cada llamada elige aleatoriamente entre
 * varias variantes (apertura, condición, cierre) para que al pulsar "Regenerar"
 * salga una versión distinta.
 */

const FEM_KEYWORDS = [
  'camiseta', 'blusa', 'falda', 'chaqueta', 'sudadera', 'americana',
  'rebeca', 'gabardina', 'parka', 'camisa', 'cazadora', 'capa',
  'bota', 'sandalia', 'zapatilla', 'manoletina', 'bailarina',
  'mochila', 'bolsa', 'gorra', 'visera', 'bufanda', 'diadema',
  'falda', 'prenda', 'sudadera', 'rebeca',
]

type Form = 'fem-s' | 'fem-p' | 'masc-s' | 'masc-p'

function inferForm(name: string, category?: Category): Form {
  const firstWord = name.trim().toLowerCase().split(/\s+/)[0] ?? ''
  const isPlural = /s$/.test(firstWord) && firstWord.length > 3

  // Buscamos cualquier keyword femenina (en singular o plural) en
  // el nombre o la categoría
  const haystack = `${name} ${category?.name ?? ''}`.toLowerCase()
  const isFem = FEM_KEYWORDS.some((w) => new RegExp(`\\b${w}s?\\b`).test(haystack))

  return `${isFem ? 'fem' : 'masc'}-${isPlural ? 'p' : 's'}` as Form
}

const OPENERS: Record<Form, string[]> = {
  'fem-s':  ['¡Vendo esta {X}!',  '¡A la venta esta {X}!',  '¡Hola! Vendo esta {X}!',  '¡Pongo a la venta esta {X}!'],
  'fem-p':  ['¡Vendo estas {X}!', '¡A la venta estas {X}!', '¡Hola! Vendo estas {X}!', '¡Pongo a la venta estas {X}!'],
  'masc-s': ['¡Vendo este {X}!',  '¡A la venta este {X}!',  '¡Hola! Vendo este {X}!',  '¡Pongo a la venta este {X}!'],
  'masc-p': ['¡Vendo estos {X}!', '¡A la venta estos {X}!', '¡Hola! Vendo estos {X}!', '¡Pongo a la venta estos {X}!'],
}

const CONDITIONS: Record<Form, string[]> = {
  'fem-s': [
    'Está como nueva, apenas la he usado.',
    'En perfecto estado, casi sin estrenar.',
    'Impecable, sin defectos.',
    'Apenas usada, en muy buen estado.',
    'Como recién comprada.',
  ],
  'fem-p': [
    'Están como nuevas, apenas las he usado.',
    'En perfecto estado, casi sin estrenar.',
    'Impecables, sin defectos.',
    'Apenas usadas, en muy buen estado.',
    'Como recién compradas.',
  ],
  'masc-s': [
    'Está como nuevo, apenas lo he usado.',
    'En perfecto estado, casi sin estrenar.',
    'Impecable, sin defectos.',
    'Apenas usado, en muy buen estado.',
    'Como recién comprado.',
  ],
  'masc-p': [
    'Están como nuevos, apenas los he usado.',
    'En perfecto estado, casi sin estrenar.',
    'Impecables, sin defectos.',
    'Apenas usados, en muy buen estado.',
    'Como recién comprados.',
  ],
}

const CLOSERS = [
  'Si te interesa o tienes alguna duda, escríbeme 😊',
  'Cualquier duda, pregúntame 😊',
  '¡Pregúntame lo que necesites! 😊',
  'Si quieres más fotos o info, escríbeme 😊',
  '¡Si te gusta, no dudes en escribirme! 😊',
  'Aquí estoy para cualquier pregunta 😊',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** ¿El color ya está mencionado (literalmente o como adjetivo) en el nombre? */
function colorAlreadyInName(name: string, color: string): boolean {
  const n = name.toLowerCase()
  const c = color.toLowerCase()
  if (n.includes(c)) return true
  // Comparar por raíz: "Blanco" -> "blan" coincide con "blanca"
  const stem = c.slice(0, Math.min(4, c.length))
  return stem.length >= 3 && n.includes(stem)
}

function formatEUR(p: number): string {
  return p.toFixed(2).replace(/\.00$/, '').replace('.', ',')
}

/** Junta una lista de colores con la conjunción adecuada: "blanco", "blanco y negro", "blanco, negro y gris". */
function colorsToText(colors: string[]): string {
  if (colors.length === 0) return ''
  const lc = colors.map((c) => c.toLowerCase())
  if (lc.length === 1) return lc[0]
  if (lc.length === 2) return `${lc[0]} y ${lc[1]}`
  return `${lc.slice(0, -1).join(', ')} y ${lc[lc.length - 1]}`
}

/** Devuelve los colores de la prenda (manejando legacy `color` por backward compat). */
function getColors(clothe: Clothe): string[] {
  if (clothe.colors && clothe.colors.length > 0) return clothe.colors
  if (clothe.color) return [clothe.color]
  return []
}

function buildDetails(clothe: Clothe): string {
  const parts: string[] = [clothe.name.toLowerCase()]
  const allColors = getColors(clothe)
  const visibleColors = allColors.filter((c) => !colorAlreadyInName(clothe.name, c))
  if (visibleColors.length > 0) {
    parts.push(`en ${colorsToText(visibleColors)}`)
  }
  if (clothe.brand) parts.push(`de ${clothe.brand}`)
  if (clothe.size) parts.push(`talla ${clothe.size}`)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

function materialLine(clothe: Clothe): string | null {
  if (!clothe.material || !clothe.material.trim()) return null
  return `Composición: ${clothe.material.trim()}.`
}

/**
 * Descripción larga, tono cercano y natural, ideal para Wallapop.
 * Las "notas" del usuario, si existen, sustituyen a la frase de estado.
 */
export function generateDescription(clothe: Clothe, category?: Category): string {
  const form = inferForm(clothe.name, category)
  const head = pick(OPENERS[form]).replace('{X}', buildDetails(clothe))

  const lines: string[] = [head]
  if (clothe.notes && clothe.notes.trim()) {
    lines.push(clothe.notes.trim())
  } else {
    lines.push(pick(CONDITIONS[form]))
  }
  const ml = materialLine(clothe)
  if (ml) lines.push(ml)
  if (clothe.price) {
    lines.push(`Lo dejo en ${formatEUR(clothe.price)}€.`)
  }
  lines.push(pick(CLOSERS))
  return lines.join('\n\n')
}

/** Slug ASCII para hashtags (sin acentos, sin espacios, minúsculas). */
function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Descripción de PRODUCTO (ficha catalográfica). Neutra, descriptiva,
 * sin tono comercial ni precio ni cierre. Útil dentro de Mi Armario
 * para tener una mini-ficha de la prenda lista para copiar/compartir.
 */
export function generateProductDescription(clothe: Clothe, category?: Category): string {
  const lines: string[] = []

  // Cabecera: nombre con la info esencial
  const head: string[] = [clothe.name]
  if (clothe.brand) head.push(clothe.brand)
  if (clothe.size) head.push(`Talla ${clothe.size}`)
  if (clothe.color && !colorAlreadyInName(clothe.name, clothe.color)) head.push(clothe.color)
  lines.push(head.join(' · '))

  // Línea de categoría si está
  if (category) {
    lines.push(`Categoría: ${category.name}.`)
  }

  // Composición/material
  const ml = materialLine(clothe)
  if (ml) lines.push(ml)

  // Etiquetas como descriptores
  if (clothe.tags && clothe.tags.length > 0) {
    lines.push(`Estilo: ${clothe.tags.join(', ')}.`)
  }

  // Notas del usuario
  if (clothe.notes && clothe.notes.trim()) {
    lines.push(clothe.notes.trim())
  }

  return lines.join('\n\n').trim()
}

/**
 * Descripción corta con hashtags, ideal para Vinted.
 */
export function generateShortDescription(clothe: Clothe, category?: Category): string {
  const form = inferForm(clothe.name, category)
  const header: string[] = [clothe.name]
  if (clothe.brand) header.push(clothe.brand)
  if (clothe.size) header.push(`Talla ${clothe.size}`)
  const visibleColors = getColors(clothe).filter((c) => !colorAlreadyInName(clothe.name, c))
  if (visibleColors.length > 0) header.push(visibleColors.join(' / '))

  const body = clothe.notes?.trim() || pick(CONDITIONS[form])

  const tags = new Set<string>()
  if (clothe.brand) tags.add(`#${slug(clothe.brand)}`)
  if (category) tags.add(`#${slug(category.name)}`)
  for (const c of getColors(clothe)) tags.add(`#${slug(c)}`)
  if (clothe.size) tags.add(`#talla${slug(clothe.size)}`)
  tags.add('#segundamano'); tags.add('#ropa')

  return `${header.join(' · ')}\n\n${body}\n\n${[...tags].join(' ')}`.trim()
}
