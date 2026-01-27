import { useEffect, useMemo, useReducer, useRef } from 'react'

export type TableStatus = 'EMPTY' | 'ORDERED' | 'PREPARING' | 'SERVED'

export interface OrderItem {
  id: string
  name: string
  price: number
  qty: number
  category?: 'Tea' | 'Coffee' | 'Biscuits' | 'Snacks' | 'Others'
}

export interface PaidBill {
  paidAt: number
  amount: number
  items: OrderItem[]
  notes: string
}

export interface Table {
  status: TableStatus
  items: OrderItem[]
  notes: string
  amount: number
  startedAt: number | null
  lastPaidBill: PaidBill | null
  billLog: PaidBill[]
}

export type UINotification =
  | {
      id: string
      kind: 'INFO'
      message: string
      createdAt: number
    }
  | {
      id: string
      kind: 'NEW_ORDER'
      tableId: string
      amount: number
      createdAt: number
    }

export interface AppState {
  shop: { name: string; totalTables: number }
  tables: Record<string, Table>
  ui: {
    activeModal: null | 'ORDER'
    notifications: UINotification[]
    selectedTableId: null | string
  }
}

type PersistedState = {
  shop: AppState['shop']
  tables: AppState['tables']
}

type Action =
  | { type: 'SELECT_TABLE'; tableId: string | null }
  | { type: 'OPEN_MODAL'; modal: 'ORDER' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'UPDATE_TABLE_STATUS'; tableId: string; status: TableStatus }
  | { type: 'ADD_ITEM'; tableId: string; item: Omit<OrderItem, 'qty'>; qty?: number }
  | { type: 'CUSTOMER_ADD_ITEM'; tableId: string; item: Omit<OrderItem, 'qty'>; qty?: number }
  | { type: 'DECREMENT_ITEM'; tableId: string; itemId: string }
  | { type: 'REMOVE_ITEM'; tableId: string; itemId: string }
  | { type: 'CUSTOMER_DECREMENT_ITEM'; tableId: string; itemId: string }
  | { type: 'CUSTOMER_REMOVE_ITEM'; tableId: string; itemId: string }
  | { type: 'PLACE_ORDER'; tableId: string }
  | { type: 'SET_NOTES'; tableId: string; notes: string }
  | { type: 'MARK_PAID'; tableId: string }
  | { type: 'CLEAR_TABLE'; tableId: string }
  | { type: 'PUSH_NOTIFICATION'; notification: UINotification }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'REPLACE_FROM_STORAGE'; persisted: PersistedState }

const STORAGE_KEY = 'teashop_staff_dashboard_v1'

function createEmptyTable(): Table {
  return {
    status: 'EMPTY',
    items: [],
    notes: '',
    amount: 0,
    startedAt: null,
    lastPaidBill: null,
    billLog: [],
  }
}

function calculateAmount(items: OrderItem[]): number {
  return items.reduce((sum, it) => sum + it.price * it.qty, 0)
}

function ensureTables(totalTables: number, existing?: Record<string, Table>): Record<string, Table> {
  const next: Record<string, Table> = { ...(existing ?? {}) }
  for (let i = 1; i <= totalTables; i += 1) {
    const id = String(i)
    if (!next[id]) next[id] = createEmptyTable()
  }
  for (const id of Object.keys(next)) {
    const n = Number(id)
    if (!Number.isFinite(n) || n < 1 || n > totalTables) {
      delete next[id]
    }
  }
  return next
}

function buildDefaultState(): AppState {
  const totalTables = 20
  return {
    shop: { name: 'Roadside Tea Shop', totalTables },
    tables: ensureTables(totalTables),
    ui: {
      activeModal: null,
      notifications: [],
      selectedTableId: null,
    },
  }
}

function normalizePersisted(persisted: PersistedState): PersistedState {
  const totalTables = persisted?.shop?.totalTables ?? 20
  const tables = ensureTables(totalTables, persisted?.tables)

  for (const id of Object.keys(tables)) {
    const t = tables[id]
    t.items = Array.isArray(t.items) ? t.items : []
    t.notes = typeof t.notes === 'string' ? t.notes : ''
    t.amount = calculateAmount(t.items)
    t.startedAt = typeof t.startedAt === 'number' ? t.startedAt : null
    t.billLog = Array.isArray((t as Partial<Table>).billLog) ? (t as Partial<Table>).billLog! : []
    t.lastPaidBill =
      (t as Partial<Table>).lastPaidBill ?? (t.billLog.length ? t.billLog[t.billLog.length - 1] : null)
    t.status = t.items.length === 0 ? 'EMPTY' : t.status
  }

  return {
    shop: {
      name: persisted?.shop?.name ?? 'Roadside Tea Shop',
      totalTables,
    },
    tables,
  }
}

function serializePersisted(state: AppState): string {
  const persisted: PersistedState = { shop: state.shop, tables: state.tables }
  return JSON.stringify(persisted)
}

function hydrate(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildDefaultState()
    const parsed = JSON.parse(raw) as Partial<AppState> | PersistedState

    const maybePersisted: PersistedState =
      'ui' in (parsed as Partial<AppState>)
        ? {
            shop: (parsed as Partial<AppState>).shop as PersistedState['shop'],
            tables: (parsed as Partial<AppState>).tables as PersistedState['tables'],
          }
        : (parsed as PersistedState)

    const normalized = normalizePersisted(maybePersisted)

    return {
      shop: normalized.shop,
      tables: normalized.tables,
      ui: {
        activeModal: null,
        notifications: [],
        selectedTableId: null,
      },
    }
  } catch {
    return buildDefaultState()
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REPLACE_FROM_STORAGE': {
      const normalized = normalizePersisted(action.persisted)
      const nextNotifications = state.ui.notifications.filter((n) => {
        if (n.kind !== 'NEW_ORDER') return true
        const t = normalized.tables[n.tableId]
        return t?.status === 'ORDERED'
      })
      return {
        ...state,
        shop: normalized.shop,
        tables: normalized.tables,
        ui: {
          ...state.ui,
          notifications: nextNotifications,
        },
      }
    }
    case 'SELECT_TABLE':
      return {
        ...state,
        ui: { ...state.ui, selectedTableId: action.tableId },
      }

    case 'OPEN_MODAL':
      return {
        ...state,
        ui: { ...state.ui, activeModal: action.modal },
      }

    case 'CLOSE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, activeModal: null },
      }

    case 'UPDATE_TABLE_STATUS': {
      const prev = state.tables[action.tableId]
      if (!prev) return state
      const nextTable: Table = {
        ...prev,
        status: action.status,
        startedAt:
          action.status === 'EMPTY'
            ? null
            : prev.startedAt ?? (prev.items.length > 0 ? Date.now() : null),
      }

      const nextNotifications =
        action.status === 'ORDERED'
          ? state.ui.notifications
          : state.ui.notifications.filter(
              (n) => !(n.kind === 'NEW_ORDER' && n.tableId === action.tableId),
            )
      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
        ui: {
          ...state.ui,
          notifications: nextNotifications,
        },
      }
    }

    case 'CUSTOMER_ADD_ITEM': {
      const prev = state.tables[action.tableId]
      if (!prev) return state
      if (prev.status !== 'EMPTY') return state

      const qty = action.qty ?? 1
      const existingIdx = prev.items.findIndex((it) => it.id === action.item.id)
      const nextItems = [...prev.items]
      if (existingIdx >= 0) {
        const existing = nextItems[existingIdx]
        nextItems[existingIdx] = { ...existing, qty: existing.qty + qty }
      } else {
        nextItems.push({ ...action.item, qty })
      }

      const nextAmount = calculateAmount(nextItems)
      const nextTable: Table = {
        ...prev,
        items: nextItems,
        amount: nextAmount,
      }

      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
      }
    }

    case 'CUSTOMER_DECREMENT_ITEM': {
      const prev = state.tables[action.tableId]
      if (!prev) return state
      if (prev.status !== 'EMPTY') return state

      const idx = prev.items.findIndex((it) => it.id === action.itemId)
      if (idx < 0) return state

      const nextItems = [...prev.items]
      const existing = nextItems[idx]
      if (existing.qty <= 1) {
        nextItems.splice(idx, 1)
      } else {
        nextItems[idx] = { ...existing, qty: existing.qty - 1 }
      }

      const nextAmount = calculateAmount(nextItems)
      const nextTable: Table = {
        ...prev,
        items: nextItems,
        amount: nextAmount,
      }

      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
      }
    }

    case 'CUSTOMER_REMOVE_ITEM': {
      const prev = state.tables[action.tableId]
      if (!prev) return state
      if (prev.status !== 'EMPTY') return state

      const nextItems = prev.items.filter((it) => it.id !== action.itemId)
      if (nextItems.length === prev.items.length) return state

      const nextAmount = calculateAmount(nextItems)
      const nextTable: Table = {
        ...prev,
        items: nextItems,
        amount: nextAmount,
      }

      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
      }
    }

    case 'PLACE_ORDER': {
      const prev = state.tables[action.tableId]
      if (!prev) return state
      if (prev.status !== 'EMPTY') return state
      if (prev.items.length === 0) return state

      const nextTable: Table = {
        ...prev,
        status: 'ORDERED',
        startedAt: Date.now(),
      }

      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
      }
    }

    case 'DECREMENT_ITEM': {
      const prev = state.tables[action.tableId]
      if (!prev) return state

      const idx = prev.items.findIndex((it) => it.id === action.itemId)
      if (idx < 0) return state

      const nextItems = [...prev.items]
      const existing = nextItems[idx]
      if (existing.qty <= 1) {
        nextItems.splice(idx, 1)
      } else {
        nextItems[idx] = { ...existing, qty: existing.qty - 1 }
      }

      const nextAmount = calculateAmount(nextItems)
      const nextStatus: TableStatus = nextItems.length === 0 ? 'EMPTY' : prev.status === 'EMPTY' ? 'ORDERED' : prev.status
      const nextStartedAt = nextItems.length === 0 ? null : prev.startedAt ?? Date.now()

      const nextTable: Table = {
        ...prev,
        items: nextItems,
        amount: nextAmount,
        status: nextStatus,
        startedAt: nextStartedAt,
      }

      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
      }
    }

    case 'REMOVE_ITEM': {
      const prev = state.tables[action.tableId]
      if (!prev) return state

      const nextItems = prev.items.filter((it) => it.id !== action.itemId)
      if (nextItems.length === prev.items.length) return state

      const nextAmount = calculateAmount(nextItems)
      const nextStatus: TableStatus = nextItems.length === 0 ? 'EMPTY' : prev.status === 'EMPTY' ? 'ORDERED' : prev.status
      const nextStartedAt = nextItems.length === 0 ? null : prev.startedAt ?? Date.now()

      const nextTable: Table = {
        ...prev,
        items: nextItems,
        amount: nextAmount,
        status: nextStatus,
        startedAt: nextStartedAt,
      }

      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
      }
    }

    case 'ADD_ITEM': {
      const prev = state.tables[action.tableId]
      if (!prev) return state

      const qty = action.qty ?? 1
      const existingIdx = prev.items.findIndex((it) => it.id === action.item.id)
      const nextItems = [...prev.items]
      if (existingIdx >= 0) {
        const existing = nextItems[existingIdx]
        nextItems[existingIdx] = { ...existing, qty: existing.qty + qty }
      } else {
        nextItems.push({ ...action.item, qty })
      }

      const nextAmount = calculateAmount(nextItems)
      const nextStatus: TableStatus = prev.status === 'EMPTY' ? 'ORDERED' : prev.status

      const nextTable: Table = {
        ...prev,
        items: nextItems,
        amount: nextAmount,
        status: nextStatus,
        startedAt: prev.startedAt ?? Date.now(),
      }

      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
      }
    }

    case 'SET_NOTES': {
      const prev = state.tables[action.tableId]
      if (!prev) return state
      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: { ...prev, notes: action.notes },
        },
      }
    }

    case 'MARK_PAID': {
      const prev = state.tables[action.tableId]
      if (!prev) return state
      if (prev.amount <= 0) return state

      const itemsSnapshot = prev.items.map((it) => ({ ...it }))

      const notesSnapshot = prev.notes

      const paid: PaidBill = {
        paidAt: Date.now(),
        amount: prev.amount,
        items: itemsSnapshot,
        notes: notesSnapshot,
      }

      const nextTable: Table = {
        ...prev,
        status: 'EMPTY',
        items: [],
        notes: '',
        amount: 0,
        startedAt: null,
        lastPaidBill: paid,
        billLog: [...(prev.billLog ?? []), paid],
      }

      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: nextTable,
        },
      }
    }

    case 'CLEAR_TABLE': {
      if (!state.tables[action.tableId]) return state
      return {
        ...state,
        tables: {
          ...state.tables,
          [action.tableId]: createEmptyTable(),
        },
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(
            (n) => !(n.kind === 'NEW_ORDER' && n.tableId === action.tableId),
          ),
        },
      }
    }

    case 'PUSH_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.notification].slice(-20),
        },
      }

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter((n) => n.id !== action.id),
        },
      }

    default:
      return state
  }
}

export function useAppStore() {
  const [state, dispatch] = useReducer(reducer, undefined, hydrate)

  const lastPersistedRef = useRef<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) lastPersistedRef.current = raw
  }, [])

  useEffect(() => {
    try {
      const nextRaw = serializePersisted(state)
      if (lastPersistedRef.current === nextRaw) return
      lastPersistedRef.current = nextRaw
      localStorage.setItem(STORAGE_KEY, nextRaw)
    } catch {
      // ignore
    }
  }, [state])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      if (!e.newValue) return
      if (lastPersistedRef.current === e.newValue) return

      try {
        const parsed = JSON.parse(e.newValue) as PersistedState
        lastPersistedRef.current = e.newValue
        dispatch({ type: 'REPLACE_FROM_STORAGE', persisted: parsed })
      } catch {
        // ignore
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const tableIds = useMemo(() => {
    const total = state.shop.totalTables
    return Array.from({ length: total }, (_, idx) => String(idx + 1))
  }, [state.shop.totalTables])

  const actions = useMemo(
    () => ({
      selectTable: (tableId: string | null) => dispatch({ type: 'SELECT_TABLE', tableId }),
      openOrderModal: () => dispatch({ type: 'OPEN_MODAL', modal: 'ORDER' }),
      closeModal: () => dispatch({ type: 'CLOSE_MODAL' }),
      updateTableStatus: (tableId: string, status: TableStatus) =>
        dispatch({ type: 'UPDATE_TABLE_STATUS', tableId, status }),
      addItem: (tableId: string, item: Omit<OrderItem, 'qty'>, qty?: number) =>
        dispatch({ type: 'ADD_ITEM', tableId, item, qty }),
      customerAddItem: (tableId: string, item: Omit<OrderItem, 'qty'>, qty?: number) =>
        dispatch({ type: 'CUSTOMER_ADD_ITEM', tableId, item, qty }),
      decrementItem: (tableId: string, itemId: string) =>
        dispatch({ type: 'DECREMENT_ITEM', tableId, itemId }),
      removeItem: (tableId: string, itemId: string) => dispatch({ type: 'REMOVE_ITEM', tableId, itemId }),
      customerDecrementItem: (tableId: string, itemId: string) =>
        dispatch({ type: 'CUSTOMER_DECREMENT_ITEM', tableId, itemId }),
      customerRemoveItem: (tableId: string, itemId: string) =>
        dispatch({ type: 'CUSTOMER_REMOVE_ITEM', tableId, itemId }),
      placeOrder: (tableId: string) => dispatch({ type: 'PLACE_ORDER', tableId }),
      setNotes: (tableId: string, notes: string) => dispatch({ type: 'SET_NOTES', tableId, notes }),
      markPaid: (tableId: string) => dispatch({ type: 'MARK_PAID', tableId }),
      clearTable: (tableId: string) => dispatch({ type: 'CLEAR_TABLE', tableId }),
      notify: (message: string) =>
        dispatch({
          type: 'PUSH_NOTIFICATION',
          notification: { id: crypto.randomUUID(), kind: 'INFO', message, createdAt: Date.now() },
        }),
      notifyNewOrder: (tableId: string, amount: number) =>
        dispatch({
          type: 'PUSH_NOTIFICATION',
          notification: { id: crypto.randomUUID(), kind: 'NEW_ORDER', tableId, amount, createdAt: Date.now() },
        }),
      dismissNotification: (id: string) => dispatch({ type: 'DISMISS_NOTIFICATION', id }),
    }),
    [],
  )

  return { state, dispatch, actions, tableIds }
}
