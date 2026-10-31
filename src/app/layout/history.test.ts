import { describe, expect, it } from 'vitest'
import { createMemoryRouter } from 'react-router-dom'
import { canGoBack, trackHistory } from './history'

function setup() {
  const router = createMemoryRouter([{ path: '/' }, { path: '/a' }, { path: '/b' }, { path: '/c' }], {
    initialEntries: ['/'],
  })
  trackHistory(router)
  return router
}

describe('canGoBack', () => {
  it('is false on the first screen', () => {
    setup()
    expect(canGoBack()).toBe(false)
  })

  it('is false after a tab switch replaced the first screen', async () => {
    const router = setup()
    await router.navigate('/a', { replace: true })
    expect(canGoBack()).toBe(false)
  })

  it('follows pushes and pops', async () => {
    const router = setup()
    await router.navigate('/a')
    await router.navigate('/b')
    expect(canGoBack()).toBe(true)
    await router.navigate(-1)
    expect(router.state.location.pathname).toBe('/a')
    expect(canGoBack()).toBe(true)
    await router.navigate(-1)
    expect(router.state.location.pathname).toBe('/')
    expect(canGoBack()).toBe(false)
  })

  it('drops forward entries on a push after going back', async () => {
    const router = setup()
    await router.navigate('/a')
    await router.navigate('/b')
    await router.navigate(-1)
    await router.navigate('/c')
    await router.navigate(-1)
    expect(router.state.location.pathname).toBe('/a')
    await router.navigate(-1)
    expect(canGoBack()).toBe(false)
  })
})
