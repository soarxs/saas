
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  totalSales: number;
  totalItems: number;
  paymentBreakdown: PaymentBreakdown;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  available: boolean;
  description?: string;
  code: string;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
}

export type ProductCategory = 'hamburguer' | 'bebida' | 'acompanhamento' | 'sobremesa' | 'outro';

export type PaymentMethod = 'dinheiro' | 'debito' | 'credito' | 'pix' | 'cortesia';

export interface PaymentBreakdown {
  dinheiro: number;
  debito: number;
  credito: number;
  pix: number;
  cortesia: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  isCourtesy?: boolean;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  discount: number;
  discountType: 'value' | 'percentage';
  shiftId: string;
  userId: string;
  userName: string;
  createdAt: Date;
  tableNumber?: number;
}

export interface CartItem extends SaleItem {
  subtotal: number;
  uniqueId?: string; // ID único para cada item individual
  customPrice?: number; // Preço customizado após modificações
  modifications?: string; // Descrição das modificações
}

export type TableStatus = 'available' | 'occupied' | 'requesting-bill';

export interface Table {
  id: number;
  status: TableStatus;
  orders: CartItem[];
  total: number;
}
