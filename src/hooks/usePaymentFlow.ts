import { useState, useCallback } from 'react';
import { PaymentMethod } from '../types';

/**
 * Hook para gerenciar fluxo de pagamento
 */
export const usePaymentFlow = () => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [cashInput, setCashInput] = useState<string>('');

  /**
   * Seleciona método de pagamento
   */
  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
    
    // Se for dinheiro, limpar input
    if (method === 'dinheiro') {
      setCashInput('');
      setPaidAmount(0);
    } else {
      // Para outros métodos, o valor pago é igual ao total
      setPaidAmount(0);
    }
  }, []);

  /**
   * Atualiza valor pago em dinheiro
   */
  const updateCashAmount = useCallback((amount: string) => {
    setCashInput(amount);
    const numericAmount = parseFloat(amount) || 0;
    setPaidAmount(numericAmount);
  }, []);

  /**
   * Calcula troco
   */
  const calculateChange = useCallback((total: number): number => {
    if (selectedMethod !== 'dinheiro') return 0;
    return Math.max(0, paidAmount - total);
  }, [selectedMethod, paidAmount]);

  /**
   * Calcula valor restante
   */
  const calculateRemaining = useCallback((total: number): number => {
    if (selectedMethod !== 'dinheiro') return 0;
    return Math.max(0, total - paidAmount);
  }, [selectedMethod, paidAmount]);

  /**
   * Verifica se pode confirmar pagamento
   */
  const canConfirmPayment = useCallback((total: number): boolean => {
    if (!selectedMethod) return false;
    
    if (selectedMethod === 'dinheiro') {
      return paidAmount >= total;
    }
    
    return true; // Para outros métodos, sempre pode confirmar
  }, [selectedMethod, paidAmount]);

  /**
   * Obtém valor final do pagamento
   */
  const getFinalAmount = useCallback((total: number): number => {
    if (selectedMethod === 'dinheiro') {
      return paidAmount;
    }
    return total;
  }, [selectedMethod, paidAmount]);

  /**
   * Reseta o fluxo de pagamento
   */
  const resetPaymentFlow = useCallback(() => {
    setSelectedMethod(null);
    setPaidAmount(0);
    setCashInput('');
  }, []);

  /**
   * Obtém informações do pagamento para exibição
   */
  const getPaymentInfo = useCallback((total: number) => {
    const change = calculateChange(total);
    const remaining = calculateRemaining(total);
    const canConfirm = canConfirmPayment(total);
    const finalAmount = getFinalAmount(total);

    return {
      selectedMethod,
      paidAmount,
      cashInput,
      change,
      remaining,
      canConfirm,
      finalAmount,
      isPaid: remaining === 0 && selectedMethod !== null
    };
  }, [
    selectedMethod,
    paidAmount,
    cashInput,
    calculateChange,
    calculateRemaining,
    canConfirmPayment,
    getFinalAmount
  ]);

  return {
    // Estados
    selectedMethod,
    paidAmount,
    cashInput,
    
    // Ações
    selectPaymentMethod,
    updateCashAmount,
    resetPaymentFlow,
    
    // Cálculos
    calculateChange,
    calculateRemaining,
    canConfirmPayment,
    getFinalAmount,
    getPaymentInfo
  };
};
