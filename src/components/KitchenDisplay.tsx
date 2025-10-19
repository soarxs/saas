import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrderStore } from '../store/orderStore';
import { OrderStatus, Order } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Clock, 
  ChefHat, 
  CheckCircle,
  AlertTriangle,
  Phone,
  MessageSquare,
  Store,
  Users
} from 'lucide-react';

const KitchenDisplay: React.FC = () => {
  const { orders, updateOrderStatus, getOrdersByStatus } = useOrderStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pendingOrders = getOrdersByStatus('pendente');
  const preparingOrders = getOrdersByStatus('preparando');
  const readyOrders = getOrdersByStatus('pronto');

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'balcao': return <Store className="w-4 h-4" />;
      case 'mesa': return <Users className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'telefone': return <Phone className="w-4 h-4" />;
      default: return <Store className="w-4 h-4" />;
    }
  };

  const getSourceLabel = (source: string, order: Order) => {
    switch (source) {
      case 'balcao': return '🏪 BALCÃO';
      case 'mesa': return `🪑 MESA ${order.tableNumber}`;
      case 'whatsapp': return `📱 ${order.customerName}`;
      case 'telefone': return `☎️ ${order.customerName}`;
      default: return source;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pendente': return 'bg-red-100 text-red-800 border-red-300';
      case 'preparando': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pronto': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { 
        addSuffix: false, 
        locale: ptBR 
      });
    } catch {
      return '0 min';
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const OrderCard: React.FC<{ order: Order; showActions?: boolean }> = ({ 
    order, 
    showActions = true 
  }) => (
    <Card className={`border-l-4 ${
      order.status === 'pendente' ? 'border-l-red-500' :
      order.status === 'preparando' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getSourceIcon(order.source)}
            <span className="font-bold text-lg">#{order.number}</span>
            <Badge className={getStatusColor(order.status)}>
              {order.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>{getTimeElapsed(order.createdAt)}</div>
            <div>{new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="font-semibold text-sm text-gray-700 mb-1">
            {getSourceLabel(order.source, order)}
          </div>
          {order.customerPhone && (
            <div className="text-xs text-gray-600">
              📞 {order.customerPhone}
            </div>
          )}
        </div>

        <div className="space-y-2 mb-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.quantity}x
                </Badge>
                <span className="text-sm font-medium">{item.productName}</span>
              </div>
              {item.observations && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  ⚠️ {item.observations}
                </div>
              )}
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
            📝 {order.notes}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold">Total: R$ {order.total.toFixed(2)}</span>
            <div className="text-xs text-gray-600">
              {order.paymentMethod.toUpperCase()}
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2">
              {order.status === 'pendente' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(order.id, 'preparando')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <ChefHat className="w-3 h-3 mr-1" />
                  Iniciar
                </Button>
              )}
              
              {order.status === 'preparando' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange(order.id, 'pronto')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Pronto
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-600" />
              COZINHA
            </h1>
            <p className="text-gray-600 mt-1">
              Sistema de Display da Cozinha - {currentTime.toLocaleString('pt-BR')}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {currentTime.toLocaleTimeString('pt-BR')}
            </div>
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PENDENTES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">
              PENDENTES ({pendingOrders.length})
            </h2>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum pedido pendente</p>
                </CardContent>
              </Card>
            ) : (
              pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>

        {/* PREPARANDO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-yellow-800">
              PREPARANDO ({preparingOrders.length})
            </h2>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum pedido em preparo</p>
                </CardContent>
              </Card>
            ) : (
              preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </div>

        {/* PRONTOS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-green-800">
              PRONTOS ({readyOrders.length})
            </h2>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {readyOrders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum pedido pronto</p>
                </CardContent>
              </Card>
            ) : (
              readyOrders.map(order => (
                <OrderCard key={order.id} order={order} showActions={false} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {pendingOrders.length}
            </div>
            <div className="text-sm text-red-700">Pendentes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {preparingOrders.length}
            </div>
            <div className="text-sm text-yellow-700">Preparando</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {readyOrders.length}
            </div>
            <div className="text-sm text-green-700">Prontos</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.length}
            </div>
            <div className="text-sm text-blue-700">Total Hoje</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KitchenDisplay;
