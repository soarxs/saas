import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrderStore } from '../store/orderStore';
import { OrderStatus } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Truck, 
  Phone, 
  MessageSquare, 
  Clock,
  CheckCircle,
  MapPin,
  User
} from 'lucide-react';

const DeliveryManager: React.FC = () => {
  const { getDeliveryOrders, updateOrderStatus } = useOrderStore();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  const deliveryOrders = getDeliveryOrders();
  
  const filteredOrders = selectedStatus === 'all' 
    ? deliveryOrders 
    : deliveryOrders.filter(order => order.status === selectedStatus);

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

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pendente': return 'preparando';
      case 'preparando': return 'pronto';
      case 'pronto': return 'saiu-entrega';
      case 'saiu-entrega': return 'entregue';
      default: return null;
    }
  };

  const getStatusButtonText = (status: OrderStatus) => {
    switch (status) {
      case 'pendente': return 'Iniciar Preparo';
      case 'preparando': return 'Marcar Pronto';
      case 'pronto': return 'Saiu para Entrega';
      case 'saiu-entrega': return 'Marcar Entregue';
      default: return '';
    }
  };

  const getStatusButtonColor = (status: OrderStatus) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'preparando': return 'bg-green-600 hover:bg-green-700';
      case 'pronto': return 'bg-blue-600 hover:bg-blue-700';
      case 'saiu-entrega': return 'bg-gray-600 hover:bg-gray-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const statusCounts = {
    all: deliveryOrders.length,
    pendente: deliveryOrders.filter(o => o.status === 'pendente').length,
    preparando: deliveryOrders.filter(o => o.status === 'preparando').length,
    pronto: deliveryOrders.filter(o => o.status === 'pronto').length,
    'saiu-entrega': deliveryOrders.filter(o => o.status === 'saiu-entrega').length,
    entregue: deliveryOrders.filter(o => o.status === 'entregue').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-600" />
            GERENCIAR DELIVERY
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe e gerencie todos os pedidos de delivery
          </p>
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pendente', 'preparando', 'pronto', 'saiu-entrega', 'entregue'] as const).map(status => (
          <Button
            key={status}
            variant={selectedStatus === status ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(status)}
            className="flex items-center gap-2"
          >
            {status === 'all' ? 'TODOS' : status.toUpperCase()}
            <Badge variant="secondary" className="ml-1">
              {statusCounts[status]}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Lista de Pedidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum pedido de delivery encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map(order => {
            const nextStatus = getNextStatus(order.status);
            
            return (
              <Card key={order.id} className={`border-l-4 ${
                order.status === 'pendente' ? 'border-l-red-500' :
                order.status === 'preparando' ? 'border-l-yellow-500' :
                order.status === 'pronto' ? 'border-l-green-500' :
                order.status === 'saiu-entrega' ? 'border-l-blue-500' :
                'border-l-gray-500'
              }`}>
                <CardContent className="p-4">
                  {/* Header do Pedido */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {order.source === 'whatsapp' ? (
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      ) : (
                        <Phone className="w-4 h-4 text-blue-600" />
                      )}
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

                  {/* Dados do Cliente */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-800">
                        {order.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </div>
                    {order.address && (
                      <div className="flex items-start gap-2 text-sm text-blue-700 mt-1">
                        <MapPin className="w-3 h-3 mt-0.5" />
                        <span>{order.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Itens do Pedido */}
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

                  {/* Observações */}
                  {order.notes && (
                    <div className="mb-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                      📝 {order.notes}
                    </div>
                  )}

                  {/* Total e Pagamento */}
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-semibold">R$ {order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Entrega:</span>
                        <span className="font-semibold">R$ {order.deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold border-t pt-1 mt-1">
                      <span>Total:</span>
                      <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Pagamento: {order.paymentMethod.toUpperCase()}
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  {nextStatus && (
                    <Button
                      onClick={() => handleStatusChange(order.id, nextStatus)}
                      className={`w-full ${getStatusButtonColor(order.status)}`}
                    >
                      {getStatusButtonText(order.status)}
                    </Button>
                  )}

                  {/* Status Entregue */}
                  {order.status === 'entregue' && (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      PEDIDO ENTREGUE
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {(['pendente', 'preparando', 'pronto', 'saiu-entrega', 'entregue'] as const).map(status => (
          <Card key={status} className={`${
            status === 'pendente' ? 'bg-red-50 border-red-200' :
            status === 'preparando' ? 'bg-yellow-50 border-yellow-200' :
            status === 'pronto' ? 'bg-green-50 border-green-200' :
            status === 'saiu-entrega' ? 'bg-blue-50 border-blue-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <CardContent className="p-3 text-center">
              <div className={`text-xl font-bold ${
                status === 'pendente' ? 'text-red-600' :
                status === 'preparando' ? 'text-yellow-600' :
                status === 'pronto' ? 'text-green-600' :
                status === 'saiu-entrega' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {statusCounts[status]}
              </div>
              <div className={`text-xs ${
                status === 'pendente' ? 'text-red-700' :
                status === 'preparando' ? 'text-yellow-700' :
                status === 'pronto' ? 'text-green-700' :
                status === 'saiu-entrega' ? 'text-blue-700' :
                'text-gray-700'
              }`}>
                {status.toUpperCase()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeliveryManager;
