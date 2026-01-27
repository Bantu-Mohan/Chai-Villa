import type { ReactNode } from 'react'
import styles from './DashboardLayout.module.css'

type Props = {
  shopName: string
  totalTables: number
  selectedTableId: string | null
  onOpenOrder: () => void
  children: ReactNode
}

export default function DashboardLayout({
  shopName,
  totalTables,
  selectedTableId,
  onOpenOrder,
  children,
}: Props) {
  return (
    <div className={styles.shell}>
      <main className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.shopName}>{shopName}</div>
            <div className={styles.headerMeta}>
              <span className={styles.pill}>Tables: {totalTables}</span>
              <span className={styles.pill}>
                Selected: {selectedTableId ? `Table ${selectedTableId}` : '—'}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button
              className={styles.primaryBtn}
              onClick={onOpenOrder}
              disabled={!selectedTableId}
              type="button"
            >
              Open Order
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
