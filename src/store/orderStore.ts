import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderStatus } from '../types';
import { format } from 'date-fns';

interface OrderState {
  orders: Order[];
  
  // Ações
  addOrder: (order: Omit<Order, 'id' | 'number' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  
  // Consultas
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getDeliveryOrders: () => Order[];
  getTodayOrders: () => Order[];
  getOrdersByTable: (tableNumber: number) => Order[];
  
  // Helpers
  getNextOrderNumber: () => string;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      getNextOrderNumber: () => {
        const today = format(new Date(), 'yyyyMMdd');
        const todayOrders = get().orders.filter(order => 
          order.number.startsWith(today)
        );
        const nextNum = todayOrders.length + 1;
        return `${today}-${nextNum.toString().padStart(3, '0')}`;
      },
      
      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          number: get().getNextOrderNumber(),
          createdAt: new Date().toISOString(),
          status: 'pendente',
        };
        
        set(state => ({
          orders: [...state.orders, newOrder]
        }));
        
        console.log('✅ Pedido criado:', newOrder.number);
        return newOrder;
      },
      
      updateOrderStatus: (orderId, status) => {
        const now = new Date().toISOString();
        
        set(state => ({
          orders: state.orders.map(order => {
            if (order.id !== orderId) return order;
            
            const updates: Partial<Order> = { status };
            
            if (status === 'preparando' && !order.startedPreparingAt) {
              updates.startedPreparingAt = now;
            }
            if (status === 'pronto' && !order.readyAt) {
              updates.readyAt = now;
            }
            if (status === 'saiu-entrega' && !order.deliveryStartedAt) {
              updates.deliveryStartedAt = now;
            }
            if (status === 'entregue' && !order.deliveredAt) {
              updates.deliveredAt = now;
            }
            
            return { ...order, ...updates };
          })
        }));
      },
      
      deleteOrder: (orderId) => {
        set(state => ({
          orders: state.orders.filter(order => order.id !== orderId)
        }));
      },
      
      getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
      },
      
      getDeliveryOrders: () => {
        return get().orders.filter(order => 
          (order.source === 'whatsapp' || order.source === 'telefone') &&
          order.status !== 'entregue' && 
          order.status !== 'finalizado'
        );
      },
      
      getTodayOrders: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get().orders.filter(order => 
          order.createdAt.startsWith(today)
        );
      },
      
      getOrdersByTable: (tableNumber) => {
        return get().orders.filter(order => 
          order.tableNumber === tableNumber &&
          order.status !== 'finalizado'
        );
      },
    }),
    {
      name: 'order-storage',
    }
  )
);