/**
 * Cálculo del tipo de silueta a partir de las medidas básicas (pecho,
 * cintura, cadera). Los umbrales son aproximaciones estándar utilizadas
 * en moda, no medidas médicas — son una guía para sugerir cortes y
 * prendas que tradicionalmente favorecen cada silueta.
 */

export type BodyType =
  | 'hourglass'           // Reloj de arena
  | 'pear'                // Triángulo / Pera
  | 'inverted_triangle'   // Triángulo invertido
  | 'rectangle'           // Rectángulo / Recto
  | 'apple'               // Redondo / Manzana

export interface BodyMeasurements {
  bust_cm?: number | null
  waist_cm?: number | null
  hips_cm?: number | null
}

/** Devuelve el tipo de silueta o null si faltan medidas esenciales. */
export function calculateBodyType(m: BodyMeasurements): BodyType | null {
  const { bust_cm: bust, waist_cm: waist, hips_cm: hips } = m
  if (bust == null || waist == null || hips == null) return null
  if (bust <= 0 || waist <= 0 || hips <= 0) return null

  const bustHipsDiff = bust - hips
  const bustWaistDiff = bust - waist
  const hipsWaistDiff = hips - waist

  // Reloj de arena: pecho ≈ cadera, cintura claramente más estrecha
  if (Math.abs(bustHipsDiff) <= 5 && bustWaistDiff >= 18 && hipsWaistDiff >= 18) {
    return 'hourglass'
  }

  // Pera: cadera notablemente más ancha que pecho
  if (hips - bust >= 5) {
    return 'pear'
  }

  // Triángulo invertido: pecho/hombros más anchos que cadera
  if (bust - hips >= 5) {
    return 'inverted_triangle'
  }

  // Manzana: cintura ≥ cadera, poca diferencia
  if (waist >= hips - 3) {
    return 'apple'
  }

  // Por defecto, rectángulo
  return 'rectangle'
}

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  hourglass: 'Reloj de arena',
  pear: 'Triángulo (pera)',
  inverted_triangle: 'Triángulo invertido',
  rectangle: 'Rectángulo',
  apple: 'Redondo (manzana)',
}

export const BODY_TYPE_DESCRIPTIONS: Record<BodyType, string> = {
  hourglass:
    'Tu pecho y tu cadera están en proporción y tienes la cintura claramente marcada. Las prendas que destacan la cintura te favorecen mucho.',
  pear:
    'Tu cadera es más ancha que tu pecho, con cintura definida. Te favorece resaltar la parte superior y equilibrar la inferior.',
  inverted_triangle:
    'Tu pecho/hombros son más anchos que tu cadera. Te favorecen prendas que añadan volumen en la parte de abajo.',
  rectangle:
    'Tus medidas son bastante parejas, con poca diferencia entre pecho, cintura y cadera. Crear curvas y marcar cintura te favorece.',
  apple:
    'Acumulas volumen en la zona media del torso. Te favorecen prendas que estilicen el torso y aporten caída.',
}

export const BODY_TYPE_TIPS: Record<BodyType, string[]> = {
  hourglass: [
    'Vestidos cruzados, ceñidos o con cinturón.',
    'Faldas tipo tubo, lápiz o midi ajustadas.',
    'Pantalones de tiro alto que marquen la cintura.',
    'Evita prendas muy amplias que oculten tu silueta.',
  ],
  pear: [
    'Cuellos barco, palabra de honor u off-shoulder para abrir hombros.',
    'Tops con detalles, estampados o colores llamativos.',
    'Pantalones rectos o bootcut; faldas de corte A.',
    'Evita pantalones ceñidos de cadera con tops oscuros lisos.',
  ],
  inverted_triangle: [
    'Pantalones palazzo, plisados o con detalles que añadan volumen abajo.',
    'Cuellos en V para suavizar los hombros.',
    'Faldas con vuelo, estampadas o de colores claros.',
    'Evita hombreras, escotes barco y mangas globo.',
  ],
  rectangle: [
    'Cinturones para crear cintura visualmente.',
    'Tops peplum, vestidos con pinzas o entallados.',
    'Capas y volúmenes añaden curvas.',
    'Tiro alto y vestidos cruzados también funcionan muy bien.',
  ],
  apple: [
    'Cuellos en V y prendas con caída vertical alargan el torso.',
    'Vestidos imperio (costura bajo el pecho).',
    'Tops fluidos con falda con volumen.',
    'Evita prendas muy ceñidas a la cintura.',
  ],
}

/** Mini-resumen para mostrar en una línea (sin saltos). */
export function bodyTypeSummary(type: BodyType): string {
  return BODY_TYPE_DESCRIPTIONS[type].replace(/\s+/g, ' ').trim()
}
