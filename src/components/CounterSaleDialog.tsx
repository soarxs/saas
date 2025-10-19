import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSalesStore } from '../store/salesStore';
import { useStore } from '../store/useStore';
import { PaymentMethod, ProductCategory } from '../types';
import { useProductSearch } from '../hooks/useProductSearch';
import { useSalesKeyboardShortcuts } from '../hooks/useSalesKeyboardShortcuts';
import { toast } from 'sonner';
import QuickPaymentButtons from './QuickPaymentButtons';
import OperationLoading from './OperationLoading';
import ProductAddedNotification from './ProductAddedNotification';
import { Printer, ShoppingCart, X, Search, Plus, Minus, Trash2 } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface CounterSaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CounterSaleDialog = ({ isOpen, onClose }: CounterSaleDialogProps) => {
  const { cart, getCartTotal, clearCart, completeSale, addToCart, removeFromCart, updateCartQuantity } = useSalesStore();
  const { currentShift, currentUser, products } = useStore();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const cartScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para baixo quando novos itens são adicionados ao carrinho
  useEffect(() => {
    if (cartScrollRef.current && cart.length) {
      cartScrollRef.current.scrollTop = cartScrollRef.current.scrollHeight;
    }
  }, [cart.length]);

  const handlePaymentSelect = (method: PaymentMethod) => {
    if (!currentShift?.isActive) {
      toast.error('É necessário abrir um turno para realizar vendas');
      return;
    }

    if (cart.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    setIsProcessingPayment(true);
    
    // Simular processamento do pagamento
    setTimeout(() => {
      // Completar a venda
      const sale = completeSale(method, 0, 'value', 0); // Mesa 0 = Balcão
      
      if (sale) {
        toast.success('Venda realizada com sucesso!');
        setShowPaymentOptions(false);
        setShowPrintDialog(true);
      }
      setIsProcessingPayment(false);
    }, 1500);
  };

  const handlePrintReceipt = () => {
    // Aqui seria implementada a impressão
    console.log('Imprimindo cupom...');
    toast.success('Cupom impresso!');
    setShowPrintDialog(false);
    clearCart(); // Limpar carrinho após impressão
    onClose();
  };

  const handleSkipPrint = () => {
    setShowPrintDialog(false);
    clearCart(); // Limpar carrinho mesmo sem imprimir
    onClose();
  };

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

  const handleAddProductToCart = (product: any) => {
    if (!currentShift?.isActive) {
      toast.error('É necessário abrir um turno para adicionar produtos');
      return;
    }
    
    addToCart(product);
    setLastAddedProduct(product.name);
    setShowNotification(true);
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const handleConfirmSale = () => {
    if (cart.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }
    setShowPaymentOptions(true);
  };

  const handleCancelSale = () => {
    clearCart();
    setShowPaymentOptions(false);
    setShowPrintDialog(false);
    onClose();
  };

  const handleNextProduct = () => {
    setSelectedProductIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
  };

  const handlePreviousProduct = () => {
    setSelectedProductIndex(prev => Math.max(prev - 1, 0));
  };

  const handleAddSelectedProduct = () => {
    if (!currentShift?.isActive) {
      toast.error('É necessário abrir um turno para adicionar produtos');
      return;
    }
    
    if (filteredProducts[selectedProductIndex]) {
      handleAddProductToCart(filteredProducts[selectedProductIndex]);
    }
  };

  const handleRemoveLastProduct = () => {
    if (cart.length > 0) {
      const lastProduct = cart[cart.length - 1];
      removeFromCart(lastProduct.productId);
    }
  };

  const handleSearchFocus = () => {
    const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };


  // Configurar atalhos de teclado para vendas
  useSalesKeyboardShortcuts({
    onConfirmSale: handleConfirmSale,
    onCancelSale: handleCancelSale,
    onClearCart: clearCart,
    onPaymentMethod: handlePaymentSelect,
    onAddToCart: handleAddSelectedProduct,
    onRemoveFromCart: handleRemoveLastProduct,
    onNextProduct: handleNextProduct,
    onPreviousProduct: handlePreviousProduct,
    onSearch: handleSearchFocus,
    onPrint: handlePrintReceipt,
    cart,
    selectedProductIndex,
    products: filteredProducts,
    isModalOpen: isOpen
  });

  const cartTotal = getCartTotal();

  return (
    <div data-counter-sale="true">
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col bg-gradient-to-br from-green-50 to-white">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                Venda no Balcão
                {!currentShift?.isActive && (
                  <div className="ml-4 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full border border-red-200">
                    ⚠️ Turno fechado
                  </div>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
            {/* Coluna de Produtos */}
            <div className="flex flex-col border-r pr-4 overflow-hidden">
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar: X-EGG, 01, frango bacon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={(value: ProductCategory | 'all') => setSelectedCategory(value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <Card
                      key={product.id}
                      className={`card-modern transition-all duration-200 ${
                        !currentShift?.isActive 
                          ? 'cursor-not-allowed opacity-50 bg-gray-100' 
                          : `cursor-pointer hover:shadow-md ${
                              index === selectedProductIndex 
                                ? 'ring-2 ring-green-500 bg-green-50 border-green-300' 
                                : 'hover:bg-gray-50'
                            }`
                      }`}
                      onClick={() => {
                        setSelectedProductIndex(index);
                        handleAddProductToCart(product);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-gray-800 truncate">{product.name}</h3>
                              {index === selectedProductIndex && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  Selecionado
                                </Badge>
                              )}
                            </div>
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
                            {!product.available && (
                              <Badge variant="destructive" className="mt-1 text-xs">Indisponível</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum produto encontrado.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna do Carrinho e Pagamento */}
            <div className="flex flex-col pl-4 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  Carrinho
                </h3>
                <div className="text-sm text-gray-600">
                  {cart.length} itens
                </div>
              </div>
              
              <div ref={cartScrollRef} className="flex-grow overflow-y-auto pr-2 space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">Carrinho vazio</p>
                    <p className="text-sm">Adicione produtos para começar</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <Card key={item.productId} className="card-modern border-l-4 border-l-green-500">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-800 truncate">{item.productName}</p>
                            <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)} cada</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-green-200 hover:bg-green-50"
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3 text-green-600" />
                            </Button>
                            <span className="font-bold w-8 text-center text-gray-800">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-green-200 hover:bg-green-50"
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="text-sm font-bold text-green-600">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                  <div className="flex justify-between items-center text-2xl font-bold mb-4">
                    <span className="text-gray-700">Total:</span>
                    <span className="text-green-600 font-bold">R$ {cartTotal.toFixed(2)}</span>
                  </div>

                  {!showPaymentOptions && !showPrintDialog && (
                    <Button
                      onClick={() => setShowPaymentOptions(true)}
                      className="w-full btn-primary-modern h-14 text-lg"
                      disabled={cart.length === 0 || !currentShift?.isActive}
                    >
                      Finalizar Venda (F2)
                    </Button>
                  )}

                  {showPaymentOptions && !showPrintDialog && (
                    <div className="space-y-6" data-payment-context="true">
                      <h4 className="text-xl font-bold text-gray-800 text-center">Selecione a forma de pagamento:</h4>
                      <QuickPaymentButtons onPaymentSelect={handlePaymentSelect} />
                      <Button variant="outline" onClick={() => setShowPaymentOptions(false)} className="w-full btn-secondary-modern h-12">
                        Voltar ao Carrinho (Esc)
                      </Button>
                    </div>
                  )}

                  {showPrintDialog && (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Printer className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xl font-bold text-gray-800">Venda concluída!</p>
                      <div className="space-y-3">
                        <Button onClick={handlePrintReceipt} className="w-full btn-primary-modern h-14 text-lg">
                          <Printer className="h-6 w-6 mr-3" /> Imprimir Cupom (Enter)
                        </Button>
                        <Button variant="outline" onClick={handleSkipPrint} className="w-full btn-secondary-modern h-12 text-lg">
                          Não Imprimir / Nova Venda (Esc)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de opções de pagamento */}
      <Dialog open={showPaymentOptions} onOpenChange={setShowPaymentOptions}>
        <DialogContent data-payment-context="true">
          <DialogHeader>
            <DialogTitle>Forma de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <QuickPaymentButtons onPaymentSelect={handlePaymentSelect} />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowPaymentOptions(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de impressão */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Cupom?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Deseja imprimir o cupom da venda?
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleSkipPrint}>
              Não Imprimir
            </Button>
            <Button onClick={handlePrintReceipt}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Loading de processamento de pagamento */}
      <OperationLoading
        isVisible={isProcessingPayment}
        operation="Processando Pagamento"
        onComplete={() => setIsProcessingPayment(false)}
        onError={() => setIsProcessingPayment(false)}
        duration={1500}
      />
      
      {/* Notificação de produto adicionado */}
      <ProductAddedNotification
        productName={lastAddedProduct}
        isVisible={showNotification}
        onComplete={() => setShowNotification(false)}
      />
    </div>
  );
};

export default CounterSaleDialog;
