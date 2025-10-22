import React, { createContext, useContext, useState } from 'react'
import { generateId } from '../lib/storage'
import toast from 'react-hot-toast'

export interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_code: string
  quantity: number
  unit_price: number
  total_price: number
  category: string
}

export interface DeliveryInfo {
  customer_name: string
  phone: string
  address: string
  neighborhood: string
  delivery_fee: number
}

interface BalcaoContextType {
  cartItems: CartItem[]
  deliveryInfo: DeliveryInfo | null
  addToCart: (product: any, quantity: number, customPrice: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  setDeliveryInfo: (info: DeliveryInfo) => void
  getCartTotal: () => number
  getCartItemsCount: () => number
  addDeliveryFee: (fee: number) => void
}

const BalcaoContext = createContext<BalcaoContextType | undefined>(undefined)

export function BalcaoProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)

  const addToCart = (product: any, quantity: number, customPrice: number) => {
    const existingItemIndex = cartItems.findIndex(item => item.product_id === product.id)
    
    if (existingItemIndex >= 0) {
      // Atualizar item existente
      const updatedItems = cartItems.map((item, index) => 
        index === existingItemIndex 
          ? {
              ...item,
              quantity: item.quantity + quantity,
              total_price: (item.quantity + quantity) * customPrice,
              unit_price: customPrice
            }
          : item
      )
      setCartItems(updatedItems)
    } else {
      // Adicionar novo item
      const newItem: CartItem = {
        id: generateId(),
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity,
        unit_price: customPrice,
        total_price: customPrice * quantity,
        category: product.category
      }
      setCartItems(prev => [...prev, newItem])
    }
    
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
    toast.success('Item removido do carrinho!')
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity, total_price: item.unit_price * quantity }
        : item
    ))
  }

  const clearCart = () => {
    setCartItems([])
    setDeliveryInfo(null)
  }

  const getCartTotal = () => {
    const itemsTotal = cartItems.reduce((sum, item) => sum + item.total_price, 0)
    const deliveryFee = deliveryInfo?.delivery_fee || 0
    return itemsTotal + deliveryFee
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const addDeliveryFee = (fee: number) => {
    if (deliveryInfo) {
      setDeliveryInfo({ ...deliveryInfo, delivery_fee: fee })
    }
  }

  const value = {
    cartItems,
    deliveryInfo,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setDeliveryInfo,
    getCartTotal,
    getCartItemsCount,
    addDeliveryFee,
  }

  return <BalcaoContext.Provider value={value}>{children}</BalcaoContext.Provider>
}

export function useBalcao() {
  const context = useContext(BalcaoContext)
  if (context === undefined) {
    throw new Error('useBalcao deve ser usado dentro de um BalcaoProvider')
  }
  return context
}
