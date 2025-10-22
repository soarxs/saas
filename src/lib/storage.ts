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

// Cardápio real da CIA DO LANCHE
const mockProducts: Product[] = [
  // LANCHES
  { id: '1', code: '01', name: 'X-EGG', description: 'Pão, Carne, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 18.50, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', code: '02', name: 'BAURU', description: 'Pão, Ovo, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 17.50, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', code: '03', name: 'HAMBURGUER', description: 'Pão, Carne, Maionese, Alface, Tomate, Batata e Milho', price: 15.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', code: '04', name: 'X-BACON EGG', description: 'Pão, Carne, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 20.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', code: '05', name: 'MISTO QUENTE', description: 'Pão de Forma, Presunto e Queijo', price: 13.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', code: '06', name: 'X-BURGUER', description: 'Pão, Carne, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 17.50, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', code: '07', name: 'MISTO ESPECIAL', description: 'Pão, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 17.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', code: '08', name: 'X-ESPECIAL', description: 'Pão, Carne, Bacon, Frango, Ovo, Presunto, Maionese, Alface, Tomate, Batata e Milho', price: 23.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '9', code: '09', name: 'X-BACON', description: 'Pão, Carne, Bacon, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 19.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '10', code: '10', name: 'PIK-NIK', description: 'Pão, Bacon, Ovo, Presunto, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 19.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11', code: '11', name: 'CALAFRANGO', description: 'Pão, 2 Frangos, Calabresa, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 20.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '12', code: '12', name: 'KIKOKÓ', description: 'Pão, 2 Frangos, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 19.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '13', code: '13', name: 'FRAMBURGUER', description: 'Pão, Frango, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 20.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '14', code: '14', name: 'X-BLACK', description: 'Pão, Carne, Bacon, Ovo, Presunto, Maionese, Alface, Tomate, Batata e Milho', price: 20.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '15', code: '15', name: 'X-FRANGO', description: 'Pão, Carne, Frango, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 21.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '16', code: '16', name: 'BELISCÃO', description: 'Pão, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 15.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '17', code: '17', name: 'X-FRANGO ESPECIAL', description: 'Pão de Gergelim, Hambúrguer de Picanha, Cebola Roxa, Frango, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 27.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '18', code: '18', name: 'Á MODA', description: 'Pão, Frango, Ovo, Queijo, Salsicha, Maionese, Alface, Tomate, Batata e Milho', price: 20.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '19', code: '19', name: 'X-TUDO', description: 'Pão, Carne, Frango, Bacon, Ovo, Queijo, Presunto, Calabresa, Salsicha, Maionese, Alface, Tomate, Batata e Milho', price: 28.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '20', code: '20', name: 'X-EGG BURGUER', description: 'Pão, Carne, Ovo, Queijo, Presunto, Maionese, Alface, Tomate, Batata e Milho', price: 19.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '21', code: '21', name: 'X-SALADA', description: 'Pão, Carne, Bacon, Queijo, Abacaxi, Maionese, Alface, Tomate, Batata e Milho', price: 20.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '22', code: '22', name: 'HAMBURGUER ESPECIAL', description: 'Pão, Carne, Ovo, Maionese, Alface, Tomate, Batata e Milho', price: 17.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '23', code: '23', name: 'SEM RECLAMAÇÃO', description: 'Pão, 2 Carnes, Frango, Bacon, Ovo, Queijo, Presunto, Calabresa, Salsicha, Abacaxi, Banana, Maionese, Alface, Tomate, Batata e Milho', price: 30.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '24', code: '24', name: 'GOSTOSÃO', description: 'Pão, Carne, Bacon, Salsicha, Presunto, Ovo, Maionese, Alface, Tomate, Batata e Milho', price: 21.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '25', code: '25', name: 'X-PICANHA', description: 'Pão de Gergelim, Hambúrguer de Picanha, Cebola Roxa, Bacon, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 23.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '26', code: '26', name: 'X-EGG BURGUER ESPECIAL', description: 'Pão, 2 Carnes, Presunto, Ovo, Queijo Maionese, Alface, Tomate, Batata e Milho', price: 20.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '27', code: '27', name: 'MEXICANO', description: 'Pão, Frango, Catupiry, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 21.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '28', code: '28', name: 'X-PICANHA ESPECIAL', description: 'Pão de Gergelim, 2 Hambúrgueres de Picanha, Cebola Roxa, Bacon, Ovo, Queijo, Maionese, Alface, Tomate, Batata e Milho', price: 28.00, category: 'Lanches', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // BEBIDAS
  { id: '29', code: '29', name: 'COCA COLA KS', description: 'Coca-Cola 350ml', price: 5.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '30', code: '30', name: 'LATA', description: 'COCA-COLA, COCA ZERO, FANTA LARANJA, FANTA UVA, SPRIT, GUARANÁ, PEPSI', price: 5.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '31', code: '31', name: 'H2O, H2O LIMONETO 500ML', description: 'Água saborizada 500ml', price: 6.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '32', code: '32', name: '600ML', description: 'COCA-COLA, COCA ZERO, FANTA LARANJA, FANTA UVA, SPRIT, KUAT', price: 7.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '33', code: '33', name: 'MATE COURO 1L', description: 'Mate Couro 1 litro', price: 8.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '34', code: '34', name: 'COCA-COLA 1L, COCA ZERO 1L', description: 'Coca-Cola ou Coca Zero 1 litro', price: 8.50, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '35', code: '35', name: 'KUAT E GUARAPAN', description: 'Kuat ou Guaraná Antarctica', price: 10.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '36', code: '36', name: 'FANTA, FANTA UVA, SPRIT, PEPSI, GUARANÁ 2L', description: 'Refrigerantes 2 litros', price: 12.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '37', code: '37', name: 'COCA-COLA 2L', description: 'Coca-Cola 2 litros', price: 14.50, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '38', code: '38', name: 'BRAHMA, SKOL 473ML', description: 'Cerveja Brahma ou Skol 473ml', price: 7.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '39', code: '39', name: 'HEINEKEN 473ML', description: 'Cerveja Heineken 473ml', price: 10.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '40', code: '40', name: 'ENERGÉTICO MONSTER', description: 'Energético Monster', price: 10.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '41', code: '41', name: 'AGUA MINERAL 500ML, AGUA MINERAL 500ML C/GÁS, AGUA MINERAL 1,5L', description: 'Água mineral 500ml, com gás ou 1,5L', price: 10.00, category: 'Bebidas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // SUCOS 500ML
  { id: '42', code: '42', name: 'MORANGO C/ÁGUA', description: 'Suco de morango com água 500ml', price: 11.00, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '43', code: '43', name: 'MORANGO C/LEITE', description: 'Suco de morango com leite 500ml', price: 12.00, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '44', code: '44', name: 'MARACUJÁ C/ÁGUA', description: 'Suco de maracujá com água 500ml', price: 11.00, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '45', code: '45', name: 'MARACUJÁ C/LEITE', description: 'Suco de maracujá com leite 500ml', price: 12.00, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '46', code: '46', name: 'GOIABA C/ÁGUA', description: 'Suco de goiaba com água 500ml', price: 10.00, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '47', code: '47', name: 'GOIABA C/LEITE', description: 'Suco de goiaba com leite 500ml', price: 10.50, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '48', code: '48', name: 'ACEROLA C/ÁGUA', description: 'Suco de acerola com água 500ml', price: 10.00, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '49', code: '49', name: 'ACEROLA C/LEITE', description: 'Suco de acerola com leite 500ml', price: 10.50, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '50', code: '50', name: 'LARANJA', description: 'Suco de laranja 500ml', price: 14.00, category: 'Sucos', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // VITAMINAS 500ML
  { id: '51', code: '51', name: 'BANESTON', description: 'BANANA, LEITE E NESTON 500ml', price: 11.00, category: 'Vitaminas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '52', code: '52', name: 'AMENDOIM', description: 'BANANA, LEITE E AMENDOIM 500ml', price: 11.00, category: 'Vitaminas', stock: 100, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
]

const mockTables: Table[] = Array.from({ length: 50 }, (_, i) => {
  // Todas as mesas começam livres (zeradas)
  return {
    id: `table-${i + 1}`,
    number: i + 1,
    status: 'livre' as const,
    customer_name: undefined,
    customer_count: undefined,
    total_amount: 0,
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
