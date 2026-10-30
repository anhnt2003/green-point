import { formatInt } from '@/app/domain/format'
import { LeafPair } from './illustrations/Logo'
import styles from './ui.module.css'

/** Primary card with the current balance and a white "Đổi quà" pill. */
export function PointsCard({ points, onRedeem }: { points: number; onRedeem(): void }) {
  return (
    <section className={styles.pointsCard} aria-label="Tổng điểm hiện có">
      <span className={styles.pointsLabel}>Tổng điểm hiện có</span>
      <span className={styles.pointsValue}>
        {formatInt(points)} <small>điểm</small>
      </span>
      <LeafPair size={64} className={styles.pointsLeaf} />
      <button type="button" className={`${styles.pointsButton} pressable`} onClick={onRedeem}>
        Đổi quà
      </button>
    </section>
  )
}
