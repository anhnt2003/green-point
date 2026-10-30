import { Ban, CircleCheck, CircleX, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { FilterChips, type ChipOption } from '@/app/components/FilterChips'
import { WasteIcon } from '@/app/components/illustrations/WasteIcon'
import { NOT_COLLECTED, SORTING_GUIDE } from '@/app/data/sortingGuide'
import { WASTE_TYPES } from '@/app/data/seed'
import type { WasteCode } from '@/app/domain/types'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import common from './common.module.css'
import styles from './SortingGuideScreen.module.css'

type Filter = 'all' | WasteCode | 'none'

const FILTERS: readonly ChipOption<Filter>[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'paper', label: 'Giấy' },
  { value: 'pet', label: 'Chai nhựa' },
  { value: 'aluminum', label: 'Lon nhôm' },
  { value: 'none', label: 'Không thu nhận' },
]

/** F-04 — Hướng dẫn phân loại rác (GreenMap). */
export function SortingGuideScreen() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const entries = SORTING_GUIDE.filter((e) => filter === 'all' || filter === e.code)

  return (
    <Screen header={<AppHeader title="Hướng dẫn phân loại" align="left" fallback="/map" />}>
      <div className={common.content}>
        <Card tone="tint" className={styles.intro}>
          <Lightbulb size={22} className={styles.introIcon} />
          <p>
            Phân loại ngay tại nhà vào từng túi riêng: giấy, chai nhựa, lon nhôm. Rác khô và sạch được cân nhanh,
            cộng đủ điểm.
          </p>
        </Card>

        <FilterChips options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Loại rác" />

        {filter !== 'none' &&
          entries.map((entry) => {
            const type = WASTE_TYPES.find((t) => t.code === entry.code)
            if (!type) return null
            return (
              <Card key={entry.code} radius="lg" className={styles.card}>
                <div className={styles.cardHead}>
                  <WasteIcon code={entry.code} size={48} />
                  <h2 className={styles.cardTitle}>{type.name}</h2>
                  <span className={styles.rate}>{type.pointsPerKg} điểm/kg</span>
                </div>

                <h3 className={styles.subTitle}>Được nhận</h3>
                <ul className={styles.list}>
                  {entry.accepted.map((text) => (
                    <li key={text}>
                      <CircleCheck size={18} className={styles.yes} />
                      {text}
                    </li>
                  ))}
                </ul>

                <h3 className={styles.subTitle}>Không nhận</h3>
                <ul className={styles.list}>
                  {entry.notAccepted.map((text) => (
                    <li key={text}>
                      <CircleX size={18} className={styles.no} />
                      {text}
                    </li>
                  ))}
                </ul>

                <h3 className={styles.subTitle}>Chuẩn bị trước khi mang đến</h3>
                <ol className={styles.steps}>
                  {entry.prepare.map((text, i) => (
                    <li key={text}>
                      <span className={styles.stepNo}>{i + 1}</span>
                      {text}
                    </li>
                  ))}
                </ol>

                <p className={styles.tip}>
                  <Lightbulb size={16} />
                  {entry.tip}
                </p>
              </Card>
            )
          })}

        {(filter === 'all' || filter === 'none') && (
          <Card tone="surface" radius="lg" className={`${styles.card} ${styles.notCollected}`}>
            <h2 className={styles.cardTitle}>Không thu nhận tại điểm thu gom</h2>
            <ul className={styles.list}>
              {NOT_COLLECTED.map((item) => (
                <li key={item.label} className={styles.notItem}>
                  <Ban size={18} className={styles.no} />
                  <span>
                    <strong>{item.label}</strong>
                    <span className={common.caption}>{item.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Button onClick={() => navigate('/recycle')}>Đổi rác lấy điểm</Button>
      </div>
    </Screen>
  )
}
