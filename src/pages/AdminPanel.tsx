import { useState, useEffect } from 'react'
import { useTables } from '../contexts/TableContext'
import { useShift } from '../contexts/ShiftContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Minus,
  FileText,
  Settings
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'
import { ShiftDialog } from '../components/ShiftDialog'
import { WithdrawalDialog } from '../components/WithdrawalDialog'
import { AdditionDialog } from '../components/AdditionDialog'
import { ShiftReportDialog } from '../components/ShiftReportDialog'

export function AdminPanel() {
  const { products, tables, orders, payments } = useTables()
  const { currentShift } = useShift()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Estados dos diálogos
  const [shiftDialog, setShiftDialog] = useState(false)
  const [withdrawalDialog, setWithdrawalDialog] = useState(false)
  const [additionDialog, setAdditionDialog] = useState(false)
  const [reportDialog, setReportDialog] = useState(false)

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Estatísticas
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.is_active).length
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalOrders = orders.length

  const handleAddProduct = () => {
    toast.success('Funcionalidade de adicionar produto será implementada')
  }

  const handleEditProduct = (product: any) => {
    toast.success(`Editando produto: ${product.name}`)
  }

  const handleDeleteProduct = (product: any) => {
    toast.success(`Produto ${product.name} será removido`)
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F8') {
        event.preventDefault()
        setWithdrawalDialog(true)
      } else if (event.key === 'F9') {
        event.preventDefault()
        setAdditionDialog(true)
      } else if (event.key === 'F10') {
        event.preventDefault()
        setReportDialog(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie produtos, usuários e configurações</p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} ativos
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
              Todos os pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Histórico completo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tables.filter(t => t.status !== 'livre').length}
            </div>
            <p className="text-xs text-muted-foreground">
              De {tables.length} mesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Utilitários de Caixa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Utilitários de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status do Turno */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Status do Turno</span>
              </div>
              <div className={`text-lg font-bold ${
                currentShift ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentShift ? 'Aberto' : 'Fechado'}
              </div>
              {currentShift && (
                <div className="text-xs text-gray-500 mt-1">
                  Fundo: {formatCurrency(currentShift.initial_cash_fund)}
                </div>
              )}
            </div>

            {/* Botão Abrir Turno */}
            <Button
              onClick={() => setShiftDialog(true)}
              className="h-auto p-4 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={!!currentShift}
            >
              <Clock className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Abrir Turno</div>
                <div className="text-xs opacity-90">Fundo inicial</div>
              </div>
            </Button>

            {/* Botão Sangria */}
            <Button
              onClick={() => setWithdrawalDialog(true)}
              className="h-auto p-4 flex flex-col items-center gap-2 bg-red-600 hover:bg-red-700"
              disabled={!currentShift}
            >
              <Minus className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Sangria</div>
                <div className="text-xs opacity-90">F8</div>
              </div>
            </Button>

            {/* Botão Reforço */}
            <Button
              onClick={() => setAdditionDialog(true)}
              className="h-auto p-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700"
              disabled={!currentShift}
            >
              <Plus className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Reforço</div>
                <div className="text-xs opacity-90">F9</div>
              </div>
            </Button>
          </div>

          {/* Botão Relatório */}
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setReportDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!currentShift}
            >
              <FileText className="h-4 w-4 mr-2" />
              Relatório do Turno (F10)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gestão de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
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
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas as categorias' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-left py-3 px-4">Preço</th>
                  <th className="text-left py-3 px-4">Estoque</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{product.code}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500">{product.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={product.stock <= 5 ? 'text-red-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={product.is_active ? 'success' : 'secondary'}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gestão de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Funcionalidade de gestão de usuários será implementada</p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogos */}
      <ShiftDialog
        open={shiftDialog}
        onOpenChange={setShiftDialog}
      />

      <WithdrawalDialog
        open={withdrawalDialog}
        onOpenChange={setWithdrawalDialog}
      />

      <AdditionDialog
        open={additionDialog}
        onOpenChange={setAdditionDialog}
      />

      <ShiftReportDialog
        open={reportDialog}
        onOpenChange={setReportDialog}
      />
    </div>
  )
}
