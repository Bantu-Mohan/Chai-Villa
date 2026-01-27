import { useEffect, useMemo, useState } from 'react'
import type { OrderItem, Table } from '../../hooks/useAppStore'
import styles from './CustomerTable.module.css'

type Category = 'Tea' | 'Coffee' | 'Biscuits' | 'Snacks' | 'Others'

type MenuItem = Omit<OrderItem, 'qty'> & { category: Category }

const CATEGORIES: Category[] = ['Tea', 'Coffee', 'Biscuits', 'Snacks', 'Others']

const MENU: MenuItem[] = [
  { id: 'tea', name: 'Tea', price: 10, category: 'Tea' },
  { id: 'ginger-tea', name: 'Ginger Tea', price: 15, category: 'Tea' },
  { id: 'coffee', name: 'Coffee', price: 20, category: 'Coffee' },
  { id: 'boost', name: 'Boost', price: 25, category: 'Coffee' },
  { id: 'biscuit', name: 'Biscuit', price: 5, category: 'Biscuits' },
  { id: 'samosa', name: 'Samosa', price: 15, category: 'Snacks' },
]

function itemGradient(itemId: string) {
  switch (itemId) {
    case 'tea':
    case 'ginger-tea':
      return 'linear-gradient(135deg, rgba(45, 212, 191, 0.25), rgba(22, 163, 74, 0.25))'
    case 'coffee':
    case 'boost':
      return 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(239, 68, 68, 0.22))'
    case 'biscuit':
      return 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(234, 179, 8, 0.18))'
    case 'samosa':
      return 'linear-gradient(135deg, rgba(168, 85, 247, 0.24), rgba(59, 130, 246, 0.18))'
    default:
      return 'linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06))'
  }
}

function itemGlyph(itemId: string) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  } as const

  switch (itemId) {
    case 'tea':
    case 'ginger-tea':
      return (
        <svg {...common}>
          <path
            d="M7 8h9v6a5 5 0 0 1-5 5H9a2 2 0 0 1-2-2V8Z"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
          />
          <path
            d="M16 10h2a2 2 0 0 1 0 4h-2"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
          />
          <path
            d="M9 5c0 1.2-1 1.5-1 2.5S9 9 9 10"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.2"
          />
          <path
            d="M12 5c0 1.2-1 1.5-1 2.5S12 9 12 10"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.2"
          />
        </svg>
      )
    case 'coffee':
    case 'boost':
      return (
        <svg {...common}>
          <path
            d="M7 9h9v5a5 5 0 0 1-5 5H9a2 2 0 0 1-2-2V9Z"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
          />
          <path
            d="M16 11h2a2 2 0 0 1 0 4h-2"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
          />
          <path
            d="M9 5c0 1.2-1 1.5-1 2.5S9 9 9 10"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.2"
          />
        </svg>
      )
    case 'biscuit':
      return (
        <svg {...common}>
          <path
            d="M12 4a7 7 0 1 0 0 16a7 7 0 0 0 0-16Z"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
          />
          <path
            d="M9 10h.01M12 8h.01M15 11h.01M10 14h.01M14 15h.01"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'samosa':
      return (
        <svg {...common}>
          <path
            d="M12 4l7 14H5L12 4Z"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9 14h6"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return null
  }
}

function formatMoney(amount: number) {
  return `₹${amount.toFixed(0)}`
}

type Props = {
  shopName: string
  tableId: string
  table: Table
  onAddItem: (item: MenuItem) => void
  onDecItem: (itemId: string) => void
  onPlaceOrder: () => void
}

export default function CustomerTable({ shopName, tableId, table, onAddItem, onDecItem, onPlaceOrder }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>('Tea')
  const [cartOpen, setCartOpen] = useState(false)

  const itemsCount = useMemo(() => table.items.reduce((s, it) => s + it.qty, 0), [table.items])

  const cartItems = useMemo(() => table.items, [table.items])

  const canEdit = table.status === 'EMPTY'

  const [ackPaidAt, setAckPaidAt] = useState<number | null>(null)

  useEffect(() => {
    if (table.lastPaidBill?.paidAt) {
      setAckPaidAt(null)
    }
  }, [table.lastPaidBill?.paidAt])

  const showConfirmed = Boolean(
    table.status === 'EMPTY' && table.items.length === 0 && table.lastPaidBill && ackPaidAt !== table.lastPaidBill.paidAt,
  )

  const isPending = table.status !== 'EMPTY'

  const filteredMenu = useMemo(
    () => MENU.filter((m) => m.category === activeCategory),
    [activeCategory],
  )

  if (isPending) {
    return (
      <div className={styles.screen}>
        <div className={styles.header}>
          <div className={styles.shopName}>{shopName}</div>
          <div className={styles.tableNo}>Table {tableId}</div>
        </div>

        <div className={styles.stateWrap}>
          <div className={styles.stateTitle}>Order placed</div>
          <div className={styles.small}>Please wait while staff prepares your order.</div>
          <div className={styles.pendingDots} aria-label="pending">
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
          <div className={styles.small}>Updates will appear here automatically.</div>
        </div>

        <div />
        <div className={styles.cart}>
          <div className={styles.cartTop}>
            <div className={styles.cartSummary}>
              <div className={styles.cartTitle}>Total {formatMoney(table.amount)}</div>
              <div className={styles.cartMeta}>{itemsCount} items</div>
            </div>
            <button type="button" className={styles.placeBtn} disabled>
              ORDER PLACED
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <div className={styles.shopName}>{shopName}</div>
        <div className={styles.tableNo}>Table {tableId}</div>
      </div>

      <div className={styles.tabs}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.tab} ${activeCategory === c ? styles.tabActive : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {showConfirmed ? (
        <div className={styles.stateWrap}>
          <div className={styles.confirm}>
            <div className={styles.stateTitle}>Payment confirmed</div>
            <div className={styles.small}>Thank you. You can start a new order.</div>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={() => setAckPaidAt(table.lastPaidBill?.paidAt ?? null)}
            >
              START NEW ORDER
            </button>
          </div>
        </div>
      ) : null}

      <div className={styles.list} aria-disabled={!canEdit}>
        {filteredMenu.map((item) => {
          const existing = table.items.find((it) => it.id === item.id)
          const qty = existing?.qty ?? 0

          return (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemTop}>
                <div className={styles.itemLeft}>
                  <div className={styles.itemMedia} style={{ background: itemGradient(item.id) }}>
                    {itemGlyph(item.id)}
                  </div>
                  <div className={styles.itemText}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.small}>{item.category}</div>
                  </div>
                </div>

                <div className={styles.itemPrice}>{formatMoney(item.price)}</div>
              </div>

              <div className={styles.qtyRow}>
                <div className={styles.qtyLabel}>Quantity</div>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  disabled={!canEdit || qty === 0}
                  onClick={() => onDecItem(item.id)}
                >
                  −
                </button>
                <div className={styles.qtyValue}>{qty}</div>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  disabled={!canEdit || (showConfirmed && ackPaidAt !== table.lastPaidBill?.paidAt)}
                  onClick={() => onAddItem(item)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.cart}>
        <div className={styles.cartTop}>
          <button
            type="button"
            className={styles.tab}
            onClick={() => setCartOpen((v) => !v)}
            style={{ borderBottomColor: 'transparent' }}
          >
            {cartOpen ? 'Hide Cart' : 'Show Cart'}
          </button>

          <div className={styles.cartSummary}>
            <div className={styles.cartTitle}>Total {formatMoney(table.amount)}</div>
            <div className={styles.cartMeta}>{itemsCount} items</div>
          </div>

          <button
            type="button"
            className={styles.placeBtn}
            onClick={onPlaceOrder}
            disabled={!canEdit || table.items.length === 0 || (showConfirmed && ackPaidAt !== table.lastPaidBill?.paidAt)}
          >
            PLACE ORDER
          </button>
        </div>

        {cartOpen ? (
          <div className={styles.cartBody}>
            {cartItems.length === 0 ? (
              <div className={styles.small}>Cart is empty.</div>
            ) : (
              cartItems.map((it) => (
                <div key={it.id} className={styles.cartRow}>
                  <div>
                    <div>{it.name}</div>
                    <div className={styles.small}>
                      {it.qty} × {formatMoney(it.price)}
                    </div>
                  </div>
                  <div className={styles.small}>{formatMoney(it.qty * it.price)}</div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
