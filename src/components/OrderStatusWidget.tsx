import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '../store/orderStore';
import { OrderStatus } from '../types';
import { 
  Clock, 
  ChefHat, 
  CheckCircle,
  Truck,
  AlertTriangle,
  Eye
} from 'lucide-react';

interface OrderStatusWidgetProps {
  onViewKitchen?: () => void;
  onViewDeliveries?: () => void;
}

const OrderStatusWidget: React.FC<OrderStatusWidgetProps> = ({ 
  onViewKitchen, 
  onViewDeliveries 
}) => {
  const { getOrdersByStatus, getDeliveryOrders, getTodayOrders } = useOrderStore();

  const pendingOrders = getOrdersByStatus('pendente');
  const preparingOrders = getOrdersByStatus('preparando');
  const readyOrders = getOrdersByStatus('pronto');
  const deliveryOrders = getDeliveryOrders();
  const todayOrders = getTodayOrders();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pendente': return 'bg-red-100 text-red-800 border-red-300';
      case 'preparando': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pronto': return 'bg-green-100 text-green-800 border-green-300';
      case 'saiu-entrega': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'entregue': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pendente': return <AlertTriangle className="w-4 h-4" />;
      case 'preparando': return <ChefHat className="w-4 h-4" />;
      case 'pronto': return <CheckCircle className="w-4 h-4" />;
      case 'saiu-entrega': return <Truck className="w-4 h-4" />;
      case 'entregue': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const urgentOrders = pendingOrders.filter(order => {
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return diffMinutes > 10; // Pedidos com mais de 10 minutos
  });

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Status dos Pedidos - Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {pendingOrders.length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {preparingOrders.length}
              </div>
              <div className="text-sm text-gray-600">Preparando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {readyOrders.length}
              </div>
              <div className="text-sm text-gray-600">Prontos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {deliveryOrders.length}
              </div>
              <div className="text-sm text-gray-600">Delivery</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pedidos Urgentes */}
      {urgentOrders.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Pedidos Urgentes ({urgentOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentOrders.slice(0, 3).map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      #{order.number}
                    </Badge>
                    <span className="text-sm font-medium">
                      {order.source === 'balcao' ? '🏪 Balcão' :
                       order.source === 'mesa' ? `🪑 Mesa ${order.tableNumber}` :
                       order.source === 'whatsapp' ? `📱 ${order.customerName}` :
                       `☎️ ${order.customerName}`}
                    </span>
                  </div>
                  <div className="text-sm text-red-600 font-medium">
                    {Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60))} min
                  </div>
                </div>
              ))}
              {urgentOrders.length > 3 && (
                <div className="text-sm text-red-600 text-center">
                  +{urgentOrders.length - 3} pedidos urgentes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Cozinha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pedidos Pendentes:</span>
                <Badge className="bg-red-100 text-red-800">
                  {pendingOrders.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Em Preparo:</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {preparingOrders.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Prontos:</span>
                <Badge className="bg-green-100 text-green-800">
                  {readyOrders.length}
                </Badge>
              </div>
              {onViewKitchen && (
                <Button 
                  onClick={onViewKitchen}
                  className="w-full mt-3"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Cozinha
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Delivery:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {deliveryOrders.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Prontos:</span>
                <Badge className="bg-green-100 text-green-800">
                  {deliveryOrders.filter(o => o.status === 'pronto').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Saiu Entrega:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {deliveryOrders.filter(o => o.status === 'saiu-entrega').length}
                </Badge>
              </div>
              {onViewDeliveries && (
                <Button 
                  onClick={onViewDeliveries}
                  className="w-full mt-3"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Delivery
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas do Dia */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">
                {todayOrders.length}
              </div>
              <div className="text-sm text-gray-600">Total Pedidos</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {todayOrders.filter(o => o.status === 'entregue' || o.status === 'finalizado').length}
              </div>
              <div className="text-sm text-gray-600">Finalizados</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">
                {todayOrders.filter(o => o.source === 'whatsapp' || o.source === 'telefone').length}
              </div>
              <div className="text-sm text-gray-600">Delivery</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-600">
                R$ {todayOrders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Faturamento</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatusWidget;
