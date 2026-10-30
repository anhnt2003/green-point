import type { WasteCode, WasteItem, WasteType } from './types'

/** BR-03: weight is entered in 0.5 kg steps, never below 0. */
export const WEIGHT_STEP = 0.5
export const WEIGHT_MIN = 0
export const WEIGHT_MAX = 50

/** Electronic scale used by collection-point staff: 0.1 kg precision, 500 kg capacity. */
export const SCALE_PRECISION = 0.1
export const SCALE_MAX_KG = 500

/**
 * Parses the weight a staff member reads off the scale. Accepts "2.4" or "2,4";
 * an empty field means 0 kg. Returns null for anything that is not a valid reading.
 */
export function parseScaleWeight(text: string): number | null {
  const value = text.trim().replace(',', '.')
  if (value === '') return 0
  if (!/^\d+(\.\d+)?$/.test(value)) return null
  const kg = Math.round(Number(value) / SCALE_PRECISION) * SCALE_PRECISION
  const rounded = Math.round(kg * 10) / 10
  return rounded > SCALE_MAX_KG ? null : rounded
}

export function clampWeight(kg: number): number {
  const stepped = Math.round(kg / WEIGHT_STEP) * WEIGHT_STEP
  return Math.min(WEIGHT_MAX, Math.max(WEIGHT_MIN, stepped))
}

/** BR-01/BR-02: points = Σ weight × points-per-kg, rounded per line. */
export function linePoints(item: WasteItem, types: readonly WasteType[]): number {
  const type = types.find((t) => t.code === item.code)
  if (!type) return 0
  return Math.round(item.weightKg * type.pointsPerKg)
}

export function calcPoints(items: readonly WasteItem[], types: readonly WasteType[]): number {
  return items.reduce((sum, item) => sum + linePoints(item, types), 0)
}

export function totalWeight(items: readonly WasteItem[]): number {
  return items.reduce((sum, item) => sum + item.weightKg, 0)
}

export function sumWeights(byType: Record<WasteCode, number>): number {
  return byType.paper + byType.pet + byType.aluminum
}

/**
 * "Tương đương" figures on the impact screen. Coefficients are chosen so the
 * mockup's 8.5 kg maps to ~17 bottles / ~4 kg paper / ~8 cans.
 */
export function impactEquivalents(totalKg: number) {
  return {
    petBottles500ml: Math.round(totalKg * 2),
    paperKg: Math.round(totalKg * 0.47),
    aluminumCans: Math.round(totalKg * 0.94),
  }
}
