import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { WasteIcon } from '@/app/components/illustrations/WasteIcon'
import { QuantityStepper } from '@/app/components/QuantityStepper'
import { Stepper3 } from '@/app/components/Stepper3'
import { WASTE_TYPES } from '@/app/data/seed'
import { formatInt } from '@/app/domain/format'
import { calcPoints } from '@/app/domain/points'
import type { WasteCode, WasteItem } from '@/app/domain/types'
import { toast } from '@/app/feedback/useFeedback'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useStore } from '@/app/store/useStore'
import common from './common.module.css'
import styles from './RecycleScreens.module.css'

export const RECYCLE_STEPS = ['Chọn loại rác', 'Xác nhận', 'Hoàn tất'] as const

/** Prefilled with the mockup example (2 kg + 1 kg + 0.5 kg = 45 points). */
const INITIAL: Record<WasteCode, number> = { paper: 2, pet: 1, aluminum: 0.5 }

/** Screen 04 — Chọn loại rác & nhập khối lượng. */
export function RecycleSelectScreen() {
  const navigate = useNavigate()
  const createRecycle = useStore((s) => s.createRecycle)
  const [weights, setWeights] = useState(INITIAL)

  const items: WasteItem[] = WASTE_TYPES.map((t) => ({ code: t.code, weightKg: weights[t.code] }))
  const points = calcPoints(items, WASTE_TYPES)

  const submit = () => {
    const res = createRecycle(items)
    if (!res.ok) {
      toast('Vui lòng nhập khối lượng rác', 'error')
      return
    }
    navigate(`/recycle/${res.code}`, { replace: true, state: { transition: 'push' } })
  }

  return (
    <Screen header={<AppHeader title="Đổi rác lấy điểm" />}>
      <div className={common.content}>
        <Stepper3 steps={RECYCLE_STEPS} current={0} />

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Chọn loại rác và nhập khối lượng</h2>
          {WASTE_TYPES.map((type) => (
            <div key={type.code} className={styles.wasteRow}>
              <WasteIcon code={type.code} size={56} />
              <div className={styles.wasteText}>
                <span className={styles.wasteName}>{type.name}</span>
                <span className={styles.wasteRate}>{type.pointsPerKg} điểm/kg</span>
              </div>
              <QuantityStepper
                label={type.name}
                value={weights[type.code]}
                onChange={(v) => setWeights((w) => ({ ...w, [type.code]: v }))}
              />
            </div>
          ))}
        </section>

        <Card tone="tint" radius="lg" className={styles.total}>
          <span className={styles.totalLabel}>Tổng điểm dự kiến</span>
          <span className={styles.totalValue} aria-live="polite">
            {formatInt(points)} <small>điểm</small>
          </span>
        </Card>

        <Button onClick={submit} disabled={points === 0}>
          Tiếp tục
        </Button>
        <button type="button" className={`${styles.guideLink} pressable`} onClick={() => navigate('/guide')}>
          <BookOpen size={16} />
          Xem hướng dẫn phân loại
        </button>
      </div>
    </Screen>
  )
}
