import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { usePlatform } from '@/app/platform/PlatformContext'
import { useFeedback } from './useFeedback'
import styles from './feedback.module.css'

const TONE_ICON = { success: CircleCheck, error: CircleAlert, info: Info }

export function FeedbackHost() {
  const platform = usePlatform()
  const toast = useFeedback((s) => s.toast)
  const dialog = useFeedback((s) => s.dialog)
  const closeDialog = useFeedback((s) => s.closeDialog)
  const hideToast = useFeedback((s) => s.hideToast)

  const ToastIcon = toast ? TONE_ICON[toast.tone] : null
  const cancelAction = dialog?.actions.find((a) => a.role === 'cancel')

  return (
    <>
      {toast && ToastIcon && (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[`toast_${platform}`]} ${styles[`tone_${toast.tone}`]}`}
          role="status"
          onClick={hideToast}
        >
          {platform === 'ios' && <ToastIcon size={20} className={styles.toastIcon} />}
          <span>{toast.message}</span>
        </div>
      )}

      {dialog && (
        <div
          className={`${styles.scrim} ${styles[`scrim_${platform}`]}`}
          onClick={() => cancelAction && closeDialog(cancelAction.value)}
        >
          <div
            className={`${styles.dialog} ${styles[`dialog_${platform}`]}`}
            role="alertdialog"
            aria-modal="true"
            aria-label={dialog.title}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.dialogBody}>
              <h2 className={styles.dialogTitle}>{dialog.title}</h2>
              {dialog.message && <p className={styles.dialogMessage}>{dialog.message}</p>}
            </div>
            <div
              className={`${styles.dialogActions} ${
                platform === 'ios' && dialog.actions.length > 2 ? styles.dialogActionsStacked : ''
              }`}
            >
              {dialog.actions.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  className={`${styles.dialogAction} ${styles[`action_${action.role ?? 'default'}`]} pressable`}
                  onClick={() => closeDialog(action.value)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
