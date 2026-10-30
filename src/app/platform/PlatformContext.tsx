import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { isPlatform, isShellMessage, type Platform } from '@/shared/bridge'

const PlatformContext = createContext<Platform>('ios')

export const isEmbedded = () => window.parent !== window

/** `?platform=` from the shell wins; standalone on a real phone falls back to the user agent. */
export function initialPlatform(): Platform {
  const fromQuery = new URLSearchParams(window.location.search).get('platform')
  if (isPlatform(fromQuery)) return fromQuery
  return /android/i.test(navigator.userAgent) ? 'android' : 'ios'
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<Platform>(initialPlatform)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.platform = platform
    root.dataset.frame = isEmbedded() ? 'simulator' : 'standalone'
  }, [platform])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !isShellMessage(e.data)) return
      if (e.data.type === 'platform') setPlatform(e.data.platform)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useAndroidRipple(platform)

  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>
}

export function usePlatform(): Platform {
  return useContext(PlatformContext)
}

/** Material ripple on every `.pressable` element while the Android skin is active. */
function useAndroidRipple(platform: Platform) {
  useEffect(() => {
    if (platform !== 'android') return
    const onPointerDown = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>('.pressable')
      if (!target || (target as HTMLButtonElement).disabled) return
      const rect = target.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`
      target.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true })
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [platform])
}
