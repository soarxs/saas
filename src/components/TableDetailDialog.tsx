import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useStore } from '../store/useStore';
import { useRecipeStore } from '../store/recipeStore';
import ProductAddDialog from './ProductAddDialog';
import PaymentDialog from './PaymentDialog';
import { toast } from 'sonner';
import { 
  Trash2, 
  Check, 
  RotateCcw, 
  X, 
  Printer, 
  History, 
  Settings, 
  Truck, 
  FileText,
  ArrowLeft
} from 'lucide-react';

interface TableDetailDialogProps {
  isOpen: boolean;
  tableNumber: number;
  onClose: () => void;
}

const TableDetailDialog: React.FC<TableDetailDialogProps> = ({ 
  isOpen, 
  tableNumber, 
  onClose 
}) => {
  const { products, currentShift, tables, addToTable, removeFromTable, updateIndividualProduct, completeTableSale, syncProducts } = useStore();
  const { decrementStock } = useRecipeStore();
  
  // Verificar se produtos estão carregados
  useEffect(() => {
    if (products.length === 0) {
      console.log('🔄 Produtos não carregados, sincronizando...');
      syncProducts();
    } else {
      console.log('✅ Produtos carregados:', products.length);
      console.log('📋 Primeiros 5 produtos:', products.slice(0, 5).map(p => ({ id: p.id, name: p.name, code: p.code })));
    }
  }, [products.length, syncProducts]);

  // Debug: verificar se o dialog está sendo fechado
  useEffect(() => {
    console.log('🔍 TableDetailDialog - isOpen:', isOpen, 'tableNumber:', tableNumber);
  }, [isOpen, tableNumber]);
  
  // Estados
  const [searchCode, setSearchCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [people, setPeople] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  // Ref para auto-focus
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus no campo de busca
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Buscar mesa atual
  const currentTable = tables.find(t => t.id === tableNumber);
  const tableOrders = currentTable?.orders || [];
  const tableTotal = tableOrders.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Função para buscar produto
  const handleSearchProduct = (code: string) => {
    if (!code.trim()) {
      toast.error('Digite um código');
      return;
    }
    
    // Normalizar código (remover zeros à esquerda extras)
    const normalizedCode = code.trim().padStart(2, '0');
    
    console.log('🔍 Buscando código:', normalizedCode);
    console.log('📦 Produtos disponíveis:', products.length);
    
    // Buscar produto por código
    const product = products.find(p => {
      const productCode = p.code.padStart(2, '0');
      console.log(`Comparando: "${productCode}" === "${normalizedCode}"`);
      return productCode === normalizedCode;
    });

    if (product) {
      console.log('✅ Produto encontrado:', product);
      // Guardar produto selecionado
      setSelectedProduct(product);
      // Abrir dialog de acréscimos
      setShowProductDialog(true);
      // Limpar campo
      setSearchCode('');
    } else {
      console.error('❌ Produto NÃO encontrado para código:', code);
      console.log('Códigos disponíveis:', products.map(p => p.code));
      toast.error(`Produto ${code} não encontrado`);
    }
  };
  
  // Função para remover item
  const handleRemoveItem = (uniqueId: string) => {
    removeFromTable(tableNumber, '', uniqueId);
    toast.success('Item removido');
  };
  
  // Função para finalizar
  const handleFinalize = () => {
    if (tableOrders.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }
    setShowPaymentDialog(true);
  };
  
  // Função para voltar
  const handleBack = () => {
    onClose();
  };
  
  // Função para adicionar produto
  const handleAddProduct = (
    product: any,
    quantity: number,
    modifications: string,
    customPrice: number
  ) => {
    console.log('Adicionando produto:', {
      product: product.name,
      quantity,
      modifications,
      customPrice,
      tableNumber
    });
    
    // Verificar estoque antes de adicionar
    let stockSuccess = true;
    for (let i = 0; i < quantity; i++) {
      const success = decrementStock(product.id, modifications);
      if (!success) {
        stockSuccess = false;
        break;
      }
    }
    
    if (!stockSuccess) {
      toast.error('Estoque insuficiente! Verifique os ingredientes disponíveis.');
      return;
    }
    
    // Adicionar à mesa múltiplas vezes (uma para cada quantidade)
    for (let i = 0; i < quantity; i++) {
      addToTable(tableNumber, {
        ...product,
        price: customPrice
      }, 1);
    }
    
    // Se houver modificações, atualizar os itens adicionados
    if (modifications) {
      // Aguardar um pouco para o estado ser atualizado
      setTimeout(() => {
        const table = tables.find(t => t.id === tableNumber);
        if (table && table.orders.length > 0) {
          const lastItems = table.orders.slice(-quantity);
          lastItems.forEach(item => {
            if (item.uniqueId) {
              updateIndividualProduct(
                tableNumber,
                item.uniqueId,
                customPrice,
                modifications
              );
            }
          });
        }
      }, 100);
    }
    
    toast.success(`${quantity}x ${product.name} adicionado!`);
  };
  
  // Função para confirmar pagamento
  const handleConfirmPayment = async (
    paymentMethod: any,
    amountPaid?: number
  ) => {
    if (!currentShift?.isActive) {
      toast.error('Abra um turno primeiro');
      return;
    }
    
    try {
      console.log('Confirmando pagamento:', {
        paymentMethod,
        amountPaid,
        tableNumber,
        total: tableTotal
      });
      
      // Finalizar mesa (isso já cria a venda e limpa a mesa)
      completeTableSale(tableNumber, paymentMethod);
      
      // Fechar dialogs
      setShowPaymentDialog(false);
      
      // Mostrar sucesso
      toast.success('Pagamento confirmado!');
      
      // Voltar para grid
      onClose();
      
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    }
  };
  
  // Função para lidar com Enter no campo de busca
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchProduct(searchCode);
    }
  };
  
  const isBalcao = tableNumber === 0;
  const hasItems = tableOrders.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogDescription className="sr-only">
          Interface para gerenciar mesa {tableNumber === 0 ? 'BALCÃO' : tableNumber}
        </DialogDescription>
        <div className="flex h-full">
          {/* COLUNA ESQUERDA (70%) */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            {/* Header Azul */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-6">
              <DialogTitle className="text-2xl font-bold mb-4">
                {isBalcao ? '🏪 BALCÃO' : `🪑 Mesa/Comanda: ${tableNumber}`}
              </DialogTitle>
              
              {!isBalcao && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer" className="text-blue-100 text-sm">
                      Cliente (opcional)
                    </Label>
                    <Input
                      id="customer"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nome do cliente"
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="people" className="text-blue-100 text-sm">
                      Qtde. Pessoas
                    </Label>
                    <Input
                      id="people"
                      type="number"
                      min="1"
                      value={people}
                      onChange={(e) => setPeople(parseInt(e.target.value) || 1)}
                      className="mt-1 bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Campo de Busca */}
            <div className="p-6 border-b border-gray-200">
              <Label className="text-lg font-semibold text-gray-700 mb-3 block">
                🔍 Lançar produto
              </Label>
              <div className="flex gap-3">
                <Input
                  ref={searchInputRef}
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite o código do produto e pressione ENTER"
                  className="h-12 text-lg font-mono"
                />
                <Button
                  variant="outline"
                  className="h-12 px-6"
                  onClick={() => toast.info('Consulta visual (próxima fase)')}
                >
                  📋 F1
                </Button>
              </div>
            </div>
            
            {/* Tabela de Produtos */}
            <div className="flex-1 p-6">
              <div className="bg-cyan-50 rounded-lg border border-cyan-200">
                <div className="bg-cyan-100 px-4 py-3 rounded-t-lg border-b border-cyan-200">
                  <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-cyan-800">
                    <div>Cód.</div>
                    <div>Produto</div>
                    <div>Qtde</div>
                    <div>Preço</div>
                    <div>Total</div>
                    <div>Ação</div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {tableOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-lg">Nenhum item lançado</p>
                      <p className="text-sm">Digite um código de produto para começar</p>
                    </div>
                  ) : (
                    tableOrders.map((item, index) => (
                      <div 
                        key={item.uniqueId || index}
                        className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-cyan-200 last:border-b-0 hover:bg-cyan-100/50"
                      >
                        <div className="text-sm font-mono text-gray-600">
                          {item.productId}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.productName}
                          </div>
                          {item.modifications && (
                            <div className="text-xs text-red-600 font-medium">
                              {item.modifications}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-700">
                          {item.quantity}
                        </div>
                        <div className="text-sm text-gray-700">
                          R$ {item.price.toFixed(2)}
                        </div>
                        <div className="text-sm font-bold text-green-600">
                          R$ {item.subtotal.toFixed(2)}
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.uniqueId || '')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* COLUNA DIREITA (30%) */}
          <div className="w-80 bg-gray-50 flex flex-col">
            {/* Card de Total */}
            <div className="p-6">
              <Card className="bg-red-500 border-red-500 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-sm font-medium mb-2">Total Mesa</div>
                  <div className="text-5xl font-bold">
                    R$ {tableTotal.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex-1 px-6 space-y-3">
              <Button
                onClick={handleFinalize}
                disabled={!hasItems}
                className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
              >
                <Check className="w-5 h-5 mr-2" />
                Finalizar / Imprimir (F2)
              </Button>
              
              <Button
                variant="outline"
                disabled={!hasItems}
                className="w-full h-14"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Encerrar / Reabrir (F3)
              </Button>
              
              <Button
                variant="outline"
                disabled={!hasItems}
                className="w-full h-14"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar / Transferir (F4)
              </Button>
              
              <Button
                variant="outline"
                disabled={!hasItems}
                className="w-full h-14"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir (F5)
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-14"
              >
                <History className="w-4 h-4 mr-2" />
                Histórico de Pedidos (F6)
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-14"
              >
                <Settings className="w-4 h-4 mr-2" />
                Utilitários (F7)
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-14"
              >
                <Truck className="w-4 h-4 mr-2" />
                Delivery (F8)
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-14"
              >
                <FileText className="w-4 h-4 mr-2" />
                Comandas (F9)
              </Button>
            </div>
            
            {/* Botão Voltar */}
            <div className="p-6">
              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Dialog de Adicionar Produto */}
        {showProductDialog && selectedProduct && (
          <ProductAddDialog
            isOpen={true}
            product={selectedProduct}
            tableNumber={tableNumber}
            onClose={() => {
              setShowProductDialog(false);
              setSelectedProduct(null);
              // Re-focar campo de busca
              searchInputRef.current?.focus();
            }}
            onAdd={handleAddProduct}
          />
        )}
        
        {/* Dialog de Pagamento */}
        {showPaymentDialog && (
          <PaymentDialog
            isOpen={true}
            tableNumber={tableNumber}
            total={tableTotal}
            items={tableOrders}
            onClose={() => setShowPaymentDialog(false)}
            onConfirm={handleConfirmPayment}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TableDetailDialog;
