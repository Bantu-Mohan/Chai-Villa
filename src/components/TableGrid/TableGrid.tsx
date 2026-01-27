import type { Table } from '../../hooks/useAppStore'
import TableCard from '../TableCard/TableCard'
import styles from './TableGrid.module.css'

type Props = {
  tableIds: string[]
  tables: Record<string, Table>
  now: number
  selectedTableId: string | null
  onSelectTable: (tableId: string) => void
}

export default function TableGrid({ tableIds, tables, now, selectedTableId, onSelectTable }: Props) {
  return (
    <div className={styles.grid}>
      {tableIds.map((id) => (
        <TableCard
          key={id}
          tableId={id}
          table={tables[id]}
          now={now}
          selected={selectedTableId === id}
          onClick={() => onSelectTable(id)}
        />
      ))}
    </div>
  )
}
