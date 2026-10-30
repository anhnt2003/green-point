/**
 * postMessage protocol between the simulator shell (index.html) and the app (app.html in an iframe).
 * Both pages are served from the same origin; messages from any other origin are ignored.
 */
export type Platform = 'ios' | 'android'
export type Role = 'citizen' | 'business'

export type ShellToApp =
  | { source: 'gp-shell'; type: 'platform'; platform: Platform }
  | { source: 'gp-shell'; type: 'loginAs'; role: Role }
  | { source: 'gp-shell'; type: 'logout' }
  | { source: 'gp-shell'; type: 'reset' }
  | { source: 'gp-shell'; type: 'back' }

export type AppToShell =
  | { source: 'gp-app'; type: 'ready' }
  | { source: 'gp-app'; type: 'route'; path: string; role: Role | null }

type Body<T> = T extends unknown ? Omit<T, 'source'> : never

export function isShellMessage(data: unknown): data is ShellToApp {
  return typeof data === 'object' && data !== null && (data as { source?: unknown }).source === 'gp-shell'
}

export function isAppMessage(data: unknown): data is AppToShell {
  return typeof data === 'object' && data !== null && (data as { source?: unknown }).source === 'gp-app'
}

export function postToApp(target: Window | null | undefined, message: Body<ShellToApp>) {
  target?.postMessage({ ...message, source: 'gp-shell' }, window.location.origin)
}

export function postToShell(message: Body<AppToShell>) {
  if (window.parent === window) return
  window.parent.postMessage({ ...message, source: 'gp-app' }, window.location.origin)
}

export const isPlatform = (v: unknown): v is Platform => v === 'ios' || v === 'android'
