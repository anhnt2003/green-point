import { describe, expect, it } from 'vitest'
import { formatDateTime, formatDistanceKm, formatKg, formatMillions, formatPoints, normalizeSearch } from './format'

describe('format', () => {
  it('formats weights like the mockup', () => {
    expect(formatKg(8.5)).toBe('8.5 kg')
    expect(formatKg(2)).toBe('2 kg')
    expect(formatKg(1250)).toBe('1.250 kg')
  })

  it('formats points with sign', () => {
    expect(formatPoints(245)).toBe('245 điểm')
    expect(formatPoints(45, true)).toBe('+45 điểm')
    expect(formatPoints(-200, true)).toBe('-200 điểm')
  })

  it('formats revenue in millions', () => {
    expect(formatMillions(8_500_000)).toBe('8.5 triệu')
    expect(formatMillions(12_000_000)).toBe('12 triệu')
  })

  it('formats date-time as HH:mm - dd/MM/yyyy', () => {
    expect(formatDateTime('2025-04-15T12:30:00')).toBe('12:30 - 15/04/2025')
    expect(formatDateTime('2025-03-15T09:05:00')).toBe('09:05 - 15/03/2025')
  })

  it('formats distance like the mockup under 10 km', () => {
    expect(formatDistanceKm(0.752)).toBe('0.8 km')
    expect(formatDistanceKm(3.04)).toBe('3.0 km')
  })

  it('formats very short distances in metres', () => {
    expect(formatDistanceKm(0.034)).toBe('30 m')
    expect(formatDistanceKm(0.004)).toBe('0 m')
  })

  it('formats long distances as whole kilometres with a thousands separator', () => {
    expect(formatDistanceKm(12.6)).toBe('13 km')
    expect(formatDistanceKm(1143.4)).toBe('1.143 km')
  })

  it('strips Vietnamese diacritics for search', () => {
    expect(normalizeSearch('Lê Thanh Nghị')).toBe('le thanh nghi')
    expect(normalizeSearch('Đại Cồ Việt')).toBe('dai co viet')
  })
})
