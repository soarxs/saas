import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '../store/useStore';
import { useTableOperations } from '../hooks/useTableOperations';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'sonner';
import ProductSearchDialog from './ProductSearchDialog';
import IngredientsDialog from './IngredientsDialog';
import PaymentDialog from './PaymentDialog';

interface TableDialogProps {
  isOpen: boolean;
  tableNumber: number;
  onClose: () => void;
}

const TableDialog: React.FC<TableDialogProps> = ({ 
  isOpen, 
  tableNumber, 
  onClose 
}) => {
  const { currentShift, syncAllStores } = useStore();
  const { getTableData, searchProductByCode } = useTableOperations();
  
  // Estados
  const [customerName, setCustomerName] = useState('');
  const [people, setPeople] = useState(1);
  const [productCode, setProductCode] = useState('');
  const [tableData, setTableData] = useState<any>(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Ref para auto-focus
  const productInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados da mesa
  useEffect(() => {
    if (isOpen) {
      syncAllStores();
      const data = getTableData(tableNumber);
      setTableData(data);
    }
  }, [isOpen, tableNumber, syncAllStores, getTableData]);

  // Auto-focus no input de produto
  useEffect(() => {
    if (isOpen && productInputRef.current) {
      setTimeout(() => {
        productInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Função para buscar produto
  const handleSearchProduct = (code: string) => {
    if (!code.trim()) {
      toast.error('Digite um código');
      return;
    }

    const product = searchProductByCode(code);
    if (product) {
      setSelectedProduct(product);
      setShowIngredients(true);
      setProductCode('');
    }
  };

  // Função para finalizar mesa
  const handleFinalize = (print: boolean = true) => {
    if (!currentShift?.isActive) {
      toast.error('Abra um turno primeiro');
      return;
    }

    if (!tableData || tableData.orders.length === 0) {
      toast.error('Nenhum produto adicionado à mesa');
      return;
    }

    console.log('Finalizando mesa:', tableNumber, 'Imprimir:', print);
    
    if (print) {
      // Finalizar e imprimir
      toast.success('Mesa finalizada e impressa!');
    } else {
      // Finalizar sem imprimir
      toast.success('Mesa finalizada!');
    }

    onClose();
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

      // F1 - Buscar produtos
      if (e.key === 'F1') {
        e.preventDefault();
        setShowProductSearch(true);
      }

      // F2 - Finalizar e imprimir
      if (e.key === 'F2') {
        e.preventDefault();
        handleFinalize(true);
      }

      // F3 - Finalizar sem imprimir
      if (e.key === 'F3') {
        e.preventDefault();
        handleFinalize(false);
      }

      // F4 - Cancelar
      if (e.key === 'F4') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, tableData]);

  const isBalcao = tableNumber === 0;
  const hasItems = tableData?.orders.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#A5C9D4] p-0">
        <DialogDescription className="sr-only">
          Interface para gerenciar {isBalcao ? 'BALCÃO' : `Mesa ${tableNumber}`}
        </DialogDescription>
        
        {/* Header do Dialog */}
        <div className="legacy-dialog-header">
          <div className="bg-white p-2 rounded mb-4 flex justify-between items-center">
            <div className="text-xl font-bold">
              Mesa/Comanda: {isBalcao ? 'BALCÃO' : tableNumber}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleFinalize(true)}
                className="legacy-button legacy-button-green"
              >
                ✓ Finalizar / Imprimir(F2)
              </button>
              <button 
                onClick={() => handleFinalize(false)}
                className="legacy-button legacy-button-red"
              >
                ⊗ Finalizar / Não Imprimir(F3)
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Cliente e Qtde Pessoas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Cliente</label>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="legacy-input"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Qtde. Pessoas</label>
              <input 
                type="number" 
                value={people}
                onChange={(e) => setPeople(parseInt(e.target.value) || 1)}
                min="1"
                className="legacy-input"
              />
            </div>
          </div>

          {/* Campo de produto */}
          <div>
            <label className="font-bold block mb-1">Cód./Nome Produto[F1]</label>
            <div className="flex gap-2">
              <input 
                ref={productInputRef}
                type="text" 
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchProduct(productCode);
                  }
                }}
                placeholder="Digite o código ou F1 para buscar"
                className="flex-1 legacy-input"
              />
              <button 
                onClick={() => setShowProductSearch(true)}
                className="legacy-button legacy-button-gray"
              >
                📋
              </button>
            </div>
          </div>

          {/* Tabela de produtos lançados */}
          <div>
            <div className="font-bold mb-2">Produtos lançados</div>
            <table className="legacy-table">
              <thead>
                <tr>
                  <th className="p-2">Cód.</th>
                  <th className="p-2">Produto</th>
                  <th className="p-2">Qtde</th>
                  <th className="p-2">Preço</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.orders.map((order: any, index: number) => (
                  <tr key={index}>
                    <td className="p-2">{order.productId}</td>
                    <td className="p-2">{order.name}</td>
                    <td className="p-2">{order.quantity}</td>
                    <td className="p-2">{formatCurrency(order.price)}</td>
                    <td className="p-2">{formatCurrency(order.subtotal)}</td>
                    <td className="p-2">
                      <button className="legacy-button legacy-button-red text-xs">
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
                {(!tableData?.orders || tableData.orders.length === 0) && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      Nenhum produto adicionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          {hasItems && (
            <div className="bg-red-500 text-white p-4 rounded text-center">
              <div className="text-xl font-bold">
                Total: {formatCurrency(tableData?.total || 0)}
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="font-bold block mb-1">Observações</label>
            <textarea 
              className="w-full p-2 border-2 border-gray-400 rounded h-20"
              placeholder="Observações do pedido..."
            />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setShowPayment(true)}
              className="legacy-button legacy-button-green"
            >
              💰 Pagamento
            </button>
            <button 
              onClick={onClose}
              className="legacy-button legacy-button-gray"
            >
              ⊗ Cancelar(F4)
            </button>
          </div>
        </div>

        {/* Dialog de Busca de Produtos */}
        <ProductSearchDialog
          isOpen={showProductSearch}
          onClose={() => setShowProductSearch(false)}
          onSelect={(product) => {
            setSelectedProduct(product);
            setShowProductSearch(false);
            setShowIngredients(true);
          }}
        />

        {/* Dialog de Ingredientes */}
        {selectedProduct && (
          <IngredientsDialog
            isOpen={showIngredients}
            product={selectedProduct}
            tableNumber={tableNumber}
            onClose={() => {
              setShowIngredients(false);
              setSelectedProduct(null);
            }}
            onConfirm={(product, quantity, modifications, finalPrice) => {
              console.log('Produto confirmado:', { product, quantity, modifications, finalPrice });
              setShowIngredients(false);
              setSelectedProduct(null);
              // Recarregar dados da mesa
              const data = getTableData(tableNumber);
              setTableData(data);
            }}
          />
        )}

        {/* Dialog de Pagamento */}
        <PaymentDialog
          isOpen={showPayment}
          tableNumber={tableNumber}
          total={tableData?.total || 0}
          items={tableData?.orders || []}
          onClose={() => setShowPayment(false)}
          onConfirm={(paymentMethod, amountPaid) => {
            console.log('Pagamento confirmado:', { paymentMethod, amountPaid });
            setShowPayment(false);
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TableDialog;
