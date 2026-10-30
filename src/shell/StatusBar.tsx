import type { Platform } from '@/shared/bridge'
import styles from './shell.module.css'

function IosIcons() {
  return (
    <span className={styles.sbIcons}>
      <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
        <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor" />
        <rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor" />
        <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
        <path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.3-1.3A10.5 10.5 0 0 0 8 .3 10.5 10.5 0 0 0 .5 3.4l1.3 1.3A8.7 8.7 0 0 1 8 2.2Z" fill="currentColor" />
        <path d="M8 5.6c1.5 0 2.8.6 3.8 1.5l1.3-1.3A7.2 7.2 0 0 0 8 3.7c-2 0-3.8.8-5.1 2.1l1.3 1.3c1-.9 2.3-1.5 3.8-1.5Z" fill="currentColor" />
        <path d="M8 9c.6 0 1.1.2 1.5.6L8 11.1 6.5 9.6C6.9 9.2 7.4 9 8 9Z" fill="currentColor" />
        <path d="M8 7.2c1 0 1.9.4 2.6 1l-1.1 1.1A2.1 2.1 0 0 0 8 8.8c-.6 0-1.1.2-1.5.5L5.4 8.2c.7-.6 1.6-1 2.6-1Z" fill="currentColor" />
      </svg>
      <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
        <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity="0.4" />
        <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
        <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity="0.45" />
      </svg>
    </span>
  )
}

function AndroidIcons() {
  return (
    <span className={styles.sbIcons}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21 1 8.5A16.5 16.5 0 0 1 23 8.5Z" fill="currentColor" />
      </svg>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 22 22 2v20Z" fill="currentColor" />
      </svg>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 2h6v2h2a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2Z" fill="currentColor" />
      </svg>
    </span>
  )
}

/** Drawn by the shell over the app iframe; the app reserves --safe-top for it. */
export function StatusBar({ platform }: { platform: Platform }) {
  return (
    <div className={`${styles.statusBar} ${platform === 'ios' ? styles.sbIos : styles.sbAndroid}`} aria-hidden="true">
      <span className={styles.sbTime}>9:41</span>
      {platform === 'ios' ? <IosIcons /> : <AndroidIcons />}
    </div>
  )
}
