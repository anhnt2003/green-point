import { Award, Newspaper, Recycle } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/app/components/Card'
import { FilterChips, type ChipOption } from '@/app/components/FilterChips'
import { ImpactBanner } from '@/app/components/illustrations/ImpactBanner'
import { BottleOutlineIcon, CanOutlineIcon } from '@/app/components/illustrations/small'
import { WasteIcon } from '@/app/components/illustrations/WasteIcon'
import { ProgressBar } from '@/app/components/ProgressBar'
import { VERIFIED_RECYCLING_RATE, WASTE_TYPES } from '@/app/data/seed'
import { formatKg } from '@/app/domain/format'
import { AppHeader } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { useCitizenStats } from '@/app/store/selectors'
import common from './common.module.css'
import styles from './ImpactScreen.module.css'

type Tab = 'overview' | 'detail' | 'certificate'

const TABS: readonly ChipOption<Tab>[] = [
  { value: 'overview', label: 'Tổng quan' },
  { value: 'detail', label: 'Chi tiết' },
  { value: 'certificate', label: 'Chứng nhận' },
]

const MILESTONES = [
  { kg: 1, title: 'Người mới xanh', desc: 'Bàn giao 1 kg rác tái chế đầu tiên' },
  { kg: 5, title: 'Chiến binh 5 kg', desc: 'Bàn giao 5 kg rác tái chế' },
  { kg: 10, title: 'Đại sứ xanh', desc: 'Bàn giao 10 kg rác tái chế' },
  { kg: 50, title: 'Anh hùng môi trường', desc: 'Bàn giao 50 kg rác tái chế' },
]

/** Screen 07 — Tác động môi trường (GreenImpact). */
export function ImpactScreen() {
  const [tab, setTab] = useState<Tab>('overview')
  const stats = useCitizenStats()

  return (
    <Screen header={<AppHeader title="Tác động của bạn" align="left" />}>
      <div className={common.content}>
        <FilterChips options={TABS} value={tab} onChange={setTab} variant="tabs" ariaLabel="Tác động" />

        {tab === 'overview' && (
          <>
            <Card radius="lg" className={styles.totalCard}>
              <div className={styles.totalHead}>
                <span className={styles.totalIcon}>
                  <Recycle size={28} strokeWidth={2.2} />
                </span>
                <div>
                  <span className={styles.totalLabel}>Tổng khối lượng đã bàn giao</span>
                  <span className={styles.totalValue}>{formatKg(stats.totalKg)}</span>
                </div>
              </div>
              <span className={styles.equivTitle}>Tương đương</span>
              <div className={styles.equivRow}>
                <Equivalent icon={<BottleOutlineIcon />} text={`~ ${stats.equivalents.petBottles500ml} chai nhựa 500ml`} />
                <Equivalent icon={<Newspaper size={26} strokeWidth={1.6} />} text={`~ ${stats.equivalents.paperKg} kg giấy`} />
                <Equivalent icon={<CanOutlineIcon />} text={`~ ${stats.equivalents.aluminumCans} lon nhôm`} />
              </div>
            </Card>

            <Card radius="lg" className={styles.rateCard}>
              <span className={styles.rateLabel}>Tỷ lệ đã có xác nhận tiếp nhận</span>
              <span className={styles.rateValue}>{Math.round(VERIFIED_RECYCLING_RATE * 100)}%</span>
              <ProgressBar value={VERIFIED_RECYCLING_RATE} label="Tỷ lệ đã có xác nhận tiếp nhận" />
            </Card>

            <ImpactBanner title="Cùng nhau giảm rác thải" subtitle="Kiến tạo tương lai xanh 🌿" />
          </>
        )}

        {tab === 'detail' && (
          <Card radius="lg" className={styles.detailCard}>
            <span className={styles.rateLabel}>Khối lượng theo loại rác</span>
            {WASTE_TYPES.map((type) => {
              const kg = stats.weightByType?.[type.code] ?? 0
              return (
                <div key={type.code} className={styles.detailRow}>
                  <WasteIcon code={type.code} size={44} />
                  <div className={styles.detailText}>
                    <div className={styles.detailLine}>
                      <span className={styles.detailName}>{type.name}</span>
                      <span className={styles.detailKg}>{formatKg(kg)}</span>
                    </div>
                    <ProgressBar value={stats.totalKg ? kg / stats.totalKg : 0} label={type.name} />
                  </div>
                </div>
              )
            })}
          </Card>
        )}

        {tab === 'certificate' && (
          <div className={styles.certList}>
            {MILESTONES.map((m) => {
              const achieved = stats.totalKg >= m.kg
              return (
                <Card key={m.kg} className={`${styles.cert} ${achieved ? '' : styles.certLocked}`}>
                  <span className={styles.certIcon}>
                    <Award size={26} strokeWidth={2} />
                  </span>
                  <div className={styles.detailText}>
                    <span className={styles.detailName}>{m.title}</span>
                    <span className={common.caption}>{m.desc}</span>
                    {!achieved && <ProgressBar value={stats.totalKg / m.kg} label={m.title} />}
                  </div>
                  <span className={achieved ? styles.certDone : styles.certTodo}>
                    {achieved ? 'Đã đạt' : `${Math.round((stats.totalKg / m.kg) * 100)}%`}
                  </span>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </Screen>
  )
}

function Equivalent({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className={styles.equiv}>
      <span className={styles.equivIcon}>{icon}</span>
      <span className={styles.equivText}>{text}</span>
    </div>
  )
}
