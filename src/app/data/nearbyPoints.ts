import { COLLECTION_POINTS } from '@/app/data/seed'
import { haversineKm, type LatLng } from '@/app/domain/geo'
import type { CollectionPoint } from '@/app/domain/types'

/** Grid cell size in degrees (~1.6 km). Each cell holds one demo point. */
const CELL_DEG = 0.015
/** Cells generated on each side of the user's cell: 5×5 cells always contain the true nearest point. */
const RINGS = 2
/** No demo points this close to a seed point, so the Hanoi area stays as in the mockup. */
const SEED_ZONE_KM = 2

const PREFIXES = ['Điểm thu gom', 'Trạm tái chế'] as const
const NAMES = ['Xanh', 'Lá Xanh', 'Tuần Hoàn', 'Mầm Xanh', 'Phố Sạch', 'Sống Xanh', 'Đất Lành', 'Ve Chai Xanh'] as const

/** Deterministic 32-bit hash of a cell and a field salt, so a cell always gets the same point. */
function hashCell(i: number, j: number, salt: number): number {
  let h = Math.imul(i, 0x27d4eb2d) ^ Math.imul(j, 0x165667b1) ^ Math.imul(salt, 0x9e3779b9)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}

function demoPoint(i: number, j: number): CollectionPoint {
  const rand = (salt: number) => hashCell(i, j, salt) / 2 ** 32
  const pick = <T>(list: readonly T[], salt: number) => list[Math.floor(rand(salt) * list.length)]
  return {
    id: `demo-${i}-${j}`,
    name: `${pick(PREFIXES, 3)} ${pick(NAMES, 4)}`,
    address: 'Điểm mẫu quanh vị trí của bạn',
    // Inside the middle 80% of the cell, so neighbouring points do not pile up on a border.
    lat: (i + 0.1 + 0.8 * rand(1)) * CELL_DEG,
    lng: (j + 0.1 + 0.8 * rand(2)) * CELL_DEG,
    accepts: [...pick(COLLECTION_POINTS, 5).accepts],
    openHours: pick(COLLECTION_POINTS, 6).openHours,
  }
}

/**
 * Seed points plus demo points around `origin`. Demo points are pinned to a world grid,
 * not to the user: GPS jitter does not move them, and new ones appear as the user travels.
 */
export function collectionPointsNear(origin: LatLng): CollectionPoint[] {
  const ci = Math.floor(origin.lat / CELL_DEG)
  const cj = Math.floor(origin.lng / CELL_DEG)
  const demo: CollectionPoint[] = []
  for (let i = ci - RINGS; i <= ci + RINGS; i++) {
    for (let j = cj - RINGS; j <= cj + RINGS; j++) {
      const point = demoPoint(i, j)
      if (COLLECTION_POINTS.every((seed) => haversineKm(seed, point) > SEED_ZONE_KM)) demo.push(point)
    }
  }
  return [...COLLECTION_POINTS, ...demo]
}
