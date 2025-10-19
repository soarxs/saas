
import { useState, useEffect } from 'react';
import { useSalesStore } from '../store/salesStore';
import { useStore } from '../store/useStore';
import { PaymentMethod, ProductCategory } from '../types';
import { toast } from 'sonner';
import CategoryFilter from './CategoryFilter';
import ProductGrid from './ProductGrid';
import CartSidebar from './CartSidebar';
import ProductCodeInput from './ProductCodeInput';
import ShiftWarning from './ShiftWarning';
import { useSalesKeyboardShortcuts } from '../hooks/useSalesKeyboardShortcuts';

const SalesInterface = () => {
  const {
    products,
    currentShift,
    currentUser
  } = useStore();

  const {
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    completeSale,
    getCartTotal
  } = useSalesStore();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [showProductCode, setShowProductCode] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // Se não houver turno ativo, mostrar aviso
  if (!currentShift?.isActive) {
    return <ShiftWarning />;
  }

  const handleAddToCart = (product: any, quantity = 1) => {
    if (!currentShift?.isActive) {
      toast.error('É necessário abrir um turno para adicionar produtos');
      return;
    }
    addToCart(product, quantity);
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (cart.length > 0) {
      handleCompleteSale(method);
    }
  };

  const handleCompleteSale = (selectedPaymentMethod?: PaymentMethod) => {
    if (cart.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    if (!currentShift?.isActive) {
      toast.error('É necessário abrir um turno para realizar vendas');
      return;
    }

    const finalPaymentMethod = selectedPaymentMethod || paymentMethod;
    
    // Chamar completeSale diretamente do salesStore
    completeSale(finalPaymentMethod, 0, 'value', 0); // Balcão
    
    setPaymentMethod('dinheiro');
    toast.success('Venda realizada com sucesso!');
    console.log('Venda do balcão finalizada:', {
      paymentMethod: finalPaymentMethod,
      total: getCartTotal(),
      items: cart.length
    });
  };

  const handleCancelSale = () => {
    clearCart();
    toast.info('Venda cancelada');
  };

  const handleNextProduct = () => {
    const filteredProducts = products.filter(p => 
      selectedCategory === 'all' || p.category === selectedCategory
    );
    setSelectedProductIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
  };

  const handlePreviousProduct = () => {
    setSelectedProductIndex(prev => Math.max(prev - 1, 0));
  };

  const handleAddSelectedProduct = () => {
    const filteredProducts = products.filter(p => 
      selectedCategory === 'all' || p.category === selectedCategory
    );
    if (filteredProducts[selectedProductIndex]) {
      handleAddToCart(filteredProducts[selectedProductIndex]);
    }
  };

  const handleRemoveLastProduct = () => {
    if (cart.length > 0) {
      const lastProduct = cart[cart.length - 1];
      removeFromCart(lastProduct.productId);
    }
  };

  const handleSearchFocus = () => {
    const searchInput = document.querySelector('input[placeholder*="buscar"], input[placeholder*="Buscar"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handlePrintReceipt = () => {
    toast.info('Funcionalidade de impressão em desenvolvimento');
  };

  // Configurar atalhos de teclado para vendas
  useSalesKeyboardShortcuts({
    onConfirmSale: handleCompleteSale,
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
    products: products.filter(p => selectedCategory === 'all' || p.category === selectedCategory)
  });

  const cartTotal = getCartTotal();

  return (
    <div className="h-full flex">
      {/* Products Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        <ProductGrid 
          products={products}
          selectedCategory={selectedCategory}
          onProductSelect={handleAddToCart}
        />
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        cart={cart}
        discount={0}
        discountType="value"
        cartTotal={cartTotal}
        onQuantityUpdate={updateCartQuantity}
        onItemRemove={removeFromCart}
        onCartClear={clearCart}
        onDiscountChange={() => {}} // Não usado mais
        onDiscountTypeChange={() => {}} // Não usado mais
        onPaymentSelect={handlePaymentSelect}
        onCompleteSale={() => handleCompleteSale()}
        onKeyDown={() => {}} // Tratado globalmente agora
      />

      <ProductCodeInput 
        onProductAdd={handleAddToCart}
        isVisible={showProductCode}
        onToggle={() => setShowProductCode(!showProductCode)}
      />
    </div>
  );
};

export default SalesInterface;
