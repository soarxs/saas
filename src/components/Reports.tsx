import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalesStore } from '../store/salesStore';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, DollarSign, ShoppingBag, TrendingUp, Download, Upload, Database, BarChart3 } from 'lucide-react';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CHART_COLORS = ['#FF6B35', '#F7931E', '#FFD700', '#32CD32', '#1E90FF'];

const Reports = () => {
  const { sales } = useSalesStore();
  const { currentShift } = useStore();
  const [reportType, setReportType] = useState('current-shift');
  const [showBackupSection, setShowBackupSection] = useState(false);

  const getSalesForDate = (date: Date) => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    return sales.filter(sale => isWithinInterval(new Date(sale.createdAt), { start, end }));
  };

  const getCurrentShiftSales = () => {
    if (!currentShift?.isActive) return [];
    return sales.filter(sale => sale.shiftId === currentShift.id);
  };

  const getReportData = () => {
    switch (reportType) {
      case 'current-shift': return getCurrentShiftSales();
      case 'today': return getSalesForDate(new Date());
      case 'yesterday': return getSalesForDate(new Date(Date.now() - 86400000));
      case 'this-week': return sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return saleDate >= weekStart;
      });
      case 'this-month': return sales.filter(sale => {
        const saleDate = new Date(sale.createdAt);
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return saleDate >= monthStart;
      });
      default: return sales;
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
    }, { dinheiro: 0, debito: 0, credito: 0, pix: 0, cortesia: 0 });
  };

  const paymentBreakdown = getPaymentBreakdown(reportSales);
  const paymentData = Object.entries(paymentBreakdown)
    .map(([method, amount]) => ({
      name: method.charAt(0).toUpperCase() + method.slice(1),
      value: Number(amount),
      percentage: reportTotal > 0 ? ((Number(amount) / reportTotal) * 100) : 0
    }))
    .filter(item => item.value > 0);

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


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBackupSection(!showBackupSection)}>
            <Database className="w-4 h-4 mr-2" />
            Backup
          </Button>
        </div>
      </div>

      {/* Seletor de período */}
      <Card>
        <CardContent className="pt-6">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-shift">Turno Atual</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="yesterday">Ontem</SelectItem>
              <SelectItem value="this-week">Esta Semana</SelectItem>
              <SelectItem value="this-month">Este Mês</SelectItem>
              <SelectItem value="all">Todos os Períodos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {reportTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {reportSales.length} vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Vendidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportItems}</div>
            <p className="text-xs text-muted-foreground">
              Total de produtos vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {reportSales.length > 0 ? (reportTotal / reportSales.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por venda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por hora */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Hora</CardTitle>
            <CardDescription>Distribuição das vendas ao longo do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Total']} />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Formas de pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
            <CardDescription>Distribuição por método de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Produtos</CardTitle>
          <CardDescription>Produtos mais vendidos no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.quantity} unidades vendidas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R$ {product.revenue.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {((product.revenue / reportTotal) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seção de backup */}
      {showBackupSection && (
        <Card>
          <CardHeader>
            <CardTitle>Backup e Restauração</CardTitle>
            <CardDescription>Gerencie backups dos seus dados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                <Database className="w-4 h-4 mr-2" />
                Criar Backup
              </Button>
              <Button variant="outline" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados
              </Button>
              <Button variant="outline" onClick={() => toast.info('Funcionalidade em desenvolvimento')}>
                <Upload className="w-4 h-4 mr-2" />
                Importar Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;