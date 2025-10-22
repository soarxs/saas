import React, { createContext, useContext, useEffect, useState } from 'react'
import { storage, Shift } from '../lib/storage'
import toast from 'react-hot-toast'

interface ShiftContextType {
  currentShift: Shift | null
  loading: boolean
  openShift: (initialCashFund: number) => Promise<void>
  closeShift: (finalAmount: number, totalSales: number) => Promise<void>
  addWithdrawal: (value: number, reason: string) => Promise<void>
  addAddition: (value: number, reason: string) => Promise<void>
  getShiftReport: () => {
    initialCashFund: number
    totalSales: number
    totalWithdrawals: number
    totalAdditions: number
    expectedCash: number
    difference: number
  } | null
  refreshShift: () => Promise<void>
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export function ShiftProvider({ children }: { children: React.ReactNode }) {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentShift()
  }, [])

  const fetchCurrentShift = async () => {
    try {
      setLoading(true)
      const shift = storage.getCurrentShift()
      setCurrentShift(shift)
    } catch (error) {
      console.error('Erro ao carregar turno atual:', error)
      toast.error('Erro ao carregar turno atual')
    } finally {
      setLoading(false)
    }
  }

  const openShift = async (initialCashFund: number) => {
    try {
      if (currentShift) {
        toast.error('Já existe um turno aberto')
        return
      }

      const userId = 'user-1' // TODO: Pegar do contexto de usuário
      const newShift = storage.createShift(userId, initialCashFund)
      setCurrentShift(newShift)
      toast.success('Turno aberto com sucesso!')
    } catch (error) {
      console.error('Erro ao abrir turno:', error)
      toast.error('Erro ao abrir turno')
      throw error
    }
  }

  const closeShift = async (finalAmount: number, totalSales: number) => {
    try {
      if (!currentShift) {
        toast.error('Nenhum turno aberto para fechar')
        return
      }

      storage.closeShift(currentShift.id, finalAmount, totalSales)
      setCurrentShift(null)
      toast.success('Turno fechado com sucesso!')
    } catch (error) {
      console.error('Erro ao fechar turno:', error)
      toast.error('Erro ao fechar turno')
      throw error
    }
  }

  const addWithdrawal = async (value: number, reason: string) => {
    try {
      if (!currentShift) {
        toast.error('Nenhum turno aberto')
        return
      }

      storage.addWithdrawal(currentShift.id, value, reason)
      await fetchCurrentShift() // Recarregar dados atualizados
      toast.success('Sangria registrada com sucesso!')
    } catch (error) {
      console.error('Erro ao registrar sangria:', error)
      toast.error('Erro ao registrar sangria')
      throw error
    }
  }

  const addAddition = async (value: number, reason: string) => {
    try {
      if (!currentShift) {
        toast.error('Nenhum turno aberto')
        return
      }

      storage.addAddition(currentShift.id, value, reason)
      await fetchCurrentShift() // Recarregar dados atualizados
      toast.success('Reforço registrado com sucesso!')
    } catch (error) {
      console.error('Erro ao registrar reforço:', error)
      toast.error('Erro ao registrar reforço')
      throw error
    }
  }

  const getShiftReport = () => {
    if (!currentShift) return null

    const totalWithdrawals = currentShift.withdrawals.reduce((sum, w) => sum + w.value, 0)
    const totalAdditions = currentShift.additions.reduce((sum, a) => sum + a.value, 0)
    const totalSales = currentShift.total_sales || 0
    const expectedCash = currentShift.initial_cash_fund + totalSales + totalAdditions - totalWithdrawals

    return {
      initialCashFund: currentShift.initial_cash_fund,
      totalSales,
      totalWithdrawals,
      totalAdditions,
      expectedCash,
      difference: 0 // Será calculado no fechamento
    }
  }

  const refreshShift = async () => {
    setLoading(true)
    await fetchCurrentShift()
    setLoading(false)
  }

  const value = {
    currentShift,
    loading,
    openShift,
    closeShift,
    addWithdrawal,
    addAddition,
    getShiftReport,
    refreshShift,
  }

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>
}

export function useShift() {
  const context = useContext(ShiftContext)
  if (context === undefined) {
    throw new Error('useShift deve ser usado dentro de um ShiftProvider')
  }
  return context
}
