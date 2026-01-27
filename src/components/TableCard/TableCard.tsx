import { useMemo } from 'react'
import type { Table, TableStatus } from '../../hooks/useAppStore'
import styles from './TableCard.module.css'

type Props = {
  tableId: string
  table: Table
  now: number
  selected: boolean
  onClick: () => void
}

function dotClass(status: TableStatus) {
  switch (status) {
    case 'ORDERED':
      return styles.dotOrdered
    case 'PREPARING':
      return styles.dotPreparing
    case 'SERVED':
      return styles.dotServed
    default:
      return styles.dotEmpty
  }
}

function formatMoney(amount: number) {
  return `₹${amount.toFixed(0)}`
}

export default function TableCard({ tableId, table, now, selected, onClick }: Props) {
  const elapsed = useMemo(() => {
    if (!table.startedAt) return null
    const ms = Math.max(0, now - table.startedAt)
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return { minutes, seconds }
  }, [now, table.startedAt])

  const elapsedText =
    elapsed === null ? null : `${elapsed.minutes}:${String(elapsed.seconds).padStart(2, '0')}`

  const itemNames = useMemo(() => {
    const uniq = Array.from(new Set(table.items.map((it) => it.name)))
    const shown = uniq.slice(0, 4)
    const remaining = Math.max(0, uniq.length - shown.length)
    return remaining > 0 ? `${shown.join(', ')} +${remaining}` : shown.join(', ')
  }, [table.items])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick()
      }}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
    >
      <div className={styles.top}>
        <div className={styles.tableNo}>Table {tableId}</div>
        <div className={styles.badge}>
          <span className={`${styles.dot} ${dotClass(table.status)}`} />
          <span>{table.status}</span>
        </div>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Items</div>
          <div className={styles.metaValue}>{table.items.reduce((s, it) => s + it.qty, 0)}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Total</div>
          <div className={styles.metaValue}>{formatMoney(table.amount)}</div>
        </div>
      </div>

      {table.items.length > 0 ? <div className={styles.itemsPreview}>{itemNames}</div> : null}

      <div className={styles.notes}>
        {elapsedText === null ? '—' : `Running: ${elapsedText}`}{table.notes ? ` • ${table.notes}` : ''}
      </div>
    </div>
  )
}
