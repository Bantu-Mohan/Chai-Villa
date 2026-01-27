import { useEffect, useMemo, useRef, useState } from 'react'
import CustomerTable from './components/CustomerTable/CustomerTable'
import DashboardLayout from './components/DashboardLayout/DashboardLayout'
import NotificationToast from './components/NotificationToast/NotificationToast'
import OrderModal from './components/OrderModal/OrderModal'
import TableGrid from './components/TableGrid/TableGrid'
import type { TableStatus } from './hooks/useAppStore'
import { useAppStore } from './hooks/useAppStore'
import styles from './App.module.css'

let sharedAudioCtx: AudioContext | null = null
let soundArmed = false

function getAudioContextCtor(): (typeof AudioContext) | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return w.AudioContext || w.webkitAudioContext || null
}

function armSound() {
  try {
    const Ctor = getAudioContextCtor()
    if (!Ctor) return
    if (!sharedAudioCtx) sharedAudioCtx = new Ctor()

    // Resume must happen after a user gesture in many browsers.
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume()
    }

    soundArmed = true
  } catch {
    // ignore
  }
}

function playBeep() {
  try {
    if (!soundArmed || !sharedAudioCtx) return
    if (sharedAudioCtx.state === 'suspended') return

    const osc = sharedAudioCtx.createOscillator()
    const gain = sharedAudioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.06
    osc.connect(gain)
    gain.connect(sharedAudioCtx.destination)
    osc.start()
    window.setTimeout(() => {
      osc.stop()
    }, 180)
  } catch {
    // ignore
  }
}

function App() {
  const { state, actions, tableIds } = useAppStore()

  const customerTableId = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('table')
    if (!t) return null
    const n = Number(t)
    if (!Number.isFinite(n)) return null
    const id = String(n)
    if (!state.tables[id]) return null
    return id
  }, [state.tables])

  const isCustomerMode = customerTableId !== null

  useEffect(() => {
    if (isCustomerMode) {
      document.body.classList.add('customer-mode')
    } else {
      document.body.classList.remove('customer-mode')
    }

    return () => {
      document.body.classList.remove('customer-mode')
    }
  }, [isCustomerMode])

  useEffect(() => {
    if (isCustomerMode) return

    const onFirstGesture = () => {
      armSound()
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
      window.removeEventListener('touchstart', onFirstGesture)
    }

    window.addEventListener('pointerdown', onFirstGesture)
    window.addEventListener('keydown', onFirstGesture)
    window.addEventListener('touchstart', onFirstGesture)

    return () => {
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('keydown', onFirstGesture)
      window.removeEventListener('touchstart', onFirstGesture)
    }
  }, [isCustomerMode])

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const selectedTableId = state.ui.selectedTableId
  const selectedTable = selectedTableId ? state.tables[selectedTableId] : null

  const isModalOpen = state.ui.activeModal === 'ORDER' && Boolean(selectedTableId && selectedTable)

  const selectedInfo = useMemo(() => {
    if (!selectedTableId || !selectedTable) return null
    return { tableId: selectedTableId, table: selectedTable }
  }, [selectedTableId, selectedTable])

  const sortedTableIds = useMemo(() => {
    const ids = [...tableIds]
    ids.sort((a, b) => {
      const ta = state.tables[a]
      const tb = state.tables[b]

      const aKey = ta?.startedAt ?? Number.POSITIVE_INFINITY
      const bKey = tb?.startedAt ?? Number.POSITIVE_INFINITY

      if (aKey !== bKey) return aKey - bKey
      return Number(a) - Number(b)
    })
    return ids
  }, [state.tables, tableIds])

  const prevTableRef = useRef<Record<string, { status: TableStatus; startedAt: number | null }>>({})

  useEffect(() => {
    if (isCustomerMode) return

    const prev = prevTableRef.current
    for (const id of tableIds) {
      const t = state.tables[id]
      if (!t) continue
      const prevT = prev[id]
      const wasOrdered = prevT?.status === 'ORDERED'

      if (t.status === 'ORDERED' && !wasOrdered && t.items.length > 0) {
        playBeep()
        actions.notifyNewOrder(id, t.amount)
      }
    }

    const next: Record<string, { status: TableStatus; startedAt: number | null }> = {}
    for (const id of tableIds) {
      const t = state.tables[id]
      if (!t) continue
      next[id] = { status: t.status, startedAt: t.startedAt }
    }
    prevTableRef.current = next
  }, [actions, isCustomerMode, state.tables, tableIds])

  if (isCustomerMode && customerTableId) {
    const table = state.tables[customerTableId]
    return (
      <div className={styles.app}>
        <CustomerTable
          shopName={state.shop.name}
          tableId={customerTableId}
          table={table}
          onAddItem={(item) => actions.customerAddItem(customerTableId, item, 1)}
          onDecItem={(itemId) => actions.customerDecrementItem(customerTableId, itemId)}
          onPlaceOrder={() => actions.placeOrder(customerTableId)}
        />
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <DashboardLayout
        shopName={state.shop.name}
        totalTables={state.shop.totalTables}
        selectedTableId={selectedTableId}
        onOpenOrder={() => {
          if (!selectedTableId) return
          actions.openOrderModal()
        }}
      >
        <div className={styles.gridWrap}>
          <TableGrid
            tableIds={sortedTableIds}
            tables={state.tables}
            now={now}
            selectedTableId={selectedTableId}
            onSelectTable={(id) => {
              actions.selectTable(id)
              actions.openOrderModal()
            }}
          />
        </div>
      </DashboardLayout>

      {selectedInfo ? (
        <OrderModal
          open={isModalOpen}
          tableId={selectedInfo.tableId}
          table={selectedInfo.table}
          onClose={() => actions.closeModal()}
          onAddItem={(item) => {
            actions.addItem(selectedInfo.tableId, item, 1)
            actions.notify(`Added ${item.name} to Table ${selectedInfo.tableId}`)
          }}
          onDecrementItem={(itemId: string) => {
            actions.decrementItem(selectedInfo.tableId, itemId)
          }}
          onRemoveItem={(itemId: string) => {
            actions.removeItem(selectedInfo.tableId, itemId)
          }}
          onStatusChange={(status) => {
            actions.updateTableStatus(selectedInfo.tableId, status)
            actions.notify(`Table ${selectedInfo.tableId} → ${status}`)
          }}
          onMarkPaid={() => {
            const amount = selectedInfo.table.amount
            actions.markPaid(selectedInfo.tableId)
            actions.notify(`Paid: Table ${selectedInfo.tableId} • ₹${amount.toFixed(0)}`)
          }}
          onNotesChange={(notes) => {
            actions.setNotes(selectedInfo.tableId, notes)
          }}
          onClear={() => {
            actions.clearTable(selectedInfo.tableId)
            actions.notify(`Cleared Table ${selectedInfo.tableId}`)
          }}
        />
      ) : null}

      <NotificationToast
        notifications={state.ui.notifications}
        onDismiss={actions.dismissNotification}
        onOpenTable={(tableId) => {
          actions.selectTable(tableId)
          actions.openOrderModal()
        }}
      />
    </div>
  )
}

export default App
