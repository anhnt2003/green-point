import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { isShellMessage, postToShell } from '@/shared/bridge'
import { FeedbackHost } from '@/app/feedback/FeedbackHost'
import { useFeedback } from '@/app/feedback/useFeedback'
import { canGoBack } from '@/app/layout/history'
import { PlatformProvider } from '@/app/platform/PlatformContext'
import { useStore } from '@/app/store/useStore'
import { createAppRouter, homeOf, type AppRouter } from './routing'

function currentRole() {
  const { session, users } = useStore.getState()
  return session ? (users[session.userId]?.role ?? null) : null
}

/** Handles commands from the simulator toolbar and reports the current route back. */
function useShellBridge(router: AppRouter) {
  useEffect(() => {
    const report = () => postToShell({ type: 'route', path: router.state.location.pathname, role: currentRole() })

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !isShellMessage(e.data)) return
      const store = useStore.getState()
      useFeedback.getState().closeDialog('cancel')
      switch (e.data.type) {
        case 'loginAs':
          store.loginAs(e.data.role)
          void router.navigate(homeOf(e.data.role), { replace: true })
          break
        case 'logout':
          store.logout()
          void router.navigate('/welcome', { replace: true })
          break
        case 'reset':
          store.reset()
          void router.navigate('/welcome', { replace: true })
          break
        case 'back': {
          // Like the header's back button: with nothing to go back to, a tab goes to the home tab.
          const role = currentRole()
          if (canGoBack()) void router.navigate(-1)
          else if (role && router.state.location.pathname !== homeOf(role)) {
            void router.navigate(homeOf(role), { replace: true })
          }
          break
        }
      }
    }

    window.addEventListener('message', onMessage)
    const unsubscribeRouter = router.subscribe(report)
    const unsubscribeStore = useStore.subscribe((s, prev) => s.session !== prev.session && report())
    postToShell({ type: 'ready' })
    report()
    return () => {
      window.removeEventListener('message', onMessage)
      unsubscribeRouter()
      unsubscribeStore()
    }
  }, [router])
}

export function App() {
  const [router] = useState(createAppRouter)
  useShellBridge(router)
  return (
    <PlatformProvider>
      <RouterProvider router={router} />
      <FeedbackHost />
    </PlatformProvider>
  )
}
