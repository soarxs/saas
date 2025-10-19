import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useShiftStore } from './shiftStore';
import { useProductStore } from './productStore';
import { useSalesStore } from './salesStore';
import { useTableStore } from './tableStore';
import { User, Shift, Product, Sale, CartItem, PaymentMethod, Table, TableStatus } from '../types';

interface AppState {
  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUserPassword: (id: string, newPassword: string) => void;
  getUserPassword: (id: string) => string | null;
  
  // Shift
  currentShift: Shift | null;
  shifts: Shift[];
  openShift: (user: User) => void;
  closeShift: () => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => void;
  getLowStockProducts: () => Product[];
  syncProducts: () => void;
  syncAllStores: () => void;
  
  // Sales
  sales: Sale[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: PaymentMethod, discount: number, discountType: 'value' | 'percentage') => void;
  deleteSale: (saleId: string) => void;
  updateSalePaymentMethod: (saleId: string, paymentMethod: PaymentMethod) => void;
  
  // Tables
  tables: Table[];
  addToTable: (tableNumber: number, product: Product, quantity?: number) => void;
  removeFromTable: (tableNumber: number, productId: string, uniqueId?: string) => void;
  updateTableQuantity: (tableNumber: number, productId: string, quantity: number) => void;
  updateTableProductPrice: (tableNumber: number, productId: string, newPrice: number) => void;
  updateIndividualProduct: (tableNumber: number, uniqueId: string, newPrice: number, modifications?: string) => void;
  updateTableStatus: (tableNumber: number, status: TableStatus) => void;
  clearTable: (tableNumber: number) => void;
  completeTableSale: (tableNumber: number, paymentMethod: PaymentMethod) => void;
  completeTableSaleWithSplit: (tableNumber: number, payments: Array<{method: PaymentMethod, amount: number}>) => void;
  completePartialPayment: (tableNumber: number, paymentMethod: PaymentMethod, amount: number) => void;
  getTableTotal: (tableNumber: number) => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      updateUserPassword: (id, newPassword) => {
        const authStore = useAuthStore.getState();
        authStore.updateUserPassword(id, newPassword);
      },
      getUserPassword: (id) => {
        const authStore = useAuthStore.getState();
        return authStore.getUserPassword(id);
      },

      // Shift
      currentShift: null,
      shifts: [],
      openShift: (user) => {
        const shiftStore = useShiftStore.getState();
        shiftStore.openShift(user);
        set({ currentShift: shiftStore.currentShift, shifts: shiftStore.shifts });
      },
      closeShift: () => {
        const shiftStore = useShiftStore.getState();
        shiftStore.closeShift();
        set({ currentShift: shiftStore.currentShift, shifts: shiftStore.shifts });
      },

      // Products
      products: useProductStore.getState().products,
      addProduct: (product) => {
        const productStore = useProductStore.getState();
        productStore.addProduct(product);
        set({ products: productStore.products });
      },
      updateProduct: (id, product) => {
        const productStore = useProductStore.getState();
        productStore.updateProduct(id, product);
        set({ products: productStore.products });
      },
      deleteProduct: (id) => {
        const productStore = useProductStore.getState();
        productStore.deleteProduct(id);
        set({ products: productStore.products });
      },
      updateStock: (id, quantity, operation) => {
        const productStore = useProductStore.getState();
        productStore.updateStock(id, quantity, operation);
        set({ products: productStore.products });
      },
      getLowStockProducts: () => {
        const productStore = useProductStore.getState();
        return productStore.getLowStockProducts();
      },
      syncProducts: () => {
        const productStore = useProductStore.getState();
        set({ products: productStore.products });
      },
      syncAllStores: () => {
        const productStore = useProductStore.getState();
        const salesStore = useSalesStore.getState();
        const tableStore = useTableStore.getState();
        set({ 
          products: productStore.products,
          sales: salesStore.sales,
          cart: salesStore.cart,
          tables: tableStore.tables
        });
      },

      // Sales
      sales: [],
      cart: [],
      addToCart: (product, quantity = 1) => {
        const salesStore = useSalesStore.getState();
        salesStore.addToCart(product, quantity);
        set({ cart: salesStore.cart });
      },
      removeFromCart: (productId) => {
        const salesStore = useSalesStore.getState();
        salesStore.removeFromCart(productId);
        set({ cart: salesStore.cart });
      },
      updateCartQuantity: (productId, quantity) => {
        const salesStore = useSalesStore.getState();
        salesStore.updateCartQuantity(productId, quantity);
        set({ cart: salesStore.cart });
      },
      clearCart: () => {
        const salesStore = useSalesStore.getState();
        salesStore.clearCart();
        set({ cart: salesStore.cart });
      },
      completeSale: (paymentMethod, discount, discountType) => {
        const salesStore = useSalesStore.getState();
        const { currentShift } = get();
        if (!currentShift) return;
        
        salesStore.completeSale(paymentMethod, discount, discountType, currentShift.id);
        set({ sales: salesStore.sales, cart: salesStore.cart });
      },
      deleteSale: (saleId) => {
        const salesStore = useSalesStore.getState();
        salesStore.deleteSale(saleId);
        set({ sales: salesStore.sales });
      },
      updateSalePaymentMethod: (saleId, paymentMethod) => {
        const salesStore = useSalesStore.getState();
        salesStore.updateSalePaymentMethod(saleId, paymentMethod);
        set({ sales: salesStore.sales });
      },

      // Tables
      tables: useTableStore.getState().tables,
      addToTable: (tableNumber, product, quantity = 1) => {
        const tableStore = useTableStore.getState();
        tableStore.addProductToTable(tableNumber, product, quantity);
        set({ tables: tableStore.tables });
      },
      removeFromTable: (tableNumber, productId, uniqueId) => {
        const tableStore = useTableStore.getState();
        tableStore.removeProductFromTable(tableNumber, productId, uniqueId);
        set({ tables: tableStore.tables });
      },
      updateTableQuantity: (tableNumber, productId, quantity) => {
        const tableStore = useTableStore.getState();
        tableStore.updateProductQuantity(tableNumber, productId, quantity);
        set({ tables: tableStore.tables });
      },
      updateTableProductPrice: (tableNumber, productId, newPrice) => {
        const tableStore = useTableStore.getState();
        tableStore.updateTableProductPrice(tableNumber, productId, newPrice);
        set({ tables: tableStore.tables });
      },
      updateIndividualProduct: (tableNumber, uniqueId, newPrice, modifications) => {
        const tableStore = useTableStore.getState();
        tableStore.updateIndividualProduct(tableNumber, uniqueId, newPrice, modifications);
        set({ tables: tableStore.tables });
      },
      updateTableStatus: (tableNumber, status) => {
        const tableStore = useTableStore.getState();
        tableStore.updateTableStatus(tableNumber, status);
        set({ tables: tableStore.tables });
      },
      clearTable: (tableNumber) => {
        const tableStore = useTableStore.getState();
        tableStore.clearTable(tableNumber);
        set({ tables: tableStore.tables });
      },
      completeTableSale: (tableNumber, paymentMethod) => {
        const tableStore = useTableStore.getState();
        const { currentShift } = get();
        if (!currentShift) return;
        
        tableStore.completeTableSale(tableNumber, paymentMethod);
        set({ tables: tableStore.tables });
      },
      completeTableSaleWithSplit: (tableNumber, payments) => {
        const tableStore = useTableStore.getState();
        const { currentShift } = get();
        if (!currentShift) return;
        
        tableStore.completeTableSaleWithSplit(tableNumber, payments);
        set({ tables: tableStore.tables });
      },
      completePartialPayment: (tableNumber, paymentMethod, amount) => {
        const tableStore = useTableStore.getState();
        tableStore.completePartialPayment(tableNumber, paymentMethod, amount);
        set({ tables: tableStore.tables });
      },
      getTableTotal: (tableNumber) => {
        const tableStore = useTableStore.getState();
        return tableStore.getTableTotal(tableNumber);
      },
    }),
    {
      name: 'pdv-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentShift: state.currentShift,
        shifts: state.shifts,
        products: state.products,
        sales: state.sales,
        tables: state.tables,
      }),
    }
  )
);