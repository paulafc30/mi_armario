import { describe, expect, it } from 'vitest'
import { checkFit, FIT_META } from '@/lib/sizeFit'

describe('checkFit', () => {
  it('returns unknown sin talla o sin medidas', () => {
    expect(checkFit(null, { waist_cm: 70 })).toBe('unknown')
    expect(checkFit('', { waist_cm: 70 })).toBe('unknown')
    expect(checkFit('M', {})).toBe('unknown')
  })

  it('returns unknown con talla no reconocida', () => {
    expect(checkFit('zzzz', { waist_cm: 70 })).toBe('unknown')
  })

  it('M con cintura 70 cuadra (rango 68-72)', () => {
    expect(checkFit('M', { waist_cm: 70 })).toBe('fits')
  })

  it('M con cintura 75 queda justa', () => {
    expect(checkFit('M', { waist_cm: 75 })).toBe('tight')
  })

  it('M con cintura 78 queda demasiado pequeña', () => {
    expect(checkFit('M', { waist_cm: 78 })).toBe('too_tight')
  })

  it('M con cintura 66 queda holgada', () => {
    expect(checkFit('M', { waist_cm: 66 })).toBe('loose')
  })

  it('M con cintura 58 queda demasiado grande', () => {
    expect(checkFit('M', { waist_cm: 58 })).toBe('too_loose')
  })

  it('normaliza tallas numéricas (38 → M)', () => {
    expect(checkFit('38', { waist_cm: 70 })).toBe('fits')
    expect(checkFit('36', { waist_cm: 66 })).toBe('fits') // 36 → S
  })

  it('acepta prefijo "Talla M"', () => {
    expect(checkFit('Talla M', { waist_cm: 70 })).toBe('fits')
  })

  it('devuelve el veredicto más severo entre varias medidas', () => {
    // M: waist 68-72, hips 92-96.
    // waist=70 (fits) + hips=105 (too_tight) → too_tight
    expect(checkFit('M', { waist_cm: 70, hips_cm: 105 })).toBe('too_tight')
  })

  it('FIT_META tiene label para todos los verdicts', () => {
    const all = ['fits', 'tight', 'loose', 'too_tight', 'too_loose', 'unknown'] as const
    for (const v of all) {
      expect(FIT_META[v].label).toBeTruthy()
      expect(FIT_META[v].className).toBeTruthy()
    }
  })
})
