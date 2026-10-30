import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_LOCATION } from '@/app/data/seed'
import type { LatLng } from '@/app/domain/geo'

/**
 * - `locating`: waiting for the first fix (or for the permission prompt).
 * - `live`: real device position.
 * - `denied` / `unavailable` / `unsupported`: showing DEFAULT_LOCATION instead.
 */
export type LocationStatus = 'locating' | 'live' | 'denied' | 'unavailable' | 'unsupported'

export interface UserLocation {
  location: LatLng
  status: LocationStatus
  /** Accuracy radius in metres, when live. */
  accuracyM?: number
  /** Ask again (re-prompts if the user only dismissed the permission dialog). */
  retry(): void
}

type Fix = { location: LatLng; accuracyM: number }

/** Last real fix, kept across screen changes so re-opening the map starts at the right place. */
let lastFix: Fix | null = null

/** Geolocation needs a secure context: https or localhost. */
const isSupported = () => typeof navigator !== 'undefined' && 'geolocation' in navigator && window.isSecureContext

function initialState(): Omit<UserLocation, 'retry'> {
  if (!isSupported()) return { location: DEFAULT_LOCATION, status: 'unsupported' }
  if (lastFix) return { ...lastFix, status: 'live' }
  return { location: DEFAULT_LOCATION, status: 'locating' }
}

/** Watches the real device position while the calling screen is mounted. */
export function useUserLocation(): UserLocation {
  const [state, setState] = useState(initialState)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isSupported()) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        lastFix = {
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracyM: pos.coords.accuracy,
        }
        setState({ ...lastFix, status: 'live' })
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          // Permission revoked or refused: stop using any earlier fix.
          lastFix = null
          setState({ location: DEFAULT_LOCATION, status: 'denied' })
          return
        }
        // Timeout / no signal: keep a live position if we already have one.
        setState((cur) => (cur.status === 'live' ? cur : { location: DEFAULT_LOCATION, status: 'unavailable' }))
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [attempt])

  const retry = useCallback(() => {
    setState((cur) => (cur.status === 'live' ? cur : { location: cur.location, status: 'locating' }))
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, retry }
}
