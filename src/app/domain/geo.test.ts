import { describe, expect, it } from 'vitest'
import { COLLECTION_POINTS, DEFAULT_LOCATION } from '@/app/data/seed'
import { haversineKm, sortByDistance } from './geo'

describe('haversineKm', () => {
  it('is ~1,140 km between Hanoi and Ho Chi Minh City', () => {
    const km = haversineKm({ lat: 21.0285, lng: 105.8542 }, { lat: 10.7769, lng: 106.7009 })
    expect(km).toBeGreaterThan(1130)
    expect(km).toBeLessThan(1150)
  })
})

describe('sortByDistance', () => {
  it('puts Green-House first at ~0.8 km from the default location (mockup)', () => {
    const sorted = sortByDistance(COLLECTION_POINTS, DEFAULT_LOCATION)
    expect(sorted[0].id).toBe('green-house')
    expect(sorted[0].distanceKm.toFixed(1)).toBe('0.8')
  })

  it('re-sorts for another location', () => {
    const nearThienQuang = { lat: 21.0145, lng: 105.8482 }
    expect(sortByDistance(COLLECTION_POINTS, nearThienQuang)[0].id).toBe('thien-quang')
  })

  it('keeps every point and does not mutate the input', () => {
    const before = COLLECTION_POINTS.map((p) => p.id)
    const sorted = sortByDistance(COLLECTION_POINTS, { lat: 10.7769, lng: 106.7009 })
    expect(sorted).toHaveLength(COLLECTION_POINTS.length)
    expect(COLLECTION_POINTS.map((p) => p.id)).toEqual(before)
  })
})
