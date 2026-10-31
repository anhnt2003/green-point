import { describe, expect, it } from 'vitest'
import { COLLECTION_POINTS, DEFAULT_LOCATION } from '@/app/data/seed'
import { haversineKm, sortByDistance } from '@/app/domain/geo'
import { collectionPointsNear } from './nearbyPoints'

const HO_CHI_MINH = { lat: 10.7769, lng: 106.7009 }
const DA_NANG = { lat: 16.0544, lng: 108.2022 }

const isDemo = (id: string) => id.startsWith('demo-')

describe('collectionPointsNear', () => {
  it('has a demo point nearby far from the Hanoi seed points', () => {
    for (const origin of [HO_CHI_MINH, DA_NANG]) {
      const nearest = sortByDistance(collectionPointsNear(origin), origin)[0]
      expect(isDemo(nearest.id)).toBe(true)
      expect(nearest.distanceKm).toBeLessThan(2.5)
    }
  })

  it('changes the nearest point when the user travels', () => {
    const nearestIn = (origin: typeof DA_NANG) => sortByDistance(collectionPointsNear(origin), origin)[0].id
    expect(nearestIn(HO_CHI_MINH)).not.toBe(nearestIn(DA_NANG))
  })

  it('keeps points in place when the user moves a little', () => {
    const moved = { lat: HO_CHI_MINH.lat + 0.0027, lng: HO_CHI_MINH.lng } // ~300 m north
    const before = new Map(collectionPointsNear(HO_CHI_MINH).map((p) => [p.id, p]))
    const shared = collectionPointsNear(moved).filter((p) => before.has(p.id))
    expect(shared.length).toBeGreaterThan(COLLECTION_POINTS.length)
    for (const p of shared) expect(p).toEqual(before.get(p.id))
  })

  it('is deterministic with unique ids', () => {
    const points = collectionPointsNear(DA_NANG)
    expect(collectionPointsNear(DA_NANG)).toEqual(points)
    expect(new Set(points.map((p) => p.id)).size).toBe(points.length)
  })

  it('moves a point off water, and leaves out a cell that is all water', () => {
    const dry = collectionPointsNear(DA_NANG).filter((p) => isDemo(p.id))
    const moved = collectionPointsNear(DA_NANG, (p) => p.id.endsWith('-0')).filter((p) => isDemo(p.id))
    expect(moved.map((p) => p.id)).toEqual(dry.map((p) => p.id.replace(/-0$/, '-1')))
    moved.forEach((p, n) => expect(p.lat).not.toBe(dry[n].lat))
    expect(collectionPointsNear(DA_NANG, (p) => isDemo(p.id))).toEqual(COLLECTION_POINTS)
  })

  it('keeps the seed points and leaves the Hanoi seed area as in the mockup', () => {
    const points = collectionPointsNear(DEFAULT_LOCATION)
    expect(points.slice(0, COLLECTION_POINTS.length)).toEqual(COLLECTION_POINTS)
    for (const p of points.filter((p) => isDemo(p.id))) {
      for (const seed of COLLECTION_POINTS) expect(haversineKm(seed, p)).toBeGreaterThan(2)
    }
    const nearest = sortByDistance(points, DEFAULT_LOCATION)[0]
    expect(nearest.id).toBe('green-house')
    expect(nearest.distanceKm.toFixed(1)).toBe('0.8')
  })
})
