import { useState, useEffect } from 'react'
import { useTables } from '../contexts/TableContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Plus, 
  Minus, 
  Search,
  ShoppingCart
} from 'lucide-react'
import { formatCurrency, getOrderStatusColor } from '../lib/utils'

interface OrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTable?: any
}

export function OrderDialog({ open, onOpenChange, selectedTable }: OrderDialogProps) {
  const { 
    products, 
    addOrder, 
    getTableOrdersWithProducts, 
    updateOrderStatus,
    closeTable,
    openTable
  } = useTables()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  // Abre a mesa automaticamente se ela estiver livre
  useEffect(() => {
    if (open && selectedTable && selectedTable.status === 'livre') {
      // Abre a mesa automaticamente com dados padrão
      openTable(selectedTable.id, 'Cliente', 1)
    }
  }, [open, selectedTable, openTable])

  const tableOrders = selectedTable ? getTableOrdersWithProducts(selectedTable.id) : []
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory && product.is_active
  })

  const handleAddProduct = async (productId: string) => {
    if (!selectedTable) return

    setLoading(true)
    try {
      await addOrder(selectedTable.id, productId, 1)
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    setLoading(true)
    try {
      await updateOrderStatus(orderId, status)
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseTable = async () => {
    if (!selectedTable) return

    setLoading(true)
    try {
      await closeTable(selectedTable.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao fechar mesa:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = tableOrders.reduce((sum, order) => sum + order.total_price, 0)

  if (!selectedTable) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mesa {selectedTable.number} - {selectedTable.customer_name || 'Cliente'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Produtos */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as categorias' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.code}</div>
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddProduct(product.id)}
                        disabled={loading || product.stock <= 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pedidos da Mesa */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pedidos</h3>
              <Badge variant="outline">
                {tableOrders.length} itens
              </Badge>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {tableOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pedido ainda
                </div>
              ) : (
                tableOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{order.product.name}</div>
                          <div className="text-xs text-gray-500">{order.product.code}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {formatCurrency(order.total_price)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.quantity}x {formatCurrency(order.unit_price)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${getOrderStatusColor(order.status)}`}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="preparando">Preparando</option>
                          <option value="pronto">Pronto</option>
                          <option value="entregue">Entregue</option>
                        </select>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleAddProduct(order.product_id)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{order.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Total */}
            {tableOrders.length > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleCloseTable}
            disabled={loading}
          >
            Fechar Mesa
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                // Abrir diálogo de pagamento
                onOpenChange(false)
              }}
              disabled={loading || tableOrders.length === 0}
            >
              Finalizar Pedido
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
