import { useState } from 'react'
import { useTables } from '../contexts/TableContext'
import { useShift } from '../contexts/ShiftContext'
import { OrderDialog } from '../components/OrderDialog'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

export function Dashboard() {
  const { tables, loading } = useTables()
  const { currentShift } = useShift()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTable, setSelectedTable] = useState<any | null>(null)
  const [orderDialog, setOrderDialog] = useState(false)

  const handleTableClick = (table: any) => {
    if (!currentShift) {
      toast.error('Você precisa abrir um turno antes de fazer lançamentos!\n\nAcesse: Admin → Abrir Turno')
      return
    }
    setSelectedTable(table)
    setOrderDialog(true)
  }

  // Filtrar mesas
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.number.toString().includes(searchTerm) ||
                         table.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="p-4">
      {/* Busca */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar mesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grade de Mesas */}
      <div className="grid grid-cols-10 gap-2">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          filteredTables.map((table) => (
            <Button
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`
                h-16 flex flex-col items-center justify-center text-xs font-bold
                ${table.status === 'livre' 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
                }
                ${selectedTable?.id === table.id ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <span>{table.number.toString().padStart(2, '0')}</span>
              <span>R$ {table.total_amount.toFixed(2).replace('.', ',')}</span>
            </Button>
          ))
        )}
      </div>

      {/* Diálogo de Pedidos */}
      {selectedTable && (
        <OrderDialog
          open={orderDialog}
          onOpenChange={setOrderDialog}
          selectedTable={selectedTable}
        />
      )}
    </div>
  )
}