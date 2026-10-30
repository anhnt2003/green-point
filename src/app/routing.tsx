import { ChartColumn, Package } from 'lucide-react'
import { Navigate, Outlet, createMemoryRouter, useRouteError, type RouteObject } from 'react-router-dom'
import type { Role } from '@/app/domain/types'
import type { RouteHandle } from '@/app/layout/BottomNav'
import { TabLayout } from '@/app/layout/TabLayout'
import { BusinessHomeScreen } from '@/app/screens/business/BusinessHomeScreen'
import { BusinessProfileScreen } from '@/app/screens/business/BusinessProfileScreen'
import { GreenCapitalScreen } from '@/app/screens/business/GreenCapitalScreen'
import { ManageScreen } from '@/app/screens/business/ManageScreen'
import { ReceiveScreen } from '@/app/screens/business/ReceiveScreen'
import { ScanScreen } from '@/app/screens/business/ScanScreen'
import { PlaceholderScreen } from '@/app/screens/business/PlaceholderScreen'
import { HistoryScreen } from '@/app/screens/HistoryScreen'
import { HomeScreen } from '@/app/screens/HomeScreen'
import { ImpactScreen } from '@/app/screens/ImpactScreen'
import { LoginScreen } from '@/app/screens/LoginScreen'
import { ProfileScreen } from '@/app/screens/ProfileScreen'
import { RecycleConfirmScreen } from '@/app/screens/RecycleConfirmScreen'
import { RecycleSelectScreen } from '@/app/screens/RecycleSelectScreen'
import { RewardsScreen } from '@/app/screens/RewardsScreen'
import { SortingGuideScreen } from '@/app/screens/SortingGuideScreen'
import { WelcomeScreen } from '@/app/screens/WelcomeScreen'
import { useCurrentUser } from '@/app/store/selectors'

export const homeOf = (role: Role) => (role === 'business' ? '/business' : '/')

function RequireRole({ role }: { role: Role }) {
  const user = useCurrentUser()
  if (!user) return <Navigate to="/welcome" replace />
  if (user.role !== role) return <Navigate to={homeOf(user.role)} replace />
  return <Outlet />
}

function PublicOnly() {
  const user = useCurrentUser()
  return user ? <Navigate to={homeOf(user.role)} replace /> : <Outlet />
}

function RouteError() {
  const error = useRouteError()
  console.error(error)
  return (
    <div style={{ padding: 'calc(var(--safe-top) + 24px) 24px', color: 'var(--c-danger)' }}>
      Đã có lỗi khi hiển thị màn hình này.
    </div>
  )
}

const tab = (t: RouteHandle['tab']): RouteHandle => ({ tab: t })

export const routes: RouteObject[] = [
  {
    errorElement: <RouteError />,
    children: [
      {
        element: <PublicOnly />,
        children: [
          { path: '/welcome', element: <WelcomeScreen /> },
          { path: '/login', element: <LoginScreen /> },
        ],
      },
      {
        element: <RequireRole role="citizen" />,
        children: [
          {
            element: <TabLayout kind="citizen" />,
            children: [
              { path: '/', element: <HomeScreen />, handle: tab('home') },
              // MapLibre is ~1 MB: load the map screen on first visit only.
              {
                path: '/map',
                lazy: () => import('@/app/screens/MapScreen').then((m) => ({ Component: m.MapScreen })),
                handle: tab('map'),
              },
              { path: '/history', element: <HistoryScreen />, handle: tab('history') },
              { path: '/profile', element: <ProfileScreen />, handle: tab('profile') },
              // Sub-screens keep the tab highlighted as drawn in the mockup.
              { path: '/rewards', element: <RewardsScreen />, handle: tab('home') },
              { path: '/impact', element: <ImpactScreen />, handle: tab('profile') },
              // F-04 belongs to GreenMap.
              { path: '/guide', element: <SortingGuideScreen />, handle: tab('map') },
            ],
          },
          { path: '/recycle', element: <RecycleSelectScreen /> },
          { path: '/recycle/:code', element: <RecycleConfirmScreen /> },
        ],
      },
      {
        path: '/business',
        element: <RequireRole role="business" />,
        children: [
          {
            element: <TabLayout kind="business" />,
            children: [
              { index: true, element: <BusinessHomeScreen />, handle: tab('home') },
              { path: 'manage', element: <ManageScreen />, handle: tab('manage') },
              { path: 'capital', element: <GreenCapitalScreen />, handle: tab('finance') },
              { path: 'profile', element: <BusinessProfileScreen />, handle: tab('profile') },
              { path: 'inventory', element: <PlaceholderScreen title="Tồn kho" Icon={Package} />, handle: tab('manage') },
              { path: 'reports', element: <PlaceholderScreen title="Báo cáo" Icon={ChartColumn} />, handle: tab('manage') },
            ],
          },
          // Staff receiving flow (F-07): full-screen, no bottom navigation.
          { path: 'scan', element: <ScanScreen /> },
          { path: 'receive/:code', element: <ReceiveScreen /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

export function createAppRouter() {
  return createMemoryRouter(routes, { initialEntries: ['/'] })
}

export type AppRouter = ReturnType<typeof createAppRouter>
