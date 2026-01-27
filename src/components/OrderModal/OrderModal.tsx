import type { OrderItem, Table, TableStatus } from '../../hooks/useAppStore'
import styles from './OrderModal.module.css'

type CatalogItem = Omit<OrderItem, 'qty'>

const CATALOG: CatalogItem[] = [
  { id: 'tea', name: 'Tea', price: 10 },
  { id: 'ginger-tea', name: 'Ginger Tea', price: 15 },
  { id: 'coffee', name: 'Coffee', price: 20 },
  { id: 'boost', name: 'Boost', price: 25 },
  { id: 'samosa', name: 'Samosa', price: 15 },
  { id: 'biscuit', name: 'Biscuit', price: 5 },
]

type Props = {
  open: boolean
  tableId: string
  table: Table
  onClose: () => void
  onAddItem: (item: CatalogItem) => void
  onDecrementItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
  onStatusChange: (status: TableStatus) => void
  onMarkPaid: () => void
  onNotesChange: (notes: string) => void
  onClear: () => void
}

function formatMoney(amount: number) {
  return `₹${amount.toFixed(0)}`
}

function formatTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(ts))
}

export default function OrderModal({
  open,
  tableId,
  table,
  onClose,
  onAddItem,
  onDecrementItem,
  onRemoveItem,
  onStatusChange,
  onMarkPaid,
  onNotesChange,
  onClear,
}: Props) {
  if (!open) return null

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>Table {tableId} • Order</div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>Quick Add</div>
            <div className={styles.catalog}>
              {CATALOG.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  className={styles.itemBtn}
                  onClick={() => onAddItem(it)}
                >
                  <span>{it.name}</span>
                  <span className={styles.small}>{formatMoney(it.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Current Order</div>

            <div className={styles.orderList}>
              {table.items.length === 0 ? (
                <div className={styles.small}>No items yet.</div>
              ) : (
                table.items.map((it) => (
                  <div key={it.id} className={styles.orderRow}>
                    <div className={styles.orderLeft}>
                      <div>
                        {it.name} <span className={styles.small}>× {it.qty}</span>
                      </div>
                      <div className={styles.small}>{formatMoney(it.price * it.qty)}</div>
                    </div>

                    <div className={styles.orderRight}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => onDecrementItem(it.id)}
                        title="Reduce"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtnDanger}
                        onClick={() => onRemoveItem(it.id)}
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <div className={styles.small}>Status</div>
              <div className={styles.statusRow}>
                <button
                  type="button"
                  className={`${styles.statusBtn} ${table.status === 'ORDERED' ? styles.statusBtnActive : ''}`}
                  onClick={() => onStatusChange('ORDERED')}
                >
                  Ordered
                </button>
                <button
                  type="button"
                  className={`${styles.statusBtn} ${table.status === 'PREPARING' ? styles.statusBtnActive : ''}`}
                  onClick={() => onStatusChange('PREPARING')}
                >
                  Preparing
                </button>
                <button
                  type="button"
                  className={`${styles.statusBtn} ${table.status === 'SERVED' ? styles.statusBtnActive : ''}`}
                  onClick={() => onStatusChange('SERVED')}
                >
                  Served
                </button>
              </div>
            </div>

            <div>
              <div className={styles.small}>Notes</div>
              <textarea
                className={styles.textarea}
                value={table.notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="e.g. less sugar, extra ginger"
              />
            </div>

            <div className={styles.footer}>
              <div>
                <div className={styles.small}>Total</div>
                <div>
                  <strong>{formatMoney(table.amount)}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.pay}
                  onClick={onMarkPaid}
                  disabled={table.amount <= 0}
                >
                  Mark Paid
                </button>
                <button type="button" className={styles.danger} onClick={onClear}>
                  Clear Table
                </button>
                <button type="button" className={styles.primary} onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Last Paid Bill</div>
            {table.lastPaidBill ? (
              <div className={styles.billCard}>
                <div className={styles.billTop}>
                  <div>
                    <strong>{formatMoney(table.lastPaidBill.amount)}</strong>
                  </div>
                  <div className={styles.small}>{formatTime(table.lastPaidBill.paidAt)}</div>
                </div>
                <div className={styles.billItems}>
                  {table.lastPaidBill.items.map((it) => (
                    <div key={it.id} className={styles.billItemRow}>
                      <span>
                        {it.name} <span className={styles.small}>× {it.qty}</span>
                      </span>
                      <span className={styles.small}>{formatMoney(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
                {table.lastPaidBill.notes ? <div className={styles.small}>{table.lastPaidBill.notes}</div> : null}
              </div>
            ) : (
              <div className={styles.small}>No paid bill yet for this table.</div>
            )}

            <div className={styles.panelTitle}>Bill Log</div>
            <div className={styles.billLog}>
              {table.billLog.length === 0 ? (
                <div className={styles.small}>No log yet.</div>
              ) : (
                [...table.billLog]
                  .slice()
                  .reverse()
                  .map((b) => (
                    <div key={b.paidAt} className={styles.billRow}>
                      <div className={styles.billRowTop}>
                        <span>
                          <strong>{formatMoney(b.amount)}</strong> <span className={styles.small}>• {formatTime(b.paidAt)}</span>
                        </span>
                        <span className={styles.small}>Items: {b.items.reduce((s, it) => s + it.qty, 0)}</span>
                      </div>
                      <div className={styles.billItems}>
                        {b.items.map((it) => (
                          <div key={it.id} className={styles.billItemRow}>
                            <span>
                              {it.name} <span className={styles.small}>× {it.qty}</span>
                            </span>
                            <span className={styles.small}>{formatMoney(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                      {b.notes ? <div className={styles.small}>{b.notes}</div> : null}
                    </div>
                  ))
              )}
            </div>
            <div className={styles.small}>This log stays until you press Clear Table.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
