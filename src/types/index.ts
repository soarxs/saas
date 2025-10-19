
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

// Sistema de Pedidos Unificado
export type OrderSource = 'balcao' | 'mesa' | 'whatsapp' | 'telefone';
export type OrderStatus = 'pendente' | 'preparando' | 'pronto' | 'saiu-entrega' | 'entregue' | 'finalizado';

export interface Order {
  id: string;
  number: string; // Formato: YYYYMMDD-001
  source: OrderSource;
  
  // Cliente (delivery)
  customerName?: string;
  customerPhone?: string;
  address?: string;
  deliveryFee?: number;
  
  // Mesa
  tableNumber?: number;
  
  // Itens
  items: OrderItem[];
  subtotal: number;
  total: number;
  
  // Pagamento
  paymentMethod: PaymentMethod;
  paid: boolean;
  
  // Status
  status: OrderStatus;
  createdAt: string;
  startedPreparingAt?: string;
  readyAt?: string;
  deliveryStartedAt?: string;
  deliveredAt?: string;
  
  // Contexto
  shiftId: string;
  userId: string;
  userName: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  observations?: string;
}

// Sistema de Ingredientes/Acréscimos
export interface Ingredient {
  id: string;
  name: string;
  price: number;
  maxQuantity: number;
  category: 'premium' | 'standard' | 'basic';
  available: boolean;
}

export interface ProductAddition {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

// Receita de produto (quais ingredientes usa)
export interface ProductRecipe {
  productId: string;
  productName: string;
  ingredients: Array<{
    ingredientName: string;
    quantity: number; // Quantidade usada
    unit: 'un' | 'g' | 'ml';
  }>;
}

// Estoque de ingrediente
export interface IngredientStock {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: 'un' | 'g' | 'ml';
  cost: number; // Custo unitário
}
