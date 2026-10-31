import { useState } from 'react'
import { formatDayMonth, formatKg, formatKgValue } from '@/app/domain/format'
import styles from './Ledger.module.css'

/** 1, 2 or 5 × 10ⁿ at or above `max`, so the top gridline reads as a round number. */
function niceCeil(max: number): number {
  if (max <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(max))
  return ([1, 2, 5, 10].find((step) => step * magnitude >= max) ?? 10) * magnitude
}

/**
 * Columns of weight received per day, oldest left, today right. One series, so no legend.
 * Only the peak and today carry a value; tap or focus any column for its own, or open the table.
 */
export function IntakeChart({ data }: { data: readonly { day: Date; kg: number }[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [asTable, setAsTable] = useState(false)
  const top = niceCeil(Math.max(0, ...data.map((d) => d.kg)))
  const peak = data.reduce((best, d, i) => (d.kg > data[best].kg ? i : best), 0)
  const labelled = new Set([peak, data.length - 1])
  const edge = Math.max(1, Math.round(data.length / 6))

  return (
    <>
      <div className={styles.plot}>
        <span className={styles.axisMax}>{formatKg(top)}</span>
        <div className={styles.bars} role="group" aria-label="Khối lượng nhận theo ngày">
          {data.map((d, i) => {
            const pct = (d.kg / top) * 100
            const tooltipSide = i < edge ? styles.tooltipStart : i >= data.length - edge ? styles.tooltipEnd : ''
            return (
              <button
                key={d.day.getTime()}
                type="button"
                className={`${styles.slot} ${active === i ? styles.slotActive : ''}`}
                aria-label={`${formatDayMonth(d.day)}: ${formatKg(d.kg)}`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(i)}
              >
                {d.kg > 0 && <span className={styles.bar} style={{ height: `${pct}%` }} />}
                {active === null && labelled.has(i) && d.kg > 0 && (
                  <span className={styles.barLabel} style={{ bottom: `${pct}%` }}>
                    {formatKgValue(d.kg)}
                  </span>
                )}
                {active === i && (
                  <span className={`${styles.tooltip} ${tooltipSide}`}>
                    <strong>{formatKg(d.kg)}</strong>
                    <span>{i === data.length - 1 ? 'Hôm nay' : formatDayMonth(d.day)}</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className={styles.axisDays} aria-hidden="true">
        <span>{data.length > 0 && formatDayMonth(data[0].day)}</span>
        <span>Hôm nay</span>
      </div>

      <button type="button" className={`${styles.textButton} pressable`} onClick={() => setAsTable((v) => !v)}>
        {asTable ? 'Ẩn bảng số liệu' : 'Xem bảng số liệu'}
      </button>
      {asTable && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Ngày</th>
              <th scope="col">Khối lượng</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((d) => (
              <tr key={d.day.getTime()}>
                <td>{formatDayMonth(d.day)}</td>
                <td>{formatKg(d.kg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
