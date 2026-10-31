import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/components/Button'
import { Card } from '@/app/components/Card'
import { FilterChips } from '@/app/components/FilterChips'
import { WasteIcon } from '@/app/components/illustrations/WasteIcon'
import { ListRow } from '@/app/components/ListRow'
import { SectionTitle } from '@/app/components/SectionTitle'
import { TextField } from '@/app/components/TextField'
import { WeightField } from '@/app/components/WeightField'
import { RECYCLERS, WASTE_TYPES } from '@/app/data/seed'
import { SALE_PRICES, stockByType } from '@/app/domain/business'
import { formatDateTime, formatInt, formatKg, formatMillions, formatVnd, parseVnd } from '@/app/domain/format'
import { parseScaleWeight, sumWeights } from '@/app/domain/points'
import type { StockMove, WasteCode } from '@/app/domain/types'
import { toast } from '@/app/feedback/useFeedback'
import { AppHeader, useBack } from '@/app/layout/AppHeader'
import { Screen } from '@/app/layout/Screen'
import { usePointMoves } from '@/app/store/selectors'
import { useStore } from '@/app/store/useStore'
import common from '../common.module.css'
import styles from './Ledger.module.css'

const typeName = (code: WasteCode) => WASTE_TYPES.find((t) => t.code === code)?.name ?? code
const newestFirst = (a: { at: string }, b: { at: string }) => new Date(b.at).getTime() - new Date(a.at).getTime()

/** Quản lý kho → Tồn kho (F-11): what was received from citizens minus what was sold. */
export function InventoryScreen() {
  const navigate = useNavigate()
  const moves = usePointMoves()
  const stock = stockByType(moves)
  const totalKg = sumWeights(stock)
  const valueVnd = WASTE_TYPES.reduce((s, t) => s + stock[t.code] * SALE_PRICES[t.code], 0)
  const recent = [...moves].sort(newestFirst).slice(0, 15)

  return (
    <Screen header={<AppHeader title="Tồn kho" align="left" fallback="/business" />}>
      <div className={common.content}>
        <Card radius="lg" className={styles.hero}>
          <span className={styles.heroLabel}>Tổng tồn kho</span>
          <span className={styles.heroValue}>{formatKg(totalKg)}</span>
          <span className={common.caption}>Ước tính {formatMillions(valueVnd)} theo giá thu mua của đơn vị tái chế</span>
        </Card>

        <div className={styles.section}>
          <SectionTitle>Theo loại rác</SectionTitle>
        </div>
        <div className={styles.list}>
          {WASTE_TYPES.map((t) => (
            <div key={t.code} className={styles.row}>
              <WasteIcon code={t.code} size={44} />
              <div className={styles.rowText}>
                <span className={styles.rowTitle}>{t.name}</span>
                <span className={common.caption}>
                  {formatVnd(SALE_PRICES[t.code])}/kg · ước tính {formatMillions(stock[t.code] * SALE_PRICES[t.code])}
                </span>
              </div>
              <strong className={styles.rowValue}>{formatKg(stock[t.code])}</strong>
            </div>
          ))}
        </div>

        <Button onClick={() => navigate('/business/inventory/sell')} disabled={totalKg <= 0}>
          Bán cho đơn vị tái chế
        </Button>

        <div className={styles.section}>
          <SectionTitle>Nhập, xuất gần đây</SectionTitle>
        </div>
        {recent.length === 0 ? (
          <p className={`${common.caption} ${styles.emptyLine}`}>Chưa có lượt nhập hay xuất kho nào.</p>
        ) : (
          <div className={styles.list}>
            {recent.map((m) => (
              <MoveRow key={m.id} move={m} />
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}

function MoveRow({ move }: { move: StockMove }) {
  const received = move.kind === 'in'
  const source = received ? (move.orderId?.startsWith('GP') ? `#${move.orderId}` : 'Tại quầy') : move.buyer
  return (
    <ListRow
      icon={received ? <ArrowDownToLine size={22} /> : <ArrowUpFromLine size={22} />}
      iconTone={received ? 'primary' : 'warm'}
      title={`${received ? 'Nhận' : 'Bán'} ${typeName(move.code)}`}
      subtitle={`${source} · ${formatDateTime(move.at)}`}
      value={`${received ? '+' : '-'}${formatKg(move.kg)}`}
      valueTone={received ? 'positive' : 'muted'}
    />
  )
}

/** Sells sorted waste from stock to a recycler: the collection point's revenue (F-12). */
export function SellStockScreen() {
  const goBack = useBack('/business/inventory')
  const stock = stockByType(usePointMoves())
  const sellStock = useStore((s) => s.sellStock)
  const [code, setCode] = useState<WasteCode>(
    () => WASTE_TYPES.reduce((a, b) => (stock[b.code] > stock[a.code] ? b : a)).code,
  )
  const [kgText, setKgText] = useState('')
  const [priceText, setPriceText] = useState(() => formatInt(SALE_PRICES[code]))
  const [buyer, setBuyer] = useState(() => RECYCLERS[code])

  const pickType = (next: WasteCode) => {
    setCode(next)
    setKgText('')
    setPriceText(formatInt(SALE_PRICES[next]))
    setBuyer(RECYCLERS[next])
  }

  const available = stock[code]
  const kg = parseScaleWeight(kgText, Infinity)
  const price = parseVnd(priceText)
  const tooMuch = kg !== null && kg > available
  const valid = kg !== null && kg > 0 && !tooMuch && price !== null && price > 0 && buyer.trim() !== ''
  const amount = valid ? Math.round(kg * price) : 0

  const submit = () => {
    if (!valid) return
    const res = sellStock({ code, kg, priceVndPerKg: price, buyer })
    if (!res.ok) {
      toast('Không bán được. Kiểm tra lại số lượng tồn kho.', 'error')
      return
    }
    toast(`Đã bán ${formatKg(kg)} ${typeName(code).toLowerCase()}, thu ${formatVnd(amount)}`)
    goBack()
  }

  return (
    <Screen header={<AppHeader title="Bán cho đơn vị tái chế" fallback="/business/inventory" />}>
      <div className={`${common.content} ${styles.form}`}>
        <FilterChips
          options={WASTE_TYPES.map((t) => ({ value: t.code, label: t.name }))}
          value={code}
          onChange={pickType}
          ariaLabel="Loại rác"
        />

        <div className={styles.row}>
          <WasteIcon code={code} size={44} />
          <div className={styles.rowText}>
            <span className={styles.rowTitle}>Số lượng bán</span>
            <span className={common.caption}>Tồn kho {formatKg(available)}</span>
          </div>
          <WeightField label="Số kg bán" value={kgText} invalid={kg === null || tooMuch} onChange={setKgText} />
        </div>
        {tooMuch && (
          <p className={styles.error} role="alert">
            Vượt quá tồn kho ({formatKg(available)})
          </p>
        )}
        {available > 0 && (
          <button type="button" className={`${styles.textButton} pressable`} onClick={() => setKgText(String(available))}>
            Bán hết {formatKg(available)}
          </button>
        )}

        <TextField
          label="Giá bán"
          inputMode="numeric"
          value={priceText}
          invalid={price === null || price <= 0}
          trailing={<span className={styles.unit}>đ/kg</span>}
          onChange={(e) => setPriceText(e.target.value)}
        />
        <TextField label="Đơn vị mua" value={buyer} invalid={!buyer.trim()} onChange={(e) => setBuyer(e.target.value)} />

        <Card tone="tint" radius="lg" className={styles.total}>
          <span className={common.caption}>Thành tiền</span>
          <span className={styles.totalValue} aria-live="polite">
            {formatVnd(amount)}
          </span>
        </Card>

        <Button onClick={submit} disabled={!valid}>
          Xác nhận bán
        </Button>
      </div>
    </Screen>
  )
}
