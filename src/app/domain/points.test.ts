import { describe, expect, it } from 'vitest'
import { calcPoints, clampWeight, impactEquivalents, parseScaleWeight } from './points'
import { WASTE_TYPES } from '@/app/data/seed'

describe('calcPoints (BR-01, BR-02)', () => {
  it('matches the mockup: 2 kg paper + 1 kg PET + 0.5 kg aluminum = 45 points', () => {
    const items = [
      { code: 'paper' as const, weightKg: 2 },
      { code: 'pet' as const, weightKg: 1 },
      { code: 'aluminum' as const, weightKg: 0.5 },
    ]
    expect(calcPoints(items, WASTE_TYPES)).toBe(45)
  })

  it('rounds each line: 0.5 kg PET (7.5) gives 8 points', () => {
    expect(calcPoints([{ code: 'pet', weightKg: 0.5 }], WASTE_TYPES)).toBe(8)
  })

  it('gives 0 points when every weight is 0', () => {
    expect(calcPoints([{ code: 'paper', weightKg: 0 }], WASTE_TYPES)).toBe(0)
  })
})

describe('clampWeight (BR-03)', () => {
  it('never goes below 0', () => {
    expect(clampWeight(-0.5)).toBe(0)
  })

  it('snaps to 0.5 kg steps', () => {
    expect(clampWeight(1.3)).toBe(1.5)
    expect(clampWeight(1.2)).toBe(1)
  })
})

describe('impactEquivalents', () => {
  it('maps 8.5 kg to ~17 bottles, ~4 kg paper and ~8 cans as in the mockup', () => {
    expect(impactEquivalents(8.5)).toEqual({ petBottles500ml: 17, paperKg: 4, aluminumCans: 8 })
  })
})

describe('parseScaleWeight (staff enters the scale reading)', () => {
  it('accepts a dot or a comma as decimal separator', () => {
    expect(parseScaleWeight('2.4')).toBe(2.4)
    expect(parseScaleWeight(' 2,4 ')).toBe(2.4)
  })

  it('rounds to the 0.1 kg precision of the scale', () => {
    expect(parseScaleWeight('1.26')).toBe(1.3)
  })

  it('treats an empty field as 0 kg', () => {
    expect(parseScaleWeight('')).toBe(0)
  })

  it('rejects text, negative numbers and values beyond the scale capacity', () => {
    expect(parseScaleWeight('abc')).toBeNull()
    expect(parseScaleWeight('-1')).toBeNull()
    expect(parseScaleWeight('501')).toBeNull()
  })
})
