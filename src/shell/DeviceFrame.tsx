import type { ReactNode } from 'react'
import type { Platform } from '@/shared/bridge'
import { DEVICES, SCREEN, frameSize } from './device'
import { StatusBar } from './StatusBar'
import styles from './shell.module.css'

/** Phone hardware: bezel, side buttons, camera cut-out, status bar and home indicator. */
export function DeviceFrame({ platform, children }: { platform: Platform; children: ReactNode }) {
  const spec = DEVICES[platform]
  const size = frameSize(platform)
  const isIos = platform === 'ios'

  return (
    <div
      className={`${styles.device} ${isIos ? styles.deviceIos : styles.deviceAndroid}`}
      style={{ width: size.width, height: size.height, borderRadius: spec.outerRadius }}
    >
      {isIos ? (
        <>
          <span className={styles.sideButton} style={{ left: -3, top: 150, height: 32 }} />
          <span className={styles.sideButton} style={{ left: -3, top: 210, height: 60 }} />
          <span className={styles.sideButton} style={{ left: -3, top: 284, height: 60 }} />
          <span className={styles.sideButton} style={{ right: -3, top: 240, height: 96 }} />
        </>
      ) : (
        <>
          <span className={styles.sideButton} style={{ right: -3, top: 170, height: 56 }} />
          <span className={styles.sideButton} style={{ right: -3, top: 260, height: 110 }} />
        </>
      )}

      <div
        className={styles.screen}
        style={{ inset: spec.bezel, width: SCREEN.width, height: SCREEN.height, borderRadius: spec.screenRadius }}
      >
        {children}
        <StatusBar platform={platform} />
        {isIos ? <span className={styles.island} /> : <span className={styles.punchHole} />}
        <span className={isIos ? styles.homeIndicator : styles.gestureBar} />
      </div>
    </div>
  )
}
