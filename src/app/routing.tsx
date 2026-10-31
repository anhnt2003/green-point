import { Navigate, Outlet, createMemoryRouter, useRouteError, type RouteObject } from 'react-router-dom'
import type { Role } from '@/app/domain/types'
import type { RouteHandle } from '@/app/layout/BottomNav'
import { trackHistory } from '@/app/layout/history'
import { TabLayout } from '@/app/layout/TabLayout'
import { BusinessHomeScreen } from '@/app/screens/business/BusinessHomeScreen'
import { BusinessProfileScreen } from '@/app/screens/business/BusinessProfileScreen'
import { GreenCapitalScreen } from '@/app/screens/business/GreenCapitalScreen'
import { ManageScreen } from '@/app/screens/business/ManageScreen'
import { ReceiveScreen } from '@/app/screens/business/ReceiveScreen'
import { ScanScreen } from '@/app/screens/business/ScanScreen'
import { AddExpenseScreen, ExpensesScreen } from '@/app/screens/business/ExpensesScreen'
import { InventoryScreen, SellStockScreen } from '@/app/screens/business/InventoryScreen'
import { LoanScreen } from '@/app/screens/business/LoanScreen'
import { ReportsScreen } from '@/app/screens/business/ReportsScreen'
import { HistoryScreen } from '@/app/screens/HistoryScreen'
import { HomeScreen } from '@/app/screens/HomeScreen'
import { ImpactScreen } from '@/app/screens/ImpactScreen'
import { LoginScreen } from '@/app/screens/LoginScreen'
import { MyRewardScreen, MyRewardsScreen } from '@/app/screens/MyRewardsScreen'
import { NotificationsScreen } from '@/app/screens/NotificationsScreen'
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
              { path: '/my-rewards', element: <MyRewardsScreen />, handle: tab('home') },
              { path: '/my-rewards/:id', element: <MyRewardScreen />, handle: tab('home') },
              { path: '/notifications', element: <NotificationsScreen />, handle: tab('home') },
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
              { path: 'capital/:id', element: <LoanScreen />, handle: tab('finance') },
              { path: 'inventory', element: <InventoryScreen />, handle: tab('manage') },
              { path: 'reports', element: <ReportsScreen />, handle: tab('manage') },
              { path: 'expenses', element: <ExpensesScreen />, handle: tab('manage') },
            ],
          },
          // Staff receiving flow (F-07): full-screen, no bottom navigation.
          { path: 'scan', element: <ScanScreen /> },
          { path: 'receive/:code', element: <ReceiveScreen /> },
          // Forms: full-screen, no bottom navigation.
          { path: 'inventory/sell', element: <SellStockScreen /> },
          { path: 'expenses/new', element: <AddExpenseScreen /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

export function createAppRouter() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] })
  trackHistory(router)
  return router
}

export type AppRouter = ReturnType<typeof createAppRouter>
