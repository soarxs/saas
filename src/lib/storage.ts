// Sistema de armazenamento local para o protótipo
export interface Table {
  id: string
  number: number
  status: 'livre' | 'ocupada' | 'aguardando' | 'pronto'
  customer_name?: string
  customer_count?: number
  total_amount: number
  opened_at?: string
  closed_at?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  code: string
  name: string
  description?: string
  price: number
  category: string
  stock: number
  is_active: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  table_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
  status: 'pendente' | 'preparando' | 'pronto' | 'entregue'
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  table_id: string
  amount: number
  payment_method: 'dinheiro' | 'cartao_debito' | 'cartao_credito' | 'pix' | 'vale_alimentacao' | 'cheque' | 'cortesia'
  status: 'pendente' | 'aprovado' | 'cancelado'
  created_at: string
  updated_at: string
}

export interface CashOperation {
  id: string
  value: number
  reason: string
  timestamp: string
}

export interface Shift {
  id: string
  user_id: string
  start_time: string
  end_time?: string
  initial_amount: number
  initial_cash_fund: number
  final_amount?: number
  total_sales?: number
  withdrawals: CashOperation[]
  additions: CashOperation[]
  status: 'aberto' | 'fechado'
  created_at: string
  updated_at: string
}

// Dados mockados iniciais
const mockProducts: Product[] = [
  {
    id: '1',
    code: 'BEB001',
    name: 'Coca-Cola 350ml',
    description: 'Refrigerante Coca-Cola lata 350ml',
    price: 4.50,
    category: 'Bebidas',
    stock: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    code: 'BEB002',
    name: 'Água Mineral 500ml',
    description: 'Água mineral sem gás 500ml',
    price: 2.50,
    category: 'Bebidas',
    stock: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    code: 'LAN001',
    name: 'X-Burger',
    description: 'Hambúrguer com queijo, alface, tomate e maionese',
    price: 12.90,
    category: 'Lanches',
    stock: 30,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    code: 'LAN002',
    name: 'X-Bacon',
    description: 'Hambúrguer com bacon, queijo, alface, tomate e maionese',
    price: 15.90,
    category: 'Lanches',
    stock: 25,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    code: 'BAT001',
    name: 'Batata Frita',
    description: 'Porção de batata frita crocante',
    price: 8.50,
    category: 'Acompanhamentos',
    stock: 40,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    code: 'SOB001',
    name: 'Açaí 300ml',
    description: 'Açaí na tigela com granola e banana',
    price: 9.90,
    category: 'Sobremesas',
    stock: 20,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockTables: Table[] = Array.from({ length: 50 }, (_, i) => {
  // Algumas mesas ocupadas para demonstração
  const isOccupied = [1, 3, 7, 12, 15, 18, 22, 25, 30, 35].includes(i + 1)
  const isWaiting = [2, 8, 14, 20, 28].includes(i + 1)
  const isReady = [5, 11, 16, 24, 32].includes(i + 1)
  
  let status: 'livre' | 'ocupada' | 'aguardando' | 'pronto' = 'livre'
  let customerName = undefined
  let customerCount = undefined
  let totalAmount = 0
  
  if (isOccupied) {
    status = 'ocupada'
    customerName = `Cliente ${i + 1}`
    customerCount = Math.floor(Math.random() * 4) + 1
    totalAmount = Math.floor(Math.random() * 100) + 20
  } else if (isWaiting) {
    status = 'aguardando'
    customerName = `Cliente ${i + 1}`
    customerCount = Math.floor(Math.random() * 4) + 1
    totalAmount = Math.floor(Math.random() * 80) + 15
  } else if (isReady) {
    status = 'pronto'
    customerName = `Cliente ${i + 1}`
    customerCount = Math.floor(Math.random() * 4) + 1
    totalAmount = Math.floor(Math.random() * 90) + 25
  }
  
  return {
    id: `table-${i + 1}`,
    number: i + 1,
    status,
    customer_name: customerName,
    customer_count: customerCount,
    total_amount: totalAmount,
    user_id: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
})

// Funções de armazenamento
export const storage = {
  // Tabelas
  getTables: (): Table[] => {
    const stored = localStorage.getItem('tables')
    if (!stored) {
      localStorage.setItem('tables', JSON.stringify(mockTables))
      return mockTables
    }
    return JSON.parse(stored)
  },

  saveTables: (tables: Table[]): void => {
    localStorage.setItem('tables', JSON.stringify(tables))
  },

  // Produtos
  getProducts: (): Product[] => {
    const stored = localStorage.getItem('products')
    if (!stored) {
      localStorage.setItem('products', JSON.stringify(mockProducts))
      return mockProducts
    }
    return JSON.parse(stored)
  },

  saveProducts: (products: Product[]): void => {
    localStorage.setItem('products', JSON.stringify(products))
  },

  // Pedidos
  getOrders: (): Order[] => {
    const stored = localStorage.getItem('orders')
    return stored ? JSON.parse(stored) : []
  },

  saveOrders: (orders: Order[]): void => {
    localStorage.setItem('orders', JSON.stringify(orders))
  },

  // Pagamentos
  getPayments: (): Payment[] => {
    const stored = localStorage.getItem('payments')
    return stored ? JSON.parse(stored) : []
  },

  savePayments: (payments: Payment[]): void => {
    localStorage.setItem('payments', JSON.stringify(payments))
  },

  // Turnos
  getShifts: (): Shift[] => {
    const stored = localStorage.getItem('shifts')
    return stored ? JSON.parse(stored) : []
  },

  saveShifts: (shifts: Shift[]): void => {
    localStorage.setItem('shifts', JSON.stringify(shifts))
  },

  // Limpar todos os dados
  clearAll: (): void => {
    localStorage.removeItem('tables')
    localStorage.removeItem('products')
    localStorage.removeItem('orders')
    localStorage.removeItem('payments')
    localStorage.removeItem('shifts')
  },

  // Funções específicas para turnos
  getCurrentShift: (): Shift | null => {
    const shifts = storage.getShifts()
    return shifts.find(shift => shift.status === 'aberto') || null
  },

  createShift: (userId: string, initialCashFund: number): Shift => {
    const shifts = storage.getShifts()
    const newShift: Shift = {
      id: generateId(),
      user_id: userId,
      start_time: new Date().toISOString(),
      initial_amount: 0,
      initial_cash_fund: initialCashFund,
      withdrawals: [],
      additions: [],
      status: 'aberto',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const updatedShifts = [...shifts, newShift]
    storage.saveShifts(updatedShifts)
    return newShift
  },

  closeShift: (shiftId: string, finalAmount: number, totalSales: number): void => {
    const shifts = storage.getShifts()
    const updatedShifts = shifts.map(shift => 
      shift.id === shiftId 
        ? {
            ...shift,
            end_time: new Date().toISOString(),
            final_amount: finalAmount,
            total_sales: totalSales,
            status: 'fechado' as const,
            updated_at: new Date().toISOString()
          }
        : shift
    )
    storage.saveShifts(updatedShifts)
  },

  addWithdrawal: (shiftId: string, value: number, reason: string): void => {
    const shifts = storage.getShifts()
    const updatedShifts = shifts.map(shift => 
      shift.id === shiftId 
        ? {
            ...shift,
            withdrawals: [
              ...shift.withdrawals,
              {
                id: generateId(),
                value,
                reason,
                timestamp: new Date().toISOString()
              }
            ],
            updated_at: new Date().toISOString()
          }
        : shift
    )
    storage.saveShifts(updatedShifts)
  },

  addAddition: (shiftId: string, value: number, reason: string): void => {
    const shifts = storage.getShifts()
    const updatedShifts = shifts.map(shift => 
      shift.id === shiftId 
        ? {
            ...shift,
            additions: [
              ...shift.additions,
              {
                id: generateId(),
                value,
                reason,
                timestamp: new Date().toISOString()
              }
            ],
            updated_at: new Date().toISOString()
          }
        : shift
    )
    storage.saveShifts(updatedShifts)
  }
}

// Função para gerar IDs únicos
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
