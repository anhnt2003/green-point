import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav, type NavKind } from './BottomNav'
import { InTabsContext } from './Screen'
import styles from './layout.module.css'

/** Screens with a bottom navigation bar. The nav stays mounted while the screen above changes. */
export function TabLayout({ kind }: { kind: NavKind }) {
  const { pathname } = useLocation()
  return (
    <div className={styles.tabLayout}>
      <div className={styles.tabContent}>
        <InTabsContext.Provider value>
          <Outlet key={pathname} />
        </InTabsContext.Provider>
      </div>
      <BottomNav kind={kind} />
    </div>
  )
}
