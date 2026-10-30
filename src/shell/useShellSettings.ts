import { useEffect, useState } from 'react'
import { isPlatform, type Platform } from '@/shared/bridge'

export type ZoomMode = 'fit' | 'actual'

interface ShellSettings {
  platform: Platform
  zoom: ZoomMode
  /** Simulator toolbar visible. Hidden by default on phone-sized screens. */
  menu: boolean
}

export const isNarrowScreen = () => window.matchMedia('(max-width: 640px)').matches

const KEY = 'greenpoint:simulator'

function load(): ShellSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<ShellSettings>
    return {
      platform: isPlatform(raw.platform) ? raw.platform : 'ios',
      zoom: raw.zoom === 'actual' ? 'actual' : 'fit',
      menu: typeof raw.menu === 'boolean' ? raw.menu : !isNarrowScreen(),
    }
  } catch {
    return { platform: 'ios', zoom: 'fit', menu: !isNarrowScreen() }
  }
}

/** Simulator preferences, remembered across reloads (per browser). */
export function useShellSettings() {
  const [settings, setSettings] = useState(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      // Private mode or blocked storage: settings just won't persist.
    }
  }, [settings])
  return [settings, setSettings] as const
}
