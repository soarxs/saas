
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useStore } from '../store/useStore';
import { ProductCategory } from '../types';
import { useProductSearch } from '../hooks/useProductSearch';
import ProductAddedNotification from './ProductAddedNotification';
import EditOrderDialog from './EditOrderDialog';
import AdvancedSearch from './AdvancedSearch';
import { Plus, Minus, Trash2, Receipt, Search, Edit, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useRef, useEffect } from 'react';
import { printerService } from '../services/printerService';
import { notificationService } from '../services/notificationService';

interface TableOrderDialogProps {
  tableNumber: number;
  onClose: () => void;
  onRequestBill: (tableNumber: number) => void;
}

const TableOrderDialog = ({ tableNumber, onClose, onRequestBill }: TableOrderDialogProps) => {
  const { products, tables, addToTable, removeFromTable, updateTableQuantity } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Fechar menu de contexto ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);
  const ordersScrollRef = useRef<HTMLDivElement>(null);
  
  const table = tables.find(t => t.id === tableNumber);
  
  // Auto-scroll para baixo quando novos pedidos são adicionados
  useEffect(() => {
    if (ordersScrollRef.current && table?.orders.length) {
      ordersScrollRef.current.scrollTop = ordersScrollRef.current.scrollHeight;
    }
  }, [table?.orders.length]);
  const filteredProducts = useProductSearch({
    products,
    searchTerm,
    selectedCategory
  });

  const categories: (ProductCategory | 'all')[] = ['all', 'hamburguer', 'bebida', 'acompanhamento', 'sobremesa', 'outro'];
  const categoryLabels = {
    all: 'Todos',
    hamburguer: 'Hambúrgueres',
    bebida: 'Bebidas',
    acompanhamento: 'Acompanhamentos',
    sobremesa: 'Sobremesas',
    outro: 'Outros'
  };

  const handleAddProduct = (product: any) => {
    addToTable(tableNumber, product);
    setLastAddedProduct(product.name);
    setShowNotification(true);
    const tableName = tableNumber === 0 ? 'Balcão' : `Mesa ${tableNumber}`;
    toast.success(`${product.name} adicionado ao ${tableName}`);
    
    // Notificar sobre novo pedido
    const items = table?.orders.map(order => order.productName) || [];
    notificationService.notifyNewOrder(tableNumber, items);
  };

  const handlePrintOrder = () => {
    if (!table?.orders.length) {
      toast.error('Mesa sem pedidos');
      return;
    }
    
    // Gerar pedido para impressão
    generatePrintOrder();
    
    // Imprimir na impressora real
    try {
      const defaultPrinter = printerService.getDefaultPrinter();
      if (!defaultPrinter) {
        toast.error('Nenhuma impressora configurada');
        return;
      }

      // Converter dados do pedido para formato da impressora
      const kitchenOrderData = {
        tableNumber,
        items: table?.orders.map(order => ({
          name: order.productName,
          quantity: order.quantity,
          observations: order.modifications || '',
          time: new Date().toLocaleTimeString('pt-BR')
        })) || [],
        totalItems: table?.orders.reduce((sum, order) => sum + order.quantity, 0) || 0,
        orderTime: new Date().toLocaleTimeString('pt-BR')
      };

      const jobId = printerService.printKitchenOrder(kitchenOrderData);
      toast.success(`Pedido enviado para impressão! (Job: ${jobId})`);
      
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast.error('Erro ao enviar para impressora');
    }
  };

  const handleRequestBill = () => {
    if (!table?.orders.length) {
      toast.error('Mesa sem pedidos');
      return;
    }
    
    // Gerar conta completa no console
    generateConsoleReceipt();
    
    onRequestBill(tableNumber);
  };

  const generatePrintOrder = () => {
    if (!table) return;
    
    const tableName = getTableName();
    const currentDate = new Date().toLocaleString('pt-BR');
    
    console.log('\n' + '='.repeat(50));
    console.log(`🖨️ PEDIDO PARA IMPRESSÃO - ${tableName.toUpperCase()}`);
    console.log(`🕐 ${currentDate}`);
    console.log('='.repeat(50));
    
    // Agrupar produtos por tipo
    const productGroups: { [key: string]: any[] } = {};
    
    table.orders.forEach(item => {
      if (!productGroups[item.productName]) {
        productGroups[item.productName] = [];
      }
      productGroups[item.productName].push(item);
    });
    
    Object.entries(productGroups).forEach(([productName, items]) => {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      console.log(`${totalQuantity} - ${productName}`);
      
      // Mostrar observações de cada item individual
      items.forEach((item, index) => {
        if (item.modifications) {
          // Converter modificações para formato de observações
          const observations = formatModificationsToObservations(item.modifications);
          observations.forEach(observation => {
            console.log(`                ${observation}`);
          });
        }
      });
      console.log('');
    });
    
    console.log('='.repeat(50) + '\n');
  };

  const formatModificationsToObservations = (modifications: string) => {
    // Converter formato "carne: 1x, ovo: 2x" para "+Carne, +Ovo (2x)"
    const observations: string[] = [];
    const parts = modifications.split(', ');
    
    parts.forEach(part => {
      const [ingredient, qty] = part.split(': ');
      if (ingredient && qty) {
        const ingredientName = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
        const quantity = parseInt(qty.replace('x', ''));
        
        if (quantity > 0) {
          observations.push(`+${ingredientName}${quantity > 1 ? ` (${quantity}x)` : ''}`);
        } else if (quantity < 0) {
          observations.push(`--${ingredientName}`);
        }
      }
    });
    
    return observations;
  };

  const generateConsoleReceipt = () => {
    if (!table) return;
    
    const tableName = getTableName();
    const currentDate = new Date().toLocaleString('pt-BR');
    
    console.log('\n' + '='.repeat(50));
    console.log(`🏪 CIA D LANCHE`);
    console.log(`📋 ${tableName} - ${currentDate}`);
    console.log('='.repeat(50));
    
    table.orders.forEach((item, index) => {
      console.log(`${index + 1}. ${item.productName}`);
      console.log(`   Código: ${item.productId}`);
      console.log(`   Preço: R$ ${(item.customPrice || item.price).toFixed(2)}`);
      console.log(`   Quantidade: ${item.quantity}x`);
      console.log(`   Subtotal: R$ ${item.subtotal.toFixed(2)}`);
      
      if (item.modifications) {
        console.log(`   🔧 Modificações: ${item.modifications}`);
      }
      console.log('');
    });
    
    console.log('-'.repeat(50));
    console.log(`💰 TOTAL: R$ ${table.total.toFixed(2)}`);
    console.log('='.repeat(50) + '\n');
  };

  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setShowEditDialog(true);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleShowTableDescription = () => {
    setShowContextMenu(false);
    showTableDescription();
  };

  const showTableDescription = () => {
    if (!table) return;
    
    const tableName = getTableName();
    const currentDate = new Date().toLocaleString('pt-BR');
    
    console.log('\n' + '='.repeat(50));
    console.log(`📋 DESCRIÇÃO DA ${tableName.toUpperCase()}`);
    console.log(`🕐 ${currentDate}`);
    console.log('='.repeat(50));
    
    // Agrupar produtos por tipo e mostrar apenas modificações
    const productGroups: { [key: string]: any[] } = {};
    
    table.orders.forEach(item => {
      if (!productGroups[item.productName]) {
        productGroups[item.productName] = [];
      }
      productGroups[item.productName].push(item);
    });
    
    Object.entries(productGroups).forEach(([productName, items]) => {
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const hasModifications = items.some(item => item.modifications);
      
      console.log(`${productName} (${totalQuantity}x)`);
      
      if (hasModifications) {
        items.forEach((item, index) => {
          if (item.modifications) {
            console.log(`   ${index + 1}. ${item.modifications}`);
          }
        });
      }
      console.log('');
    });
    
    console.log(`💰 TOTAL: R$ ${table.total.toFixed(2)}`);
    console.log('='.repeat(50) + '\n');
  };

  const getTableName = () => {
    return tableNumber === 0 ? 'Balcão' : `Mesa ${tableNumber}`;
  };

  return (
    <>
    <Dialog open onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden"
        onContextMenu={handleContextMenu}
      >
        <DialogHeader>
          <DialogTitle>{getTableName()} - Pedidos</DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[70vh]">
          {/* Products */}
          <div className="flex-1 pr-4 overflow-y-auto">
            <div className="mb-3 space-y-2">
              <AdvancedSearch
                products={products}
                onProductSelect={(product) => {
                  addToTable(tableNumber, product);
                  setLastAddedProduct(product.name);
                  setShowNotification(true);
                  setTimeout(() => setShowNotification(false), 2000);
                }}
                placeholder="Buscar: X-EGG, 01, frango bacon..."
                className="h-10"
              />
              
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ProductCategory | 'all')}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="grid grid-cols-1 gap-2">
              {filteredProducts.map(product => (
                <Card key={product.id} className="cursor-pointer card-modern hover:shadow-md transition-all duration-200">
                  <CardContent className="p-3" onClick={() => handleAddProduct(product)}>
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-gray-800 truncate">{product.name}</h3>
                        <p className="text-xs text-gray-600">Cód: {product.code}</p>
                        {product.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg font-bold text-green-600">
                          R$ {product.price.toFixed(2)}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {categoryLabels[product.category]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="w-80 border-l pl-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Pedidos da Mesa</h3>
              <div className="text-sm text-gray-600">
                {table?.orders.length || 0} itens
              </div>
            </div>
            
            <div ref={ordersScrollRef} className="flex-1 overflow-y-auto space-y-2 mb-4">
              {!table?.orders.length ? (
                <div className="text-center text-muted-foreground py-8">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Receipt className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm">Nenhum pedido adicionado</p>
                  <p className="text-xs mt-1">Clique em um produto para adicionar</p>
                </div>
              ) : (
                table.orders.map((item, index) => (
                  <Card key={item.uniqueId || `${item.productId}-${index}`} className="border-l-4 border-l-green-500">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-800 truncate">{item.productName}</h4>
                          <p className="text-xs text-gray-500">Cód: {item.productId}</p>
                          {item.modifications && (
                            <p className="text-xs text-blue-600 mt-1">Modificações: {item.modifications}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            onClick={() => handleEditOrder(item)}
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            onClick={() => removeFromTable(tableNumber, item.productId, item.uniqueId)}
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => updateTableQuantity(tableNumber, item.productId, item.quantity - 1)}
                            variant="outline" 
                            size="sm"
                            className="h-7 w-7 p-0 border-green-200 hover:bg-green-50"
                          >
                            <Minus className="w-3 h-3 text-green-600" />
                          </Button>
                          <span className="text-sm font-bold w-8 text-center text-gray-800">{item.quantity}</span>
                          <Button 
                            onClick={() => updateTableQuantity(tableNumber, item.productId, item.quantity + 1)}
                            variant="outline" 
                            size="sm"
                            className="h-7 w-7 p-0 border-green-200 hover:bg-green-50"
                          >
                            <Plus className="w-3 h-3 text-green-600" />
                          </Button>
                        </div>
                        <span className="text-sm font-bold text-green-600">R$ {item.subtotal.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total:</span>
                <span>R$ {(table?.total || 0).toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handlePrintOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!table?.orders.length}
                >
                  🖨️ Imprimir Pedido
                </Button>
                <Button 
                  onClick={handleRequestBill}
                  className="w-full"
                  disabled={!table?.orders.length}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Solicitar Conta
                </Button>
                <Button onClick={onClose} variant="outline" className="w-full">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Notificação de produto adicionado */}
    <ProductAddedNotification
      productName={lastAddedProduct}
      isVisible={showNotification}
      onComplete={() => setShowNotification(false)}
    />
    
    {/* Dialog de edição de pedido */}
    {editingOrder && (
      <EditOrderDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingOrder(null);
        }}
        tableNumber={tableNumber}
        productId={editingOrder.productId}
        uniqueId={editingOrder.uniqueId || editingOrder.productId}
        productName={editingOrder.productName}
        currentQuantity={editingOrder.quantity}
        currentPrice={editingOrder.subtotal}
      />
    )}
    
    {/* Menu de Contexto */}
    {showContextMenu && (
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]"
        style={{
          left: contextMenuPosition.x,
          top: contextMenuPosition.y,
        }}
        onMouseLeave={() => setShowContextMenu(false)}
      >
        <button
          onClick={handleShowTableDescription}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        >
          📋 Descrição da Mesa
        </button>
      </div>
    )}
    </>
  );
};

export default TableOrderDialog;
