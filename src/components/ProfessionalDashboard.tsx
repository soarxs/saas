import { useStore } from '../store/useStore';
import { useSalesStore } from '../store/salesStore';
import { useRecipeStore } from '../store/recipeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OrderStatusWidget from './OrderStatusWidget';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  Package,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface ProfessionalDashboardProps {
  onNavigate?: (view: string) => void;
}

const ProfessionalDashboard = ({ onNavigate }: ProfessionalDashboardProps) => {
  const { currentShift, products, getLowStockProducts } = useStore();
  const { sales } = useSalesStore();
  const { getLowStockIngredients } = useRecipeStore();

  // Calcular métricas
  const todaySales = sales.filter(sale => {
    const today = new Date();
    const saleDate = new Date(sale.createdAt);
    return saleDate.toDateString() === today.toDateString();
  });

  const totalToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const averageTicket = todaySales.length > 0 ? totalToday / todaySales.length : 0;

  // Produtos mais vendidos
  const productSales = todaySales.flatMap(sale => sale.items);
  const productCounts = productSales.reduce((acc, item) => {
    acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Produtos com estoque baixo
  const lowStockProducts = getLowStockProducts();
  const lowStockIngredients = getLowStockIngredients();

  return (
    <div className="space-y-6">
      {/* Widget de Status de Pedidos */}
      <OrderStatusWidget 
        onViewKitchen={() => onNavigate?.('kitchen')}
        onViewDeliveries={() => onNavigate?.('deliveries')}
      />

      {/* Alertas de Estoque Baixo */}
      {lowStockIngredients.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">⚠️ Estoque Baixo</h3>
          </div>
          <div className="text-sm text-red-700">
            <p className="mb-2">Os seguintes ingredientes estão com estoque baixo:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {lowStockIngredients.map(ing => (
                <div key={ing.id} className="bg-red-100 rounded px-2 py-1 text-xs">
                  <span className="font-semibold">{ing.name}:</span> {ing.currentStock} {ing.unit}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-green-800">
              Vendas Hoje
            </CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-1">
              R$ {totalToday.toFixed(2)}
            </div>
            <p className="text-sm text-green-700 font-medium">
              {todaySales.length} vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800">
              Ticket Médio
            </CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-1">
              R$ {averageTicket.toFixed(2)}
            </div>
            <p className="text-sm text-blue-700 font-medium">
              Por venda
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-800">
              Total Geral
            </CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">
              R$ {totalSales.toFixed(2)}
            </div>
            <p className="text-sm text-purple-700 font-medium">
              {sales.length} vendas totais
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-orange-800">
              Produtos
            </CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-1">
              {products.length}
            </div>
            <p className="text-sm text-orange-700 font-medium">
              Cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Alertas de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-orange-700 mb-3">
                {lowStockProducts.length} produto(s) com estoque baixo:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {lowStockProducts.slice(0, 6).map(product => (
                  <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                    <span className="text-sm font-medium text-gray-800">{product.name}</span>
                    <Badge variant="destructive" className="text-xs">
                      {product.currentStock || 0}
                    </Badge>
                  </div>
                ))}
              </div>
              {onNavigate && (
                <div className="mt-4">
                  <button
                    onClick={() => onNavigate('products')}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium underline"
                  >
                    Gerenciar Estoque →
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Produtos Mais Vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Produtos Mais Vendidos Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map(([product, quantity], index) => (
                  <div key={product} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{product}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {quantity} vendidos
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma venda realizada hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold">Status do Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Turno Atual</span>
                <Badge 
                  variant={currentShift?.isActive ? "default" : "secondary"}
                  className={currentShift?.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                >
                  {currentShift?.isActive ? 'Ativo' : 'Fechado'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Usuário</span>
                <span className="font-semibold text-gray-900">
                  {currentShift?.userName || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Início do Turno</span>
                <span className="font-semibold text-gray-900">
                  {currentShift?.startTime ? 
                    new Date(currentShift.startTime).toLocaleTimeString() : 
                    'N/A'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Conexão</span>
                <Badge variant="default" className="bg-green-500 text-white">
                  Online
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navegação Rápida */}
      {onNavigate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <span>Ações Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('sales')}
                className="p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-800">Mesas</p>
                <p className="text-xs text-green-600">Gerenciar pedidos</p>
              </button>
              
              <button
                onClick={() => onNavigate('products')}
                className="p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <Package className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-blue-800">Produtos</p>
                <p className="text-xs text-blue-600">Gerenciar estoque</p>
              </button>
              
              <button
                onClick={() => onNavigate('reports')}
                className="p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-purple-800">Relatórios</p>
                <p className="text-xs text-purple-600">Ver análises</p>
              </button>
              
              <button
                onClick={() => onNavigate('users')}
                className="p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
              >
                <Activity className="w-5 h-5 text-orange-600 mb-2" />
                <p className="text-sm font-medium text-orange-800">Usuários</p>
                <p className="text-xs text-orange-600">Gerenciar acesso</p>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalDashboard;

