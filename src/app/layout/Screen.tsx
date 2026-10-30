import { createContext, useContext, useState, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import styles from './layout.module.css'

/** True when the screen is rendered above a BottomNav (the nav owns the bottom safe area). */
export const InTabsContext = createContext(false)

interface ScreenProps {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  /** Default true. Map screen sets false and manages its own layout. */
  scroll?: boolean
  className?: string
  bodyClassName?: string
}

/**
 * One phone screen: fixed header, scrollable body, optional fixed footer.
 * Plays the platform page transition on mount (push / pop / replace).
 */
export function Screen({ header, footer, children, scroll = true, className = '', bodyClassName = '' }: ScreenProps) {
  const inTabs = useContext(InTabsContext)
  const navType = useNavigationType()
  const hint = (useLocation().state as { transition?: 'push' | 'pop' } | null)?.transition
  const [enterClass] = useState(() => {
    const kind = hint ?? (navType === 'PUSH' ? 'push' : navType === 'POP' ? 'pop' : 'replace')
    return `page-enter-${kind}`
  })

  return (
    <div className={`${styles.screen} ${enterClass} ${className}`}>
      {header ?? <div className={styles.safeTop} />}
      <div
        className={`${styles.body} ${scroll ? styles.scroll : styles.noScroll} ${
          !footer && !inTabs ? styles.padSafeBottom : ''
        } ${bodyClassName}`}
      >
        {children}
      </div>
      {footer && <div className={`${styles.footer} ${!inTabs ? styles.padSafeBottom : ''}`}>{footer}</div>}
    </div>
  )
}
