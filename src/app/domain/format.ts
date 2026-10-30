const intFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 })

/** 1250 → "1.250" (vi-VN thousands separator). */
export function formatInt(value: number): string {
  return intFormat.format(Math.round(value))
}

/** Matches the mockup: "8.5 kg", "0.5 kg", "2 kg", "1.250 kg". */
export function formatKgValue(kg: number): string {
  if (Math.abs(kg) >= 1000) return formatInt(kg)
  const rounded = Math.round(kg * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function formatKg(kg: number): string {
  return `${formatKgValue(kg)} kg`
}

/** 245 → "245 điểm"; signed variant gives "+45 điểm" / "-200 điểm". */
export function formatPoints(points: number, signed = false): string {
  const sign = signed && points > 0 ? '+' : points < 0 ? '-' : ''
  return `${sign}${formatInt(Math.abs(points))} điểm`
}

/** 8_500_000 → "8.5 triệu". */
export function formatMillions(vnd: number): string {
  const millions = Math.round((vnd / 1_000_000) * 10) / 10
  const text = Number.isInteger(millions) ? String(millions) : millions.toFixed(1)
  return `${text} triệu`
}

const pad = (n: number) => String(n).padStart(2, '0')

/** ISO / local date-time → "12:30 - 15/04/2025". */
export function formatDateTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** "30 m" under 100 m, "0.8 km" under 10 km (as in the mockup), "1.143 km" beyond. */
export function formatDistanceKm(km: number): string {
  if (km < 0.1) return `${Math.round((km * 1000) / 10) * 10} m`
  if (km < 10) return `${(Math.round(km * 10) / 10).toFixed(1)} km`
  return `${formatInt(km)} km`
}

/** Strip Vietnamese diacritics for search: "Lê Thanh Nghị" → "le thanh nghi". */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}
