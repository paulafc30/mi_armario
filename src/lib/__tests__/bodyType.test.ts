import { describe, expect, it } from 'vitest'
import { BODY_TYPE_LABELS, BODY_TYPE_TIPS, calculateBodyType } from '@/lib/bodyType'

describe('calculateBodyType', () => {
  it('returns null si faltan medidas esenciales', () => {
    expect(calculateBodyType({})).toBeNull()
    expect(calculateBodyType({ bust_cm: 90 })).toBeNull()
    expect(calculateBodyType({ bust_cm: 90, waist_cm: 70 })).toBeNull()
    expect(calculateBodyType({ bust_cm: null, waist_cm: 70, hips_cm: 90 })).toBeNull()
  })

  it('returns null con valores no positivos', () => {
    expect(calculateBodyType({ bust_cm: 0, waist_cm: 70, hips_cm: 90 })).toBeNull()
    expect(calculateBodyType({ bust_cm: 90, waist_cm: -1, hips_cm: 90 })).toBeNull()
  })

  it('detecta reloj de arena (pecho≈cadera, cintura marcada)', () => {
    expect(calculateBodyType({ bust_cm: 90, waist_cm: 68, hips_cm: 92 })).toBe('hourglass')
    expect(calculateBodyType({ bust_cm: 92, waist_cm: 70, hips_cm: 92 })).toBe('hourglass')
  })

  it('detecta pera (cadera más ancha que pecho)', () => {
    expect(calculateBodyType({ bust_cm: 85, waist_cm: 72, hips_cm: 100 })).toBe('pear')
    expect(calculateBodyType({ bust_cm: 80, waist_cm: 65, hips_cm: 95 })).toBe('pear')
  })

  it('detecta triángulo invertido (pecho mucho más ancho que cadera)', () => {
    expect(calculateBodyType({ bust_cm: 100, waist_cm: 80, hips_cm: 88 })).toBe('inverted_triangle')
  })

  it('detecta manzana (cintura ≥ cadera - 3)', () => {
    expect(calculateBodyType({ bust_cm: 92, waist_cm: 92, hips_cm: 94 })).toBe('apple')
  })

  it('detecta rectángulo cuando no encaja en ningún otro tipo', () => {
    // Pecho≈cadera (3cm diff) pero cintura no muy marcada (12cm diff): rectangle
    expect(calculateBodyType({ bust_cm: 90, waist_cm: 78, hips_cm: 92 })).toBe('rectangle')
  })

  it('todos los tipos tienen label y tips', () => {
    const types = ['hourglass', 'pear', 'inverted_triangle', 'rectangle', 'apple'] as const
    for (const t of types) {
      expect(BODY_TYPE_LABELS[t]).toBeTruthy()
      expect(BODY_TYPE_TIPS[t].length).toBeGreaterThan(0)
    }
  })
})
