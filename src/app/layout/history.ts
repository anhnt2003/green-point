import type { createMemoryRouter } from 'react-router-dom'

type MemoryRouter = ReturnType<typeof createMemoryRouter>

/** Position in the app's history: 0 = nothing to go back to. */
let index = 0

/**
 * Mirrors the memory router's history stack by location key, since React Router does not
 * expose it. Tabs and redirects replace the current entry, so the first entry's key alone
 * cannot tell whether there is a screen to go back to.
 */
export function trackHistory(router: MemoryRouter) {
  const keys = [router.state.location.key]
  index = 0
  return router.subscribe(({ historyAction, location }) => {
    if (location.key === keys[index]) return
    if (historyAction === 'PUSH') keys.splice(++index, keys.length, location.key)
    else if (historyAction === 'REPLACE') keys[index] = location.key
    else index = Math.max(0, keys.lastIndexOf(location.key))
  })
}

export const canGoBack = () => index > 0
