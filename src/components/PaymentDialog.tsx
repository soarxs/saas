import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '../store/useStore';
import { CartItem, PaymentMethod } from '../types';
import { toast } from 'sonner';
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Gift, 
  X, 
  Check,
  Tag,
  Calculator
} from 'lucide-react';

interface PaymentDialogProps {
  isOpen: boolean;
  tableNumber: number;
  total: number;
  items: CartItem[];
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod, amountPaid?: number) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  tableNumber,
  total,
  items,
  onClose,
  onConfirm
}) => {
  const { currentShift, completeTableSale } = useStore();
  
  // Estados
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [cashInput, setCashInput] = useState<string>('');
  
  // Ref para auto-focus no input de dinheiro
  const cashInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus no input de dinheiro quando selecionar dinheiro
  useEffect(() => {
    if (selectedMethod === 'dinheiro' && cashInputRef.current) {
      setTimeout(() => {
        cashInputRef.current?.focus();
      }, 100);
    }
  }, [selectedMethod]);
  
  // Calcular troco
  const calculateChange = () => {
    if (selectedMethod !== 'dinheiro') return 0;
    const paid = parseFloat(cashInput) || 0;
    return Math.max(0, paid - total);
  };
  
  // Calcular falta
  const calculateRemaining = () => {
    if (selectedMethod === 'dinheiro') {
      const paid = parseFloat(cashInput) || 0;
      return Math.max(0, total - paid);
    }
    return selectedMethod ? 0 : total;
  };
  
  // Verificar se pode confirmar
  const canConfirm = () => {
    if (!selectedMethod) return false;
    
    if (selectedMethod === 'dinheiro') {
      const paid = parseFloat(cashInput) || 0;
      return paid >= total;
    }
    
    return true; // Outras formas assumem pagamento exato
  };
  
  // Selecionar forma de pagamento
  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    
    // Se não for dinheiro, define valor pago = total
    if (method !== 'dinheiro') {
      setPaidAmount(total);
    } else {
      setPaidAmount(0);
      setCashInput('');
    }
  };
  
  // Lidar com input de dinheiro
  const handleCashInput = (value: string) => {
    // Permitir apenas números e ponto
    const numericValue = value.replace(/[^0-9.]/g, '');
    setCashInput(numericValue);
    
    const paid = parseFloat(numericValue) || 0;
    setPaidAmount(paid);
  };
  
  // Confirmar pagamento
  const handleConfirm = () => {
    if (!canConfirm()) {
      toast.error('Pagamento incompleto');
      return;
    }
    
    const finalAmount = selectedMethod === 'dinheiro' 
      ? parseFloat(cashInput) || 0
      : total;
    
    console.log('Confirmando pagamento no PaymentDialog:', {
      selectedMethod,
      finalAmount,
      total,
      tableNumber
    });
    
    onConfirm(selectedMethod!, finalAmount);
  };
  
  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // F2 = Confirmar
      if (e.key === 'F2') {
        e.preventDefault();
        if (canConfirm()) handleConfirm();
      }
      
      // F3 = Cancelar
      if (e.key === 'F3') {
        e.preventDefault();
        onClose();
      }
      
      // 1-5 = Selecionar forma de pagamento
      if (e.key === '1') handleSelectMethod('dinheiro');
      if (e.key === '2') handleSelectMethod('debito');
      if (e.key === '3') handleSelectMethod('credito');
      if (e.key === '4') handleSelectMethod('pix');
      if (e.key === '5') handleSelectMethod('cortesia');
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, canConfirm]);
  
  const change = calculateChange();
  const remaining = calculateRemaining();
  const isPaid = remaining === 0 && selectedMethod !== null;
  
  // Formas de pagamento
  const paymentMethods = [
    {
      id: 'dinheiro' as PaymentMethod,
      name: 'Dinheiro',
      icon: DollarSign,
      color: 'green',
      enabled: true,
      showInput: true
    },
    {
      id: 'debito' as PaymentMethod,
      name: 'C. Débito',
      icon: CreditCard,
      color: 'blue',
      enabled: true,
      showInput: false
    },
    {
      id: 'credito' as PaymentMethod,
      name: 'C. Crédito',
      icon: CreditCard,
      color: 'purple',
      enabled: true,
      showInput: false
    },
    {
      id: 'pix' as PaymentMethod,
      name: 'Pix',
      icon: Smartphone,
      color: 'orange',
      enabled: true,
      showInput: false
    },
    {
      id: 'prazo' as PaymentMethod,
      name: 'Prazo',
      icon: Tag,
      color: 'gray',
      enabled: false,
      showInput: false
    },
    {
      id: 'cortesia' as PaymentMethod,
      name: 'Cortesia',
      icon: Gift,
      color: 'green',
      enabled: true,
      showInput: false
    },
    {
      id: 'vale' as PaymentMethod,
      name: 'Vale Ali.',
      icon: Tag,
      color: 'gray',
      enabled: false,
      showInput: false
    },
    {
      id: 'cheque' as PaymentMethod,
      name: 'Cheque',
      icon: DollarSign,
      color: 'gray',
      enabled: false,
      showInput: false
    }
  ];
  
  const getColorClasses = (color: string, isSelected: boolean, enabled: boolean) => {
    if (!enabled) {
      return 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50';
    }
    
    if (isSelected) {
      switch (color) {
        case 'green': return 'bg-green-50 border-4 border-green-500 text-green-800';
        case 'blue': return 'bg-blue-50 border-4 border-blue-500 text-blue-800';
        case 'purple': return 'bg-purple-50 border-4 border-purple-500 text-purple-800';
        case 'orange': return 'bg-orange-50 border-4 border-orange-500 text-orange-800';
        default: return 'bg-gray-50 border-4 border-gray-500 text-gray-800';
      }
    }
    
    return 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 cursor-pointer';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] p-0">
        <DialogDescription className="sr-only">
          Interface para finalizar pagamento da {tableNumber === 0 ? 'BALCÃO' : `Mesa ${tableNumber}`}
        </DialogDescription>
        <div className="flex h-full">
          {/* COLUNA ESQUERDA (40%) */}
          <div className="w-2/5 p-6 border-r border-gray-200">
            {/* Header */}
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-blue-800">
                Fechamento - {tableNumber === 0 ? 'BALCÃO' : `Mesa ${tableNumber}`}
              </DialogTitle>
            </DialogHeader>
            
            {/* Resumo Financeiro */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sub-Total (+):</span>
                    <span className="font-semibold">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Adiantamento(-):</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Serviços (+):</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Couvert (+):</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Desconto (-):</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Acréscimo (+):</span>
                    <span>R$ 0,00</span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total a pagar (+):</span>
                      <span className="text-red-600">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Botões Inferiores */}
            <div className="space-y-3">
              <Button
                variant="outline"
                disabled
                className="w-full h-12"
              >
                <Tag className="w-4 h-4 mr-2" />
                Lançar Taxas e Descontos (F4)
              </Button>
              
              <Button
                variant="outline"
                disabled
                className="w-full h-12"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Conferir e dividir (F6)
              </Button>
            </div>
          </div>
          
          {/* COLUNA DIREITA (60%) */}
          <div className="flex-1 p-6">
            {/* Formas de Pagamento */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Formas de Pagamento
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  
                  return (
                    <Card
                      key={method.id}
                      className={`h-40 p-4 transition-all ${getColorClasses(method.color, isSelected, method.enabled)}`}
                      onClick={() => method.enabled && handleSelectMethod(method.id)}
                    >
                      <CardContent className="p-0 h-full flex flex-col">
                        <div className="flex items-center justify-center mb-2">
                          <Icon className="w-8 h-8" />
                        </div>
                        
                        <div className="text-center font-semibold mb-2">
                          {method.name}
                        </div>
                        
                        {method.showInput && isSelected && (
                          <div className="space-y-2">
                            <Input
                              ref={cashInputRef}
                              type="text"
                              value={cashInput}
                              onChange={(e) => handleCashInput(e.target.value)}
                              placeholder="R$ 0,00"
                              className="text-center text-lg font-bold h-10"
                            />
                            <div className="text-xs text-center">
                              <div>Pagto: R$ {paidAmount.toFixed(2)}</div>
                              <div>Recebido: R$ {paidAmount.toFixed(2)}</div>
                              {change > 0 && (
                                <div className="text-green-600 font-bold">
                                  Troco: R$ {change.toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!method.showInput && isSelected && (
                          <div className="text-center text-sm">
                            <div className="font-bold">Pagamento Exato</div>
                            <div>R$ {total.toFixed(2)}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            {/* Seção de Total */}
            <div className="mb-6">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Pago:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {paidAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-semibold">Falta:</span>
                    <span className={`text-2xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      R$ {remaining.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex gap-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 h-16 text-lg text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="w-5 h-5 mr-2" />
                Cancelar (F3)
              </Button>
              
              <Button
                onClick={handleConfirm}
                disabled={!canConfirm()}
                className="flex-1 h-16 text-lg bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <Check className="w-5 h-5 mr-2" />
                Receber (F2)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
