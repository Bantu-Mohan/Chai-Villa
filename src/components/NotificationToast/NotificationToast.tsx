import styles from './NotificationToast.module.css'
import type { UINotification } from '../../hooks/useAppStore'

type Props = {
  notifications: UINotification[]
  onDismiss: (id: string) => void
  onOpenTable: (tableId: string) => void
}

export default function NotificationToast({ notifications, onDismiss, onOpenTable }: Props) {
  if (notifications.length === 0) return null

  return (
    <div className={styles.wrap}>
      {notifications
        .slice()
        .reverse()
        .map((n) => (
          <div key={n.id} className={styles.toast}>
            {n.kind === 'NEW_ORDER' ? (
              <div className={styles.rowTop}>
                <div>
                  <div className={styles.title}>New Order</div>
                  <div className={styles.muted}>
                    Table {n.tableId} • ₹{n.amount.toFixed(0)}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.btn} onClick={() => onOpenTable(n.tableId)}>
                    Open
                  </button>
                  <button type="button" className={styles.btn} onClick={() => onDismiss(n.id)}>
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.rowTop}>
                <div>
                  <div className={styles.title}>{n.message}</div>
                  <div className={styles.muted}>Staff</div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.btn} onClick={() => onDismiss(n.id)}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
