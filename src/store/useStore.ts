import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useShiftStore } from './shiftStore';
import { useProductStore } from './productStore';
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
  getShiftById: (id: string) => Shift | undefined;
  
  // Products
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  getProductByCode: (code: string) => Product | undefined;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  syncProducts: () => void;
  
  // Tables
  tables: Table[];
  addToTable: (tableNumber: number, product: Product, quantity: number) => void;
  removeFromTable: (tableNumber: number, productId: string, uniqueId?: string) => void;
  updateIndividualProduct: (tableNumber: number, productId: string, updates: Partial<CartItem>) => void;
  completeTableSale: (tableNumber: number, paymentMethod: PaymentMethod) => void;
  getTableById: (id: number) => Table | undefined;
  getTableTotal: (tableNumber: number) => number;
  clearTable: (tableNumber: number) => void;
  
  // Sales
  sales: Sale[];
  addSale: (sale: Sale) => void;
  updateSale: (id: string, updates: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  getSalesByDate: (date: string) => Sale[];
  getSalesByShift: (shiftId: string) => Sale[];
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  
  // Sync
  syncAllStores: () => void;
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
      getShiftById: (id) => {
        const shiftStore = useShiftStore.getState();
        return shiftStore.getShiftById(id);
      },
      
      // Products
      products: useProductStore.getState().products,
      getProductById: (id) => {
        const productStore = useProductStore.getState();
        return productStore.getProductById(id);
      },
      getProductByCode: (code) => {
        const productStore = useProductStore.getState();
        return productStore.getProductByCode(code);
      },
      updateProduct: (id, updates) => {
        const productStore = useProductStore.getState();
        productStore.updateProduct(id, updates);
        set({ products: productStore.products });
      },
      addProduct: (product) => {
        const productStore = useProductStore.getState();
        productStore.addProduct(product);
        set({ products: productStore.products });
      },
      deleteProduct: (id) => {
        const productStore = useProductStore.getState();
        productStore.deleteProduct(id);
        set({ products: productStore.products });
      },
      syncProducts: () => {
        const productStore = useProductStore.getState();
        set({ products: productStore.products });
      },
      
      // Tables
      tables: [],
      addToTable: (tableNumber, product, quantity) => {
        const tableStore = useTableStore.getState();
        tableStore.addToTable(tableNumber, product, quantity);
        set({ tables: tableStore.tables });
      },
      removeFromTable: (tableNumber, productId, uniqueId) => {
        const tableStore = useTableStore.getState();
        tableStore.removeFromTable(tableNumber, productId, uniqueId);
        set({ tables: tableStore.tables });
      },
      updateIndividualProduct: (tableNumber, productId, updates) => {
        const tableStore = useTableStore.getState();
        tableStore.updateIndividualProduct(tableNumber, productId, updates);
        set({ tables: tableStore.tables });
      },
      completeTableSale: (tableNumber, paymentMethod) => {
        const tableStore = useTableStore.getState();
        tableStore.completeTableSale(tableNumber, paymentMethod);
        set({ tables: tableStore.tables });
      },
      getTableById: (id) => {
        const tableStore = useTableStore.getState();
        return tableStore.getTableById(id);
      },
      getTableTotal: (tableNumber) => {
        const tableStore = useTableStore.getState();
        return tableStore.getTableTotal(tableNumber);
      },
      clearTable: (tableNumber) => {
        const tableStore = useTableStore.getState();
        tableStore.clearTable(tableNumber);
        set({ tables: tableStore.tables });
      },
      
      // Sales
      sales: [],
      addSale: (sale) => set((state) => ({ sales: [...state.sales, sale] })),
      updateSale: (id, updates) => set((state) => ({
        sales: state.sales.map(sale => sale.id === id ? { ...sale, ...updates } : sale)
      })),
      deleteSale: (id) => set((state) => ({
        sales: state.sales.filter(sale => sale.id !== id)
      })),
      getSalesByDate: (date) => {
        const state = get();
        return state.sales.filter(sale => sale.date === date);
      },
      getSalesByShift: (shiftId) => {
        const state = get();
        return state.sales.filter(sale => sale.shiftId === shiftId);
      },
      
      // Cart
      cart: [],
      addToCart: (product, quantity) => set((state) => {
        const existingItem = state.cart.find(item => item.productId === product.id);
        if (existingItem) {
          return {
            cart: state.cart.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          };
        }
        return {
          cart: [...state.cart, {
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            subtotal: product.price * quantity
          }]
        };
      }),
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.productId !== productId)
      })),
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.productId === productId
            ? { ...item, quantity, subtotal: item.price * quantity }
            : item
        )
      })),
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        const state = get();
        return state.cart.reduce((total, item) => total + item.subtotal, 0);
      },
      
      // Sync
      syncAllStores: () => {
        const productStore = useProductStore.getState();
        const tableStore = useTableStore.getState();
        set({ 
          products: productStore.products,
          tables: tableStore.tables
        });
      },
    }),
    {
      name: 'pdv-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentShift: state.currentShift,
        shifts: state.shifts,
        products: state.products,
        tables: state.tables,
        sales: state.sales,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sincronizar com stores individuais
          state.syncAllStores();
        }
      },
    }
  )
);