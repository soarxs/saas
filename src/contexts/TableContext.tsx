import React, { createContext, useContext, useEffect, useState } from 'react'
import { storage, Table, Order, Product, Payment, generateId } from '../lib/storage'
import toast from 'react-hot-toast'

interface TableContextType {
  tables: Table[]
  orders: Order[]
  products: Product[]
  payments: Payment[]
  loading: boolean
  openTable: (tableNumber: number, customerName?: string, customerCount?: number) => Promise<void>
  closeTable: (tableId: string) => Promise<void>
  addOrder: (tableId: string, productId: string, quantity: number, notes?: string) => Promise<void>
  getTableOrders: (tableId: string) => Order[]
  getTableOrdersWithProducts: (tableId: string) => (Order & { product: Product })[]
  refreshTables: () => Promise<void>
  addPayment: (tableId: string, amount: number, paymentMethod: Payment['payment_method']) => Promise<void>
}

const TableContext = createContext<TableContextType | undefined>(undefined)

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const tablesData = storage.getTables()
      const ordersData = storage.getOrders()
      const productsData = storage.getProducts()
      const paymentsData = storage.getPayments()

      setTables(tablesData)
      setOrders(ordersData)
      setProducts(productsData)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const openTable = async (tableNumber: number, customerName?: string, customerCount?: number) => {
    try {
      const updatedTables = tables.map(table => 
        table.number === tableNumber 
          ? {
              ...table,
              status: 'ocupada' as const,
              customer_name: customerName,
              customer_count: customerCount,
              opened_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : table
      )

      setTables(updatedTables)
      storage.saveTables(updatedTables)
      toast.success(`Mesa ${tableNumber} aberta com sucesso!`)
    } catch (error) {
      console.error('Erro ao abrir mesa:', error)
      toast.error('Erro ao abrir mesa')
      throw error
    }
  }

  const closeTable = async (tableId: string) => {
    try {
      const updatedTables = tables.map(table => 
        table.id === tableId 
          ? {
              ...table,
              status: 'livre' as const,
              customer_name: undefined,
              customer_count: undefined,
              total_amount: 0,
              closed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : table
      )

      // Não precisamos mais marcar status dos pedidos

      setTables(updatedTables)
      storage.saveTables(updatedTables)
      toast.success('Mesa fechada com sucesso!')
    } catch (error) {
      console.error('Erro ao fechar mesa:', error)
      toast.error('Erro ao fechar mesa')
      throw error
    }
  }

  const addOrder = async (tableId: string, productId: string, quantity: number, notes?: string) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) {
        toast.error('Produto não encontrado')
        throw new Error('Produto não encontrado')
      }

      const newOrder: Order = {
        id: generateId(),
        table_id: tableId,
        product_id: productId,
        quantity,
        unit_price: product.price,
        total_price: product.price * quantity,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const updatedOrders = [...orders, newOrder]
      setOrders(updatedOrders)
      storage.saveOrders(updatedOrders)

      // Atualizar total da mesa
      await updateTableTotal(tableId)

      toast.success('Pedido adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error)
      throw error
    }
  }


  const updateTableTotal = async (tableId: string) => {
    try {
      const tableOrders = orders.filter(order => 
        order.table_id === tableId
      )
      const total = tableOrders.reduce((sum, order) => sum + order.total_price, 0)

      const updatedTables = tables.map(table => 
        table.id === tableId 
          ? { ...table, total_amount: total, updated_at: new Date().toISOString() }
          : table
      )

      setTables(updatedTables)
      storage.saveTables(updatedTables)
    } catch (error) {
      console.error('Erro ao atualizar total da mesa:', error)
    }
  }

  const getTableOrders = (tableId: string) => {
    return orders.filter(order => order.table_id === tableId)
  }

  const getTableOrdersWithProducts = (tableId: string) => {
    return orders
      .filter(order => order.table_id === tableId)
      .map(order => ({
        ...order,
        product: products.find(p => p.id === order.product_id)!
      }))
      .filter(order => order.product)
  }

  const addPayment = async (tableId: string, amount: number, paymentMethod: Payment['payment_method']) => {
    try {
      const newPayment: Payment = {
        id: generateId(),
        table_id: tableId,
        amount,
        payment_method: paymentMethod,
        status: 'aprovado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const updatedPayments = [...payments, newPayment]
      setPayments(updatedPayments)
      storage.savePayments(updatedPayments)

      toast.success('Pagamento registrado com sucesso!')
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error)
      toast.error('Erro ao registrar pagamento')
      throw error
    }
  }

  const refreshTables = async () => {
    setLoading(true)
    await fetchData()
    setLoading(false)
  }

  const value = {
    tables,
    orders,
    products,
    payments,
    loading,
    openTable,
    closeTable,
    addOrder,
    getTableOrders,
    getTableOrdersWithProducts,
    refreshTables,
    addPayment,
  }

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>
}

export function useTables() {
  const context = useContext(TableContext)
  if (context === undefined) {
    throw new Error('useTables deve ser usado dentro de um TableProvider')
  }
  return context
}