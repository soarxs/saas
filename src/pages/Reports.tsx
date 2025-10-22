import { useState } from 'react'
import { useTables } from '../contexts/TableContext'
import { useShift } from '../contexts/ShiftContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Filter
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { generateShiftReportWeb } from '../lib/printService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export function Reports() {
  const { orders, payments, products } = useTables()
  const { currentShift } = useShift()
  
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'shift'>('sales')
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all')

  // Filtrar dados por data
  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.created_at).toISOString().split('T')[0]
    return paymentDate >= dateRange.start && paymentDate <= dateRange.end
  })

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at).toISOString().split('T')[0]
    return orderDate >= dateRange.start && orderDate <= dateRange.end
  })

  // Relatório de Vendas do Dia
  const getSalesReport = () => {
    const salesByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      amount: 0
    }))

    filteredPayments.forEach(payment => {
      const hour = new Date(payment.created_at).getHours()
      salesByHour[hour].amount += payment.amount
    })

    const salesByMethod = filteredPayments.reduce((acc, payment) => {
      acc[payment.payment_method] = (acc[payment.payment_method] || 0) + payment.amount
      return acc
    }, {} as Record<string, number>)

    const totalSales = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalOrders = filteredOrders.length

    return {
      salesByHour,
      salesByMethod,
      totalSales,
      totalOrders,
      averageTicket: totalOrders > 0 ? totalSales / totalOrders : 0
    }
  }

  // Relatório de Produtos Mais Vendidos
  const getProductsReport = () => {
    const productSales = products.map(product => {
      const productOrders = filteredOrders.filter(order => order.product_id === product.id)
      const totalQuantity = productOrders.reduce((sum, order) => sum + order.quantity, 0)
      const totalRevenue = productOrders.reduce((sum, order) => sum + order.total_price, 0)
      
      return {
        id: product.id,
        name: product.name,
        code: product.code,
        category: product.category,
        quantity: totalQuantity,
        revenue: totalRevenue,
        orders: productOrders.length
      }
    }).filter(p => p.quantity > 0).sort((a, b) => b.quantity - a.quantity)

    return productSales
  }

  // Dados para gráficos
  const salesData = getSalesReport()
  const productsData = getProductsReport()

  // Configuração do gráfico de vendas por hora
  const salesChartData = {
    labels: salesData.salesByHour.map(item => item.hour),
    datasets: [
      {
        label: 'Vendas (R$)',
        data: salesData.salesByHour.map(item => item.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  // Configuração do gráfico de vendas por método de pagamento
  const paymentMethodData = {
    labels: Object.keys(salesData.salesByMethod),
    datasets: [
      {
        data: Object.values(salesData.salesByMethod),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vendas por Hora',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'R$ ' + value.toFixed(2)
          }
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Vendas por Forma de Pagamento',
      },
    },
  }

  const handlePrintShiftReport = () => {
    if (!currentShift) {
      alert('Nenhum turno aberto para imprimir relatório')
      return
    }

    // Simular dados do relatório de fechamento
    const shiftReport = {
      shiftId: currentShift.id,
      startTime: currentShift.start_time,
      endTime: new Date().toISOString(),
      operator: 'Usuário Atual',
      initialCashFund: currentShift.initial_cash_fund,
      salesByMethod: salesData.salesByMethod,
      totalWithdrawals: currentShift.withdrawals.reduce((sum, w) => sum + w.value, 0),
      totalAdditions: currentShift.additions.reduce((sum, a) => sum + a.value, 0),
      expectedCash: currentShift.initial_cash_fund + salesData.totalSales,
      realCash: currentShift.initial_cash_fund + salesData.totalSales,
      difference: 0,
      totalSales: salesData.totalSales
    }

    const webContent = generateShiftReportWeb(shiftReport)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Relatório de Fechamento</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 5mm;
                width: 70mm;
              }
            }
          </style>
        </head>
        <body>
          ${webContent}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['Data', 'Hora', 'Produto', 'Quantidade', 'Valor Unitário', 'Valor Total', 'Forma de Pagamento'],
      ...filteredOrders.map(order => {
        const product = products.find(p => p.id === order.product_id)
        const payment = payments.find(p => p.table_id === order.table_id)
        return [
          new Date(order.created_at).toLocaleDateString('pt-BR'),
          new Date(order.created_at).toLocaleTimeString('pt-BR'),
          product?.name || 'Produto não encontrado',
          order.quantity,
          order.unit_price.toFixed(2),
          order.total_price.toFixed(2),
          payment?.payment_method || 'N/A'
        ]
      })
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_vendas_${dateRange.start}_${dateRange.end}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de vendas e performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          {currentShift && (
            <Button
              onClick={handlePrintShiftReport}
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Imprimir Fechamento
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_debito">Cartão Débito</option>
                <option value="cartao_credito">Cartão Crédito</option>
                <option value="pix">PIX</option>
                <option value="vale_alimentacao">Vale Alimentação</option>
                <option value="cheque">Cheque</option>
                <option value="cortesia">Cortesia</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Origem</Label>
              <select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas</option>
                <option value="mesa">Mesa</option>
                <option value="balcao">Balcão</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abas */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'sales' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sales')}
          className={activeTab === 'sales' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Vendas do Dia
        </Button>
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('products')}
          className={activeTab === 'products' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <Package className="h-4 w-4 mr-2" />
          Produtos
        </Button>
        <Button
          variant={activeTab === 'shift' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('shift')}
          className={activeTab === 'shift' ? 'bg-purple-600 hover:bg-purple-700' : ''}
        >
          <FileText className="h-4 w-4 mr-2" />
          Fechamento
        </Button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesData.totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  Período selecionado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Pedidos realizados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(salesData.averageTicket)}</div>
                <p className="text-xs text-muted-foreground">
                  Por pedido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Período</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dateRange.start === dateRange.end 
                    ? new Date(dateRange.start).toLocaleDateString('pt-BR')
                    : `${new Date(dateRange.start).toLocaleDateString('pt-BR')} - ${new Date(dateRange.end).toLocaleDateString('pt-BR')}`
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Data selecionada
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={salesChartData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <Pie data={paymentMethodData} options={pieOptions} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productsData.slice(0, 10).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.code} - {product.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{product.quantity} unidades</div>
                      <div className="text-sm text-green-600">{formatCurrency(product.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'shift' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Fechamento</CardTitle>
            </CardHeader>
            <CardContent>
              {currentShift ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Informações do Turno</h3>
                      <div className="space-y-1 text-sm">
                        <div>Início: {new Date(currentShift.start_time).toLocaleString('pt-BR')}</div>
                        <div>Operador: Usuário Atual</div>
                        <div>Fundo Inicial: {formatCurrency(currentShift.initial_cash_fund)}</div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Resumo Financeiro</h3>
                      <div className="space-y-1 text-sm">
                        <div>Total Vendas: {formatCurrency(salesData.totalSales)}</div>
                        <div>Total Sangrias: {formatCurrency(currentShift.withdrawals.reduce((sum, w) => sum + w.value, 0))}</div>
                        <div>Total Reforços: {formatCurrency(currentShift.additions.reduce((sum, a) => sum + a.value, 0))}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Vendas por Forma de Pagamento</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(salesData.salesByMethod).map(([method, amount]) => (
                        <div key={method} className="text-sm">
                          <span className="capitalize">{method.replace('_', ' ')}:</span>
                          <span className="font-semibold ml-1">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum turno aberto</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}