import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Table, TableStatus, Product, PaymentMethod, Sale } from '../types';
import { useSalesStore } from './salesStore';

interface TableState {
  tables: Table[];
  addProductToTable: (tableNumber: number, product: Product, quantity?: number) => void;
  removeProductFromTable: (tableNumber: number, productId: string, uniqueId?: string) => void;
  updateProductQuantity: (tableNumber: number, productId: string, quantity: number) => void;
  updateTableProductPrice: (tableNumber: number, productId: string, newPrice: number) => void;
  updateIndividualProduct: (tableNumber: number, uniqueId: string, newPrice: number, modifications?: string) => void;
  updateTableStatus: (tableNumber: number, status: TableStatus) => void;
  clearTable: (tableNumber: number) => void;
  completeTableSale: (tableNumber: number, paymentMethod: PaymentMethod) => void;
  completeTableSaleWithSplit: (tableNumber: number, payments: Array<{method: PaymentMethod, amount: number}>) => void;
  completePartialPayment: (tableNumber: number, paymentMethod: PaymentMethod, amount: number) => void;
  getTableTotal: (tableNumber: number) => number;
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      tables: [],
      
      addProductToTable: (tableNumber, product, quantity = 1) => {
        set((state) => {
          const existingTable = state.tables.find(t => t.id === tableNumber);
          
          if (existingTable) {
            const existingOrder = existingTable.orders.find(order => order.productId === product.id);
            
            if (existingOrder) {
              // Atualizar quantidade do produto existente
              const updatedOrders = existingTable.orders.map(order =>
                order.productId === product.id
                  ? { ...order, quantity: order.quantity + quantity, subtotal: (order.quantity + quantity) * order.price }
                  : order
              );
              const newTotal = updatedOrders.reduce((sum, order) => sum + order.subtotal, 0);
              
              return {
                tables: state.tables.map(t =>
                  t.id === tableNumber
                    ? { ...t, orders: updatedOrders, total: newTotal, status: 'occupied' as TableStatus }
                    : t
                ),
              };
            } else {
              // Criar produtos individuais com IDs únicos
              const newOrders = [];
              for (let i = 0; i < quantity; i++) {
                const uniqueId = `${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                newOrders.push({
                  productId: product.id,
                  productName: product.name,
                  price: product.price,
                  quantity: 1,
                  subtotal: product.price,
                  uniqueId,
                  customPrice: product.price,
                  modifications: '',
                });
              }
              
              const updatedOrders = [...existingTable.orders, ...newOrders];
              const newTotal = updatedOrders.reduce((sum, order) => sum + order.subtotal, 0);
              
              return {
                tables: state.tables.map(t =>
                  t.id === tableNumber
                    ? { ...t, orders: updatedOrders, total: newTotal, status: 'occupied' as TableStatus }
                    : t
                ),
              };
            }
          } else {
            // Criar nova mesa com produtos individuais
            const newOrders = [];
            for (let i = 0; i < quantity; i++) {
              const uniqueId = `${product.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              newOrders.push({
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1,
                subtotal: product.price,
                uniqueId,
                customPrice: product.price,
                modifications: '',
              });
            }
            
            const newTable: Table = {
              id: tableNumber,
              status: 'occupied', // Nova mesa com pedido fica ocupada
              orders: newOrders,
              total: newOrders.reduce((sum, order) => sum + order.subtotal, 0),
            };
            
            return {
              tables: [...state.tables, newTable],
            };
          }
        });
      },
      
      removeProductFromTable: (tableNumber, productId, uniqueId) => {
        set((state) => {
          const updatedTables = state.tables.map(table => {
            if (table.id === tableNumber) {
              let updatedOrders;
              if (uniqueId) {
                // Remover produto específico pelo uniqueId
                updatedOrders = table.orders.filter(order => order.uniqueId !== uniqueId);
              } else {
                // Remover todos os produtos com esse productId (comportamento antigo)
                updatedOrders = table.orders.filter(order => order.productId !== productId);
              }
              const newTotal = updatedOrders.reduce((sum, order) => sum + order.subtotal, 0);
              
              // Se não há mais pedidos, remover a mesa
              if (updatedOrders.length === 0) {
                return null; // Será filtrado fora do map
              }
              
              return {
                ...table,
                orders: updatedOrders,
                total: newTotal,
                status: 'available' as TableStatus, // Voltar para disponível se não há pedidos
              };
            }
            return table;
          }).filter(table => table !== null) as Table[];
          
          return { tables: updatedTables };
        });
      },
      
      updateProductQuantity: (tableNumber, productId, quantity) => {
        if (quantity <= 0) {
          get().removeProductFromTable(tableNumber, productId);
          return;
        }
        
        set((state) => ({
          tables: state.tables.map(table =>
            table.id === tableNumber
              ? {
                  ...table,
                  orders: table.orders.map(order =>
                    order.productId === productId
                      ? { ...order, quantity, subtotal: quantity * order.price }
                      : order
                  ),
                  total: table.orders
                    .map(order =>
                      order.productId === productId
                        ? { ...order, quantity, subtotal: quantity * order.price }
                        : order
                    )
                    .reduce((sum, order) => sum + order.subtotal, 0),
                }
              : table
          ),
        }));
      },
      
      updateTableProductPrice: (tableNumber, productId, newPrice) => {
        set((state) => ({
          tables: state.tables.map(table =>
            table.id === tableNumber
              ? {
                  ...table,
                  orders: table.orders.map(order =>
                    order.productId === productId
                      ? { ...order, price: newPrice, subtotal: newPrice * order.quantity }
                      : order
                  ),
                  total: table.orders
                    .map(order =>
                      order.productId === productId
                        ? { ...order, price: newPrice, subtotal: newPrice * order.quantity }
                        : order
                    )
                    .reduce((sum, order) => sum + order.subtotal, 0),
                }
              : table
          ),
        }));
      },

      updateIndividualProduct: (tableNumber, uniqueId, newPrice, modifications) => {
        set((state) => ({
          tables: state.tables.map(table =>
            table.id === tableNumber
              ? {
                  ...table,
                  orders: table.orders.map(order =>
                    order.uniqueId === uniqueId
                      ? { 
                          ...order, 
                          customPrice: newPrice, 
                          subtotal: newPrice * order.quantity,
                          modifications: modifications || order.modifications
                        }
                      : order
                  ),
                  total: table.orders
                    .map(order =>
                      order.uniqueId === uniqueId
                        ? { ...order, customPrice: newPrice, subtotal: newPrice * order.quantity }
                        : order
                    )
                    .reduce((sum, order) => sum + order.subtotal, 0),
                }
              : table
          ),
        }));
      },
      
      updateTableStatus: (tableNumber, status) => {
        set((state) => ({
          tables: state.tables.map(table =>
            table.id === tableNumber ? { ...table, status } : table
          ),
        }));
      },
      
      clearTable: (tableNumber) => {
        set((state) => ({
          tables: state.tables.filter(table => table.id !== tableNumber),
        }));
      },
      
      completeTableSale: (tableNumber, paymentMethod) => {
        const table = get().tables.find(t => t.id === tableNumber);
        if (!table || table.orders.length === 0) return;
        
        // Buscar dados do turno e usuário atual
        const currentShift = JSON.parse(localStorage.getItem('shift-storage') || '{}').state?.currentShift;
        const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.currentUser;
        
        // Criar a venda
        const sale: Sale = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          items: table.orders.map(order => ({
            productId: order.productId,
            productName: order.productName,
            price: order.price,
            quantity: order.quantity,
            isCourtesy: paymentMethod === 'cortesia',
          })),
          total: table.total,
          paymentMethod,
          discount: 0,
          discountType: 'value' as const,
          shiftId: currentShift?.id || 'no-shift',
          userId: currentUser?.id || 'no-user',
          userName: currentUser?.name || 'Usuário Desconhecido',
          createdAt: new Date(),
          tableNumber,
        };
        
        // Adicionar venda ao salesStore
        useSalesStore.getState().addSale(sale);
        
        // Limpar mesa
        get().clearTable(tableNumber);
        
        console.log('Venda da mesa finalizada:', sale);
        console.log('Total de vendas após finalizar mesa:', useSalesStore.getState().sales.length);
      },
      
      completeTableSaleWithSplit: (tableNumber, payments) => {
        const table = get().tables.find(t => t.id === tableNumber);
        if (!table || table.orders.length === 0) return;
        
        // Buscar dados do turno e usuário atual
        const currentShift = JSON.parse(localStorage.getItem('shift-storage') || '{}').state?.currentShift;
        const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.currentUser;
        
        // Criar uma venda para cada forma de pagamento
        payments.forEach((payment, index) => {
          if (payment.amount > 0) {
            const sale: Sale = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9) + index,
              items: table.orders.map(order => ({
                productId: order.productId,
                productName: order.productName,
                price: order.price,
                quantity: order.quantity,
                isCourtesy: payment.method === 'cortesia',
              })),
              total: payment.amount,
              paymentMethod: payment.method,
              discount: 0,
              discountType: 'value' as const,
              shiftId: currentShift?.id || 'no-shift',
              userId: currentUser?.id || 'no-user',
              userName: currentUser?.name || 'Usuário Desconhecido',
              createdAt: new Date(),
              tableNumber,
            };
            
            // Adicionar venda ao salesStore
            useSalesStore.getState().addSale(sale);
            console.log('Venda parcial da mesa finalizada:', sale);
          }
        });
        
        // Limpar mesa
        get().clearTable(tableNumber);
        console.log('Total de vendas após finalizar mesa dividida:', useSalesStore.getState().sales.length);
      },
      
      completePartialPayment: (tableNumber, paymentMethod, amount) => {
        const table = get().tables.find(t => t.id === tableNumber);
        if (!table || table.orders.length === 0) return;
        
        // Criar a venda com o valor parcial
        const sale: Sale = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          items: table.orders.map(order => ({
            productId: order.productId,
            productName: order.productName,
            price: order.price,
            quantity: order.quantity,
            isCourtesy: paymentMethod === 'cortesia',
          })),
          total: amount,
          paymentMethod,
          discount: 0,
          discountType: 'value' as const,
          shiftId: 'current-shift',
          userId: 'current-user',
          userName: 'Current User',
          createdAt: new Date(),
          tableNumber,
        };
        
        // Adicionar venda ao salesStore
        useSalesStore.getState().addSale(sale);
        
        // Atualizar o total da mesa
        const newTotal = table.total - amount;
        if (newTotal <= 0) {
          // Se o pagamento cobriu tudo ou mais, limpar a mesa
          get().clearTable(tableNumber);
        } else {
          // Atualizar o total da mesa
          set((state) => ({
            tables: state.tables.map(t =>
              t.id === tableNumber
                ? { ...t, total: newTotal }
                : t
            ),
          }));
        }
        
        console.log('Pagamento parcial da mesa realizado:', sale);
      },
      
      getTableTotal: (tableNumber) => {
        const table = get().tables.find(t => t.id === tableNumber);
        return table ? table.total : 0;
      },
    }),
    {
      name: 'table-storage',
    }
  )
);
