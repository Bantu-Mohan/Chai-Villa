import { useEffect, useRef } from 'react'
import styles from './NotificationToast.module.css'
import type { UINotification } from '../../hooks/useAppStore'

type Props = {
  notifications: UINotification[]
  onDismiss: (id: string) => void
  onOpenTable: (tableId: string) => void
}

export default function NotificationToast({ notifications, onDismiss, onOpenTable }: Props) {
  const timersRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    for (const n of notifications) {
      if (timersRef.current.has(n.id)) continue
      const t = window.setTimeout(() => {
        timersRef.current.delete(n.id)
        onDismiss(n.id)
      }, 5000)
      timersRef.current.set(n.id, t)
    }

    for (const [id, t] of timersRef.current) {
      if (notifications.some((n) => n.id === id)) continue
      window.clearTimeout(t)
      timersRef.current.delete(id)
    }
  }, [notifications, onDismiss])

  useEffect(
    () => () => {
      for (const t of timersRef.current.values()) {
        window.clearTimeout(t)
      }
      timersRef.current.clear()
    },
    [],
  )

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
