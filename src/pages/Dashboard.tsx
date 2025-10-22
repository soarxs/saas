import { useState } from 'react'
import { useTables } from '../contexts/TableContext'
import { useShift } from '../contexts/ShiftContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { 
  Users, 
  Clock, 
  DollarSign, 
  ShoppingCart,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { formatCurrency, getTableStatusColor, getTableStatusText } from '../lib/utils'
import { OpenTableDialog } from '../components/OpenTableDialog'
import { OrderDialog } from '../components/OrderDialog'
import { PaymentDialog } from '../components/PaymentDialog'

export function Dashboard() {
  const { tables, orders, loading } = useTables()
  const { currentShift } = useShift()
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [openTableDialog, setOpenTableDialog] = useState(false)
  const [orderDialog, setOrderDialog] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Estatísticas
  const totalTables = tables.length
  const occupiedTables = tables.filter(t => t.status === 'ocupada').length
  const totalRevenue = tables.reduce((sum, table) => sum + table.total_amount, 0)
  const pendingOrders = orders.filter(o => o.status === 'pendente').length

  // Filtrar mesas
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.number.toString().includes(searchTerm) ||
                         table.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleTableClick = (table: any) => {
    if (!currentShift) {
      alert('Você precisa abrir um turno antes de fazer lançamentos!\n\nAcesse: Admin → Abrir Turno')
      return
    }
    setSelectedTable(table)
    if (table.status === 'livre') {
      setOpenTableDialog(true)
    } else {
      setOrderDialog(true)
    }
  }

  const handlePaymentClick = (table: any) => {
    setSelectedTable(table)
    setPaymentDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
          <p className="text-gray-600">Gerencie suas mesas e pedidos</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => {
            if (!currentShift) {
              alert('Você precisa abrir um turno antes de fazer lançamentos!\n\nAcesse: Admin → Abrir Turno')
              return
            }
            setOpenTableDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Mesa
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mesas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTables}</div>
            <p className="text-xs text-muted-foreground">
              {occupiedTables} ocupadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando preparo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Mesas abertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Mesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número da mesa ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos os status</option>
                <option value="livre">Livre</option>
                <option value="ocupada">Ocupada</option>
                <option value="aguardando">Aguardando</option>
                <option value="pronto">Pronto</option>
              </select>
            </div>
          </div>

          {/* Contadores de Status */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Livre: {tables.filter(t => t.status === 'livre').length}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Ocupada: {tables.filter(t => t.status === 'ocupada').length}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Aguardando: {tables.filter(t => t.status === 'aguardando').length}</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Pronto: {tables.filter(t => t.status === 'pronto').length}</span>
            </div>
          </div>

          {/* Grade de Mesas */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {filteredTables.map((table) => (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  table.status === 'livre' 
                    ? 'hover:bg-green-50 border-green-200' 
                    : table.status === 'ocupada'
                    ? 'hover:bg-red-50 border-red-200'
                    : table.status === 'aguardando'
                    ? 'hover:bg-yellow-50 border-yellow-200'
                    : 'hover:bg-blue-50 border-blue-200'
                }`}
                onClick={() => handleTableClick(table)}
              >
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${getTableStatusColor(table.status)}`}>
                      {getTableStatusText(table.status)}
                    </div>
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {table.number}
                    </div>
                    {table.customer_name && (
                      <div className="text-xs text-gray-600 mb-1 truncate">
                        {table.customer_name}
                      </div>
                    )}
                    {table.customer_count && (
                      <div className="text-xs text-gray-500 mb-1">
                        {table.customer_count}p
                      </div>
                    )}
                    {table.total_amount > 0 && (
                      <div className="text-xs font-semibold text-green-600">
                        {formatCurrency(table.total_amount)}
                      </div>
                    )}
                  </div>
                  
                  {table.status !== 'livre' && (
                    <div className="mt-2 flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTableClick(table)
                        }}
                      >
                        Pedidos
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePaymentClick(table)
                        }}
                      >
                        Pagar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <OpenTableDialog
        open={openTableDialog}
        onOpenChange={setOpenTableDialog}
        selectedTable={selectedTable}
      />

      <OrderDialog
        open={orderDialog}
        onOpenChange={setOrderDialog}
        selectedTable={selectedTable}
      />

      <PaymentDialog
        open={paymentDialog}
        onOpenChange={setPaymentDialog}
        selectedTable={selectedTable}
      />
    </div>
  )
}
