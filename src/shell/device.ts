import type { Platform } from '@/shared/bridge'

/** Logical screen size of the simulated phone (DESIGN.md is measured on a 390pt-wide iPhone). */
export const SCREEN = { width: 390, height: 844 }

export interface DeviceSpec {
  name: string
  bezel: number
  outerRadius: number
  screenRadius: number
}

export const DEVICES: Record<Platform, DeviceSpec> = {
  ios: { name: 'iPhone 15 · iOS', bezel: 12, outerRadius: 59, screenRadius: 47 },
  android: { name: 'Pixel 8 · Android', bezel: 10, outerRadius: 40, screenRadius: 30 },
}

export function frameSize(platform: Platform) {
  const { bezel } = DEVICES[platform]
  return { width: SCREEN.width + bezel * 2, height: SCREEN.height + bezel * 2 }
}

/** The app page, relative to the deploy base ("/" locally, "/green-point/" on GitHub Pages). */
export function appUrl(platform: Platform) {
  return `${import.meta.env.BASE_URL}app.html?platform=${platform}`
}
