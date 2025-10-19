import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalesStore } from '../store/salesStore';
import { useStore } from '../store/useStore';
import { useBackup } from '../hooks/useBackup';
import AdvancedReports from './AdvancedReports';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, DollarSign, ShoppingBag, TrendingUp, Download, Upload, Database, BarChart3 } from 'lucide-react';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Reports = () => {
  const { sales } = useSalesStore();
  const { currentShift } = useStore();
  const [reportType, setReportType] = useState('current-shift');
  const { createManualBackup, exportBackup, importBackup, getAvailableBackups } = useBackup();
  const [showBackupSection, setShowBackupSection] = useState(false);
  const [showAdvancedReports, setShowAdvancedReports] = useState(false);

  // Helper function to get sales for a specific date
  const getSalesForDate = (date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return sales.filter(sale => 
      isWithinInterval(new Date(sale.createdAt), { start, end })
    );
  };

  // Current shift data
  const getCurrentShiftSales = () => {
    if (!currentShift?.isActive) return [];
    return sales.filter(sale => sale.shiftId === currentShift.id);
  };

  const currentShiftSales = getCurrentShiftSales();
  const currentShiftTotal = currentShiftSales.reduce((sum, sale) => sum + sale.total, 0);
  const currentShiftItems = currentShiftSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Today's data
  const todaySales = getSalesForDate(new Date());
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const todayItems = todaySales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  // Payment breakdown for current report
  const getReportData = () => {
    switch (reportType) {
      case 'current-shift':
        return currentShiftSales;
      case 'today':
        return todaySales;
      case 'all-time':
        return sales;
      default:
        return currentShiftSales;
    }
  };

  const reportSales = getReportData();
  const reportTotal = reportSales.reduce((sum, sale) => sum + sale.total, 0);
  const reportItems = reportSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const getPaymentBreakdown = (salesData: any[]) => {
    return salesData.reduce((breakdown, sale) => {
      breakdown[sale.paymentMethod] += sale.total;
      return breakdown;
    }, {
      dinheiro: 0,
      debito: 0,
      credito: 0,
      pix: 0,
      cortesia: 0,
    });
  };

  const paymentBreakdown = getPaymentBreakdown(reportSales);

  // Top products data
  const productSales = reportSales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      if (acc[item.productName]) {
        acc[item.productName].quantity += item.quantity;
        acc[item.productName].revenue += item.price * item.quantity;
      } else {
        acc[item.productName] = {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        };
      }
    });
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Payment method data for charts
  const paymentData = Object.entries(paymentBreakdown).map(([method, amount]) => ({
    name: method.charAt(0).toUpperCase() + method.slice(1),
    value: Number(amount),
    percentage: reportTotal > 0 ? ((Number(amount) / reportTotal) * 100) : 0
  })).filter(item => item.value > 0);

  // Sales by hour data
  const salesByHour = reportSales.reduce((acc, sale) => {
    const hour = new Date(sale.createdAt).getHours();
    const hourKey = `${hour}:00`;
    if (acc[hourKey]) {
      acc[hourKey].total += sale.total;
      acc[hourKey].count += 1;
    } else {
      acc[hourKey] = { hour: hourKey, total: sale.total, count: 1 };
    }
    return acc;
  }, {} as Record<string, { hour: string; total: number; count: number }>);

  const hourlyData = Object.values(salesByHour).sort((a, b) => 
    parseInt(a.hour) - parseInt(b.hour)
  );

  const CHART_COLORS = ['#FF6B35', '#F7931E', '#FFD700', '#32CD32', '#1E90FF'];

  const getReportTitle = () => {
    switch (reportType) {
      case 'current-shift':
        return 'Turno Atual';
      case 'today':
        return 'Hoje';
      case 'all-time':
        return 'Todos os Períodos';
      default:
        return 'Relatório';
    }
  };

  // Debug apenas se necessário
  if (process.env.NODE_ENV === 'development' && sales.length === 0) {
    console.log('Reports - Nenhuma venda encontrada');
  }

  // Se relatórios avançados estiverem ativos, mostrar apenas eles
  if (showAdvancedReports) {
    return <AdvancedReports onBack={() => setShowAdvancedReports(false)} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">Análise de vendas e desempenho</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAdvancedReports(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Relatórios Avançados
          </Button>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-shift">Turno Atual</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="all-time">Todos os Períodos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {reportTotal.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Vendidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportSales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {reportSales.length > 0 ? (reportTotal / reportSales.length).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento - {getReportTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: R$ ${Number(value).toFixed(2)}`}
                  >
                    {paymentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma venda encontrada
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos - {getReportTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [Number(value), 'Quantidade']} />
                  <Bar dataKey="quantity" fill="#FF6B35" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma venda encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales by Hour */}
      {reportType === 'today' && (
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Hora - Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Total']} />
                  <Bar dataKey="total" fill="#F7931E" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma venda encontrada
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown por Forma de Pagamento - {getReportTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Dinheiro</p>
              <p className="text-xl font-semibold">R$ {paymentBreakdown.dinheiro.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Débito</p>
              <p className="text-xl font-semibold">R$ {paymentBreakdown.debito.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Crédito</p>
              <p className="text-xl font-semibold">R$ {paymentBreakdown.credito.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">PIX</p>
              <p className="text-xl font-semibold">R$ {paymentBreakdown.pix.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Cortesia</p>
              <p className="text-xl font-semibold">R$ {paymentBreakdown.cortesia.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Backup */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Backup e Restauração
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBackupSection(!showBackupSection)}
            >
              {showBackupSection ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </CardHeader>
        {showBackupSection && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={createManualBackup}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Database className="w-4 h-4" />
                Criar Backup
              </Button>
              
              <Button
                onClick={exportBackup}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                Exportar Backup
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      importBackup(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  className="flex items-center gap-2 w-full"
                  variant="outline"
                >
                  <Upload className="w-4 h-4" />
                  Importar Backup
                </Button>
              </div>
            </div>

            {/* Lista de backups disponíveis */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Backups Disponíveis:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {getAvailableBackups().map((backup) => (
                  <div
                    key={backup.key}
                    className="flex items-center justify-between p-2 border rounded-lg text-sm"
                  >
                    <span>{backup.date}</span>
                    <span className="text-gray-500 text-xs">
                      {backup.key.includes('manual') ? 'Manual' : 'Automático'}
                    </span>
                  </div>
                ))}
                {getAvailableBackups().length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum backup encontrado</p>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Reports;
