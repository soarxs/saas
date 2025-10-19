import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStore } from '../store/useStore';
import { useTableOperations } from '../hooks/useTableOperations';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'sonner';

interface PaymentDialogProps {
  isOpen: boolean;
  tableNumber: number;
  total: number;
  items: any[];
  onClose: () => void;
  onConfirm: (paymentMethod: any, amountPaid?: number) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  tableNumber,
  total,
  items,
  onClose,
  onConfirm
}) => {
  const { currentShift, syncAllStores } = useStore();
  const { finalizeTableSale } = useTableOperations();
  
  // Estados
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [payments, setPayments] = useState<Record<string, number>>({
    dinheiro: 0,
    debito: 0,
    credito: 0,
    pix: 0,
    prazo: 0,
    cortesia: 0,
    vale: 0,
    cheque: 0
  });

  // Ref para auto-focus
  const cashInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus no input de dinheiro quando selecionar dinheiro
  useEffect(() => {
    if (isOpen && selectedMethod === 'dinheiro' && cashInputRef.current) {
      setTimeout(() => {
        cashInputRef.current?.focus();
        cashInputRef.current?.select();
      }, 100);
    }
  }, [isOpen, selectedMethod]);

  // Calcular total pago
  const calculateTotalPaid = () => {
    return Object.values(payments).reduce((sum, amount) => sum + amount, 0);
  };

  // Calcular valor restante
  const calculateRemaining = () => {
    return Math.max(0, total - calculateTotalPaid());
  };

  // Calcular troco
  const calculateChange = () => {
    if (selectedMethod !== 'dinheiro') return 0;
    const paid = parseFloat(cashAmount) || 0;
    return Math.max(0, paid - total);
  };

  // Verificar se pode confirmar
  const canConfirm = () => {
    return calculateRemaining() === 0 && calculateTotalPaid() > 0;
  };

  // Função para selecionar método de pagamento
  const handleSelectMethod = (method: string) => {
    setSelectedMethod(method);
    
    if (method === 'dinheiro') {
      setCashAmount('');
      setPayments(prev => ({ ...prev, dinheiro: 0 }));
    } else {
      // Para outros métodos, definir o valor restante
      const remaining = calculateRemaining();
      setPayments(prev => ({ ...prev, [method]: remaining }));
    }
  };

  // Função para atualizar valor em dinheiro
  const handleCashAmountChange = (value: string) => {
    setCashAmount(value);
    const numericValue = parseFloat(value) || 0;
    setPayments(prev => ({ ...prev, dinheiro: numericValue }));
  };

  // Função para confirmar pagamento
  const handleConfirm = async () => {
    if (!currentShift?.isActive) {
      toast.error('Abra um turno primeiro');
      return;
    }

    if (!canConfirm()) {
      toast.error('Pagamento incompleto');
      return;
    }

    try {
      console.log('Confirmando pagamento:', {
        tableNumber,
        total,
        payments,
        selectedMethod
      });

      // Finalizar venda
      const success = await finalizeTableSale(tableNumber, selectedMethod);
      
      if (success) {
        onConfirm(selectedMethod, calculateTotalPaid());
        onClose();
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // F2 - Receber
      if (e.key === 'F2') {
        e.preventDefault();
        if (canConfirm()) {
          handleConfirm();
        }
      }

      // F3 - Cancelar
      if (e.key === 'F3') {
        e.preventDefault();
        onClose();
      }

      // F4 - Lançar taxas e descontos
      if (e.key === 'F4') {
        e.preventDefault();
        console.log('F4 - Lançar taxas e descontos');
      }

      // F6 - Conferir e dividir
      if (e.key === 'F6') {
        e.preventDefault();
        console.log('F6 - Conferir e dividir');
      }

      // 1-8 = Selecionar forma de pagamento
      const paymentMethods = ['dinheiro', 'debito', 'credito', 'pix', 'prazo', 'cortesia', 'vale', 'cheque'];
      const keyIndex = parseInt(e.key) - 1;
      if (keyIndex >= 0 && keyIndex < paymentMethods.length) {
        handleSelectMethod(paymentMethods[keyIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, canConfirm]);

  const totalPaid = calculateTotalPaid();
  const remaining = calculateRemaining();
  const change = calculateChange();
  const isPaid = remaining === 0 && totalPaid > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">🔒 Fechamento</DialogTitle>
          <DialogDescription className="sr-only">
            Finalizar pagamento da {tableNumber === 0 ? 'BALCÃO' : `Mesa ${tableNumber}`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Coluna esquerda - Resumo */}
          <div className="bg-[#D4E5E8] p-4 rounded border-2 border-gray-400">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Sub-Total (+):</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Adiantamento(-):</span>
                <span>0,00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Serviços (+):</span>
                <span>0,00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Couvert (+):</span>
                <span>0,00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Desconto (-):</span>
                <span>0,00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Acréscimo (+):</span>
                <span>0,00</span>
              </div>
              <hr className="border-gray-400" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total a pagar (+):</span>
                <span className="text-red-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full legacy-button legacy-button-gray">
                Lançar Taxas e Descontos (F4)
              </button>
              <button className="w-full legacy-button legacy-button-gray">
                Conferir e dividir (F6)
              </button>
            </div>
          </div>

          {/* Coluna direita - Formas de pagamento */}
          <div className="space-y-2">
            {/* Dinheiro */}
            <button 
              onClick={() => handleSelectMethod('dinheiro')}
              className={`w-full legacy-payment-button ${
                selectedMethod === 'dinheiro' ? 'legacy-payment-green' : 'legacy-payment-gray'
              }`}
            >
              <span>💵 Dinheiro</span>
              <input 
                ref={cashInputRef}
                type="text" 
                value={cashAmount}
                onChange={(e) => handleCashAmountChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-24 p-1 rounded text-center bg-white"
                placeholder="0"
              />
            </button>

            {/* Outras formas de pagamento */}
            {[
              { icon: '💳', label: 'C. Débito', key: 'debito' },
              { icon: '💳', label: 'C. Crédito', key: 'credito' },
              { icon: '📱', label: 'Pix', key: 'pix' },
              { icon: '📋', label: 'Prazo', key: 'prazo' },
              { icon: '🎁', label: 'Cortesia', key: 'cortesia' },
              { icon: '🎫', label: 'Vale Ali.', key: 'vale' },
              { icon: '📝', label: 'Cheque', key: 'cheque' },
            ].map((payment, index) => (
              <button 
                key={payment.key}
                onClick={() => handleSelectMethod(payment.key)}
                className={`w-full legacy-payment-button ${
                  selectedMethod === payment.key ? 'legacy-payment-green' : 'legacy-payment-gray'
                }`}
              >
                <span>{payment.icon} {payment.label}</span>
                <span>{formatCurrency(payments[payment.key])}</span>
              </button>
            ))}

            {/* Resumo de pagamento */}
            <div className="legacy-payment-summary">
              <div className="flex justify-between text-lg">
                <span>Total Pago:</span>
                <span className="font-bold">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex justify-between text-lg text-red-600">
                <span>Falta:</span>
                <span className="font-bold">{formatCurrency(remaining)}</span>
              </div>
              {change > 0 && (
                <div className="flex justify-between text-lg text-green-600">
                  <span>Troco:</span>
                  <span className="font-bold">{formatCurrency(change)}</span>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={onClose}
                className="flex-1 legacy-button legacy-button-red"
              >
                ⊗ Cancelar(F3)
              </button>
              <button 
                onClick={handleConfirm}
                disabled={!canConfirm()}
                className={`flex-1 legacy-button ${
                  canConfirm() ? 'legacy-button-green' : 'legacy-button-gray'
                }`}
              >
                ✓ Receber(F2)
              </button>
            </div>
          </div>
        </div>

        {/* Informações de atalhos */}
        <div className="text-center text-sm text-gray-600 mt-4">
          Use 1-8 para selecionar forma de pagamento, F2 para receber, F3 para cancelar
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;