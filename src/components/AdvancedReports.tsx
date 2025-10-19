import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, Scatter, ScatterChart, ZAxis
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Clock, 
  Users, Star, Target, Calendar, BarChart3, PieChart as PieChartIcon,
  Activity, Zap, ArrowLeft
} from 'lucide-react';
import { useSalesStore } from '../store/salesStore';
import { useStore } from '../store/useStore';
import { format, startOfDay, endOfDay, isWithinInterval, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdvancedReportsProps {
  onBack?: () => void;
}

const AdvancedReports = ({ onBack }: AdvancedReportsProps) => {
  const { sales } = useSalesStore();
  const { products } = useStore();
  const [period, setPeriod] = useState('7-days');
  const [chartType, setChartType] = useState('bar');

  // Cores para gráficos
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Função para obter dados do período
  const getPeriodData = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case '7-days':
        startDate = subDays(startOfDay(now), 6);
        break;
      case '30-days':
        startDate = subDays(startOfDay(now), 29);
        break;
      case '90-days':
        startDate = subDays(startOfDay(now), 89);
        break;
      default:
        startDate = subDays(startOfDay(now), 6);
    }

    return sales.filter(sale => 
      isWithinInterval(new Date(sale.createdAt), { 
        start: startDate, 
        end: endOfDay(now) 
      })
    );
  };

  const periodSales = getPeriodData();

  // Dados para gráfico de vendas por dia
  const getDailySalesData = () => {
    const now = new Date();
    let days: Date[];
    
    switch (period) {
      case 'today':
        days = [now];
        break;
      case '7-days':
        days = eachDayOfInterval({ start: subDays(now, 6), end: now });
        break;
      case '30-days':
        days = eachDayOfInterval({ start: subDays(now, 29), end: now });
        break;
      case '90-days':
        days = eachDayOfInterval({ start: subDays(now, 89), end: now });
        break;
      default:
        days = eachDayOfInterval({ start: subDays(now, 6), end: now });
    }

    return days.map(day => {
      const daySales = periodSales.filter(sale => 
        format(new Date(sale.createdAt), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      
      const total = daySales.reduce((sum, sale) => sum + sale.total, 0);
      const items = daySales.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      const orders = daySales.length;

      return {
        date: format(day, 'dd/MM'),
        fullDate: format(day, 'dd/MM/yyyy'),
        total,
        items,
        orders,
        avgTicket: orders > 0 ? total / orders : 0
      };
    });
  };

  // Dados para gráfico de produtos mais vendidos
  const getTopProductsData = () => {
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    
    periodSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              name: product.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.price * item.quantity;
        }
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  // Dados para gráfico de horários de pico
  const getPeakHoursData = () => {
    const hourlyData: { [key: number]: { hour: number; orders: number; revenue: number } } = {};
    
    // Inicializar todas as horas
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { hour: i, orders: 0, revenue: 0 };
    }

    periodSales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      hourlyData[hour].orders += 1;
      hourlyData[hour].revenue += sale.total;
    });

    return Object.values(hourlyData).map(data => ({
      ...data,
      hourLabel: `${data.hour.toString().padStart(2, '0')}:00`,
      avgTicket: data.orders > 0 ? data.revenue / data.orders : 0
    }));
  };

  // Dados para gráfico de formas de pagamento
  const getPaymentMethodData = () => {
    const paymentData: { [key: string]: { name: string; value: number; count: number } } = {};
    
    periodSales.forEach(sale => {
      if (!paymentData[sale.paymentMethod]) {
        paymentData[sale.paymentMethod] = {
          name: sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1),
          value: 0,
          count: 0
        };
      }
      paymentData[sale.paymentMethod].value += sale.total;
      paymentData[sale.paymentMethod].count += 1;
    });

    return Object.values(paymentData);
  };

  // Métricas principais
  const getMainMetrics = () => {
    const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = periodSales.length;
    const totalItems = periodSales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Comparar com período anterior
    const previousPeriod = getPreviousPeriodData();
    const revenueGrowth = previousPeriod.total > 0 
      ? ((totalRevenue - previousPeriod.total) / previousPeriod.total) * 100 
      : 0;
    const ordersGrowth = previousPeriod.orders > 0 
      ? ((totalOrders - previousPeriod.orders) / previousPeriod.orders) * 100 
      : 0;

    return {
      totalRevenue,
      totalOrders,
      totalItems,
      avgTicket,
      revenueGrowth,
      ordersGrowth
    };
  };

  const getPreviousPeriodData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (period) {
      case 'today':
        startDate = subDays(startOfDay(now), 1);
        endDate = endOfDay(subDays(now, 1));
        break;
      case '7-days':
        startDate = subDays(startOfDay(now), 13);
        endDate = endOfDay(subDays(now, 7));
        break;
      case '30-days':
        startDate = subDays(startOfDay(now), 59);
        endDate = endOfDay(subDays(now, 30));
        break;
      case '90-days':
        startDate = subDays(startOfDay(now), 179);
        endDate = endOfDay(subDays(now, 90));
        break;
      default:
        startDate = subDays(startOfDay(now), 13);
        endDate = endOfDay(subDays(now, 7));
    }

    const previousSales = sales.filter(sale => 
      isWithinInterval(new Date(sale.createdAt), { start: startDate, end: endDate })
    );

    return {
      total: previousSales.reduce((sum, sale) => sum + sale.total, 0),
      orders: previousSales.length
    };
  };

  const metrics = getMainMetrics();
  const dailyData = getDailySalesData();
  const topProducts = getTopProductsData();
  const peakHours = getPeakHoursData();
  const paymentData = getPaymentMethodData();

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatNumber = (value: number) => 
    new Intl.NumberFormat('pt-BR').format(value);

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Relatórios Avançados</h2>
            <p className="text-gray-600">Análises detalhadas e insights do seu negócio</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7-days">7 dias</SelectItem>
              <SelectItem value="30-days">30 dias</SelectItem>
              <SelectItem value="90-days">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {metrics.revenueGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.revenueGrowth >= 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics.totalOrders)}</p>
                <div className="flex items-center mt-1">
                  {metrics.ordersGrowth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.ordersGrowth >= 0 ? '+' : ''}{metrics.ordersGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Itens Vendidos</p>
                <p className="text-2xl font-bold text-purple-600">{formatNumber(metrics.totalItems)}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.avgTicket)}</p>
              </div>
              <Star className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com diferentes visualizações */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="hours">Horários</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Evolução de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'total' ? formatCurrency(Number(value)) : value,
                        name === 'total' ? 'Receita' : name === 'orders' ? 'Pedidos' : 'Ticket Médio'
                      ]}
                    />
                    <Bar yAxisId="left" dataKey="total" fill="#10b981" name="total" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Top 10 Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value) => [value, 'Quantidade']} />
                      <Bar dataKey="quantity" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{product.quantity}</p>
                        <p className="text-xs text-gray-500">unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários de Pico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hourLabel" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'orders' ? value : formatCurrency(Number(value)),
                        name === 'orders' ? 'Pedidos' : 'Receita'
                      ]}
                    />
                    <Area type="monotone" dataKey="orders" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Formas de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes por Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentData.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium">{payment.name}</p>
                          <p className="text-sm text-gray-600">{payment.count} transações</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(payment.value)}</p>
                        <p className="text-xs text-gray-500">
                          {((payment.value / metrics.totalRevenue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReports;
