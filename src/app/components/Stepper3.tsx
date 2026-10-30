import { Check } from 'lucide-react'
import { Fragment } from 'react'
import styles from './ui.module.css'

/** Three numbered steps; the current one is filled with primary. */
export function Stepper3({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className={styles.steps} aria-label="Các bước">
      {steps.map((label, i) => {
        const state = i === current ? 'current' : i < current ? 'done' : 'todo'
        return (
          <Fragment key={label}>
            {i > 0 && <li className={`${styles.stepLine} ${i <= current ? styles.stepLineDone : ''}`} aria-hidden />}
            <li className={`${styles.step} ${styles[`step_${state}`]}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className={styles.stepDot}>{state === 'done' ? <Check size={16} strokeWidth={3} /> : i + 1}</span>
              <span className={styles.stepLabel}>{label}</span>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
