import { useEffect, useMemo, useState } from 'react'
import type { OrderItem, Table } from '../../hooks/useAppStore'
import styles from './CustomerTable.module.css'

type Category =
  | '🫖 Chai Villa Special Chai'
  | '☕ ColT&c – Hot Beverages'
  | '🍵 Black Tea & Flavored Teas'
  | '🥛 Milk & Malt Drinks'
  | '🍪 Snacks & Quick Bites'

type MenuItem = Omit<OrderItem, 'qty'> & { category: Category }

const CATEGORIES: Category[] = [
  '🫖 Chai Villa Special Chai',
  '☕ ColT&c – Hot Beverages',
  '🍵 Black Tea & Flavored Teas',
  '🥛 Milk & Malt Drinks',
  '🍪 Snacks & Quick Bites',
]

const MENU: MenuItem[] = [
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
  {
    id: 'pink-guava-lemon-tea',
    name: 'Pink Guava Lemon Tea',
    price: 15,
    category: '🍵 Black Tea & Flavored Teas',
  },
  { id: 'mango-lemon-tea', name: 'Mango Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  {
    id: 'pina-colada-lemon-tea',
    name: 'Pina Colada Lemon Tea',
    price: 15,
    category: '🍵 Black Tea & Flavored Teas',
  },
  { id: 'grenadine-lemon-tea', name: 'Grenadine Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  { id: 'blueberry-lemon-tea', name: 'Blueberry Lemon Tea', price: 15, category: '🍵 Black Tea & Flavored Teas' },
  {
    id: 'green-apple-lemon-tea',
    name: 'Green Apple Lemon Tea',
    price: 15,
    category: '🍵 Black Tea & Flavored Teas',
  },
  {
    id: 'blue-curacao-lemon-tea',
    name: 'Blue Curacao Lemon Tea',
    price: 15,
    category: '🍵 Black Tea & Flavored Teas',
  },

  { id: 'masala-milk', name: 'Masala Milk', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'ragi-malt-drink-mix', name: 'Ragi Malt Drink Mix', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'rose-drink-mix', name: 'Rose Drink Mix', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'chocolate-drink', name: 'Chocolate Drink', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'badam-drink-mix', name: 'Badam Drink Mix', price: 15, category: '🥛 Milk & Malt Drinks' },
  { id: 'pista-badam-drink-mix', name: 'Pista Badam Drink Mix', price: 15, category: '🥛 Milk & Malt Drinks' },

  { id: 'biscuit', name: 'Biscuit', portion: '4 pcs', price: 20, category: '🍪 Snacks & Quick Bites' },
  { id: 'onion-samosa', name: 'Onion Samosa', portion: '6 pcs', price: 20, category: '🍪 Snacks & Quick Bites' },
  { id: 'aloo-samosa', name: 'Aloo Samosa', portion: '1 pc', price: 15, category: '🍪 Snacks & Quick Bites' },
  { id: 'sweet-corn-samosa', name: 'Sweet Corn Samosa', portion: '5 pcs', price: 20, category: '🍪 Snacks & Quick Bites' },
  { id: 'egg-samosa', name: 'Egg Samosa', portion: '4 pcs', price: 20, category: '🍪 Snacks & Quick Bites' },
  { id: 'chicken-samosa', name: 'Chicken Samosa', portion: '3 pcs', price: 20, category: '🍪 Snacks & Quick Bites' },
]

function itemGradient(item: MenuItem) {
  switch (item.category) {
    case '🫖 Chai Villa Special Chai':
      return 'linear-gradient(135deg, rgba(45, 212, 191, 0.25), rgba(22, 163, 74, 0.25))'
    case '☕ ColT&c – Hot Beverages':
      return 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(239, 68, 68, 0.22))'
    case '🍵 Black Tea & Flavored Teas':
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(168, 85, 247, 0.20))'
    case '🥛 Milk & Malt Drinks':
      return 'linear-gradient(135deg, rgba(236, 72, 153, 0.18), rgba(245, 158, 11, 0.18))'
    case '🍪 Snacks & Quick Bites':
      return 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(234, 179, 8, 0.18))'
    default:
      return 'linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06))'
  }
}

function itemImage(item: MenuItem) {
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
  if (q) return `https://source.unsplash.com/500x500/?${q}`
  if (item.category === '☕ ColT&c – Hot Beverages') return 'https://source.unsplash.com/500x500/?coffee&sig=50'
  if (item.category === '🥛 Milk & Malt Drinks') return 'https://source.unsplash.com/500x500/?milkshake&sig=51'
  if (item.category === '🍪 Snacks & Quick Bites') return 'https://source.unsplash.com/500x500/?snacks&sig=52'
  return 'https://source.unsplash.com/500x500/?chai,tea&sig=53'
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
  const [activeCategory, setActiveCategory] = useState<Category>('🫖 Chai Villa Special Chai')
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
                  <div
                    className={styles.itemMedia}
                    style={{ backgroundImage: `${itemGradient(item)}, url(${itemImage(item)})` }}
                    aria-hidden="true"
                  />
                  <div className={styles.itemText}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.small}>{item.category}</div>
                    {item.portion ? <div className={styles.small}>Serving: {item.portion}</div> : null}
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
