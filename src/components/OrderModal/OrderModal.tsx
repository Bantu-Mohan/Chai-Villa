import type { OrderItem, Table, TableStatus } from '../../hooks/useAppStore'
import styles from './OrderModal.module.css'

type CatalogItem = Omit<OrderItem, 'qty'>

function catalogItemImage(item: CatalogItem) {
  const qById: Record<string, string> = {
    'chai-villa-chai': 'chai,tea&sig=1',
    'matka-cup-chai': 'kulhad,chai&sig=2',
    'elaichi-chai': 'cardamom,chai&sig=3',
    'masala-tea': 'masala,chai&sig=4',
    'ginger-tea': 'ginger,tea&sig=5',
    'badam-tea': 'almond,tea&sig=6',

    coffee: 'coffee,cup&sig=7',
    'black-coffee': 'espresso,coffee&sig=8',
    'dark-chocolate': 'hot,chocolate&sig=9',
    boost: 'energy,drink&sig=10',
    horlicks: 'malt,milk&sig=11',

    'black-tea': 'black,tea&sig=12',
    'lemon-tea': 'lemon,tea&sig=13',
    'ginger-lemon-tea': 'ginger,lemon,tea&sig=14',
    'green-tea': 'green,tea&sig=15',
    'pink-guava-lemon-tea': 'guava,drink&sig=16',
    'mango-lemon-tea': 'mango,drink&sig=17',
    'pina-colada-lemon-tea': 'pina,colada,cocktail&sig=18',
    'grenadine-lemon-tea': 'grenadine,cocktail&sig=19',
    'blueberry-lemon-tea': 'blueberry,drink&sig=20',
    'green-apple-lemon-tea': 'green,apple,drink&sig=21',
    'blue-curacao-lemon-tea': 'blue,curacao,cocktail&sig=22',

    'masala-milk': 'spiced,milk&sig=23',
    'ragi-malt-drink-mix': 'malt,drink&sig=24',
    'rose-drink-mix': 'rose,milk&sig=25',
    'chocolate-drink': 'chocolate,milkshake&sig=26',
    'badam-drink-mix': 'almond,milk&sig=27',
    'pista-badam-drink-mix': 'pistachio,milk&sig=28',

    biscuit: 'biscuit,cookies&sig=29',
    'onion-samosa': 'onion,samosa&sig=30',
    'aloo-samosa': 'potato,samosa&sig=31',
    'sweet-corn-samosa': 'corn,samosa&sig=32',
    'egg-samosa': 'egg,snack&sig=33',
    'chicken-samosa': 'chicken,snack&sig=34',
  }

  const q = qById[item.id]
  if (q) return `https://source.unsplash.com/160x160/?${q}`
  if (item.category === '☕ ColT&c – Hot Beverages') return 'https://source.unsplash.com/160x160/?coffee&sig=50'
  if (item.category === '🥛 Milk & Malt Drinks') return 'https://source.unsplash.com/160x160/?milkshake&sig=51'
  if (item.category === '🍪 Snacks & Quick Bites') return 'https://source.unsplash.com/160x160/?snacks&sig=52'
  return 'https://source.unsplash.com/160x160/?chai,tea&sig=53'
}

const CATALOG: CatalogItem[] = [
  { id: 'chai-villa-chai', name: 'Chai Villa Chai', price: 10, category: '🫖 Chai Villa Special Chai' },
  { id: 'matka-cup-chai', name: 'MatKa Cup Chai', price: 15, category: '🫖 Chai Villa Special Chai' },
  { id: 'elaichi-chai', name: 'Elaichi Chai', price: 15, category: '🫖 Chai Villa Special Chai' },
  { id: 'masala-tea', name: 'Masala Tea', price: 15, category: '🫖 Chai Villa Special Chai' },
  { id: 'ginger-tea', name: 'Ginger Tea', price: 15, category: '🫖 Chai Villa Special Chai' },
  { id: 'badam-tea', name: 'Badam Tea', price: 15, category: '🫖 Chai Villa Special Chai' },

  { id: 'coffee', name: 'Coffee', price: 15, category: '☕ ColT&c – Hot Beverages' },
  { id: 'black-coffee', name: 'Black Coffee', price: 15, category: '☕ ColT&c – Hot Beverages' },
  { id: 'dark-chocolate', name: 'Dark Chocolate', price: 15, category: '☕ ColT&c – Hot Beverages' },
  { id: 'boost', name: 'Boost', price: 15, category: '☕ ColT&c – Hot Beverages' },
  { id: 'horlicks', name: 'Horlicks', price: 15, category: '☕ ColT&c – Hot Beverages' },

  { id: 'black-tea', name: 'Black Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'lemon-tea', name: 'Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'ginger-lemon-tea', name: 'Ginger Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'green-tea', name: 'Green Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'pink-guava-lemon-tea', name: 'Pink Guava Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'mango-lemon-tea', name: 'Mango Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'pina-colada-lemon-tea', name: 'Pina Colada Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'grenadine-lemon-tea', name: 'Grenadine Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'blueberry-lemon-tea', name: 'Blueberry Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'green-apple-lemon-tea', name: 'Green Apple Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'blue-curacao-lemon-tea', name: 'Blue Curacao Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },

  { id: 'masala-milk', name: 'Masala Milk', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'ragi-malt-drink-mix', name: 'Ragi Malt Drink Mix', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'rose-drink-mix', name: 'Rose Drink Mix', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'chocolate-drink', name: 'Chocolate Drink', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'badam-drink-mix', name: 'Badam Drink Mix', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'pista-badam-drink-mix', name: 'Pista Badam Drink Mix', price: 15, category: '🥛 Milk & Malt Drinks' },

  { id: 'biscuit', name: 'Biscuit (4 pcs)', price: 20, category: '🍪 Snacks & Quick Bites' },
  { id: 'onion-samosa', name: 'Onion Samosa (6 pcs)', price: 20, category: '🍪 Snacks & Quick Bites' },
  { id: 'aloo-samosa', name: 'Aloo Samosa (1 pc)', price: 15, category: '🍪 Snacks & Quick Bites' },
  { id: 'sweet-corn-samosa', name: 'Sweet Corn Samosa (5 pcs)', price: 20, category: '🍪 Snacks & Quick Bites' },
  { id: 'egg-samosa', name: 'Egg Samosa (4 pcs)', price: 20, category: '🍪 Snacks & Quick Bites' },
  { id: 'chicken-samosa', name: 'Chicken Samosa (3 pcs)', price: 20, category: '🍪 Snacks & Quick Bites' },
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

function billItemSummary(items: OrderItem[]) {
  const count = items.reduce((s, it) => s + it.qty, 0)
  const uniq = Array.from(new Set(items.map((it) => it.name)))
  const shown = uniq.slice(0, 3)
  const remaining = Math.max(0, uniq.length - shown.length)
  const names = remaining > 0 ? `${shown.join(', ')} +${remaining}` : shown.join(', ')
  return { count, names }
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

  const canEditItems = table.status === 'EMPTY'

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
                  disabled={!canEditItems}
                  onClick={() => onAddItem(it)}
                >
                  <span className={styles.itemBtnLeft}>
                    <span
                      className={styles.itemThumb}
                      style={{ backgroundImage: `url(${catalogItemImage(it)})` }}
                      aria-hidden="true"
                    />
                    <span className={styles.itemBtnText}>
                      <span className={styles.itemBtnName}>{it.name}</span>
                      {it.category ? <span className={styles.small}>{it.category}</span> : null}
                    </span>
                  </span>
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
                        disabled={!canEditItems}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtnDanger}
                        onClick={() => onRemoveItem(it.id)}
                        title="Remove"
                        disabled={!canEditItems}
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
                  .map((b) => {
                    const summary = billItemSummary(b.items)
                    return (
                      <div key={b.paidAt} className={styles.billRow}>
                        <div className={styles.billRowTop}>
                          <span>
                            <strong>{formatMoney(b.amount)}</strong>{' '}
                            <span className={styles.small}>• {formatTime(b.paidAt)}</span>
                          </span>
                          <span className={styles.small}>
                            Items: {summary.count}
                            {summary.names ? ` • ${summary.names}` : ''}
                          </span>
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
                    )
                  })
              )}
            </div>
            <div className={styles.small}>This log stays until you press Clear Table.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
