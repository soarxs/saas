import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { PaymentMethod } from '../types';

interface SalesKeyboardShortcutsProps {
  onConfirmSale?: () => void;
  onCancelSale?: () => void;
  onClearCart?: () => void;
  onPaymentMethod?: (method: PaymentMethod) => void;
  onAddToCart?: (productId?: string) => void;
  onRemoveFromCart?: (productId?: string) => void;
  onNextProduct?: () => void;
  onPreviousProduct?: () => void;
  onSearch?: () => void;
  onPrint?: () => void;
  cart?: any[];
  selectedProductIndex?: number;
  products?: any[];
  isModalOpen?: boolean;
  enabled?: boolean; // Novo: controla se o hook está ativo
  allowedViews?: string[]; // Novo: views onde os atalhos devem funcionar
  currentView?: string; // Novo: view atual
}

export const useSalesKeyboardShortcuts = ({
  onConfirmSale,
  onCancelSale,
  onClearCart,
  onPaymentMethod,
  onAddToCart,
  onRemoveFromCart,
  onNextProduct,
  onPreviousProduct,
  onSearch,
  onPrint,
  cart = [],
  selectedProductIndex = 0,
  products = [],
  isModalOpen = false,
  enabled = true,
  allowedViews = ['sales'],
  currentView = ''
}: SalesKeyboardShortcutsProps) => {
  const selectedIndexRef = useRef(selectedProductIndex);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // BLOQUEIO UNIVERSAL - Verificações críticas
    
    // 1. Verificar se o hook está habilitado
    if (!enabled) {
      return;
    }

    // 2. Verificar se a view atual está permitida
    if (allowedViews.length > 0 && !allowedViews.includes(currentView)) {
      return;
    }

    // 3. Ignorar se estiver digitando em um input
    const isInput = event.target instanceof HTMLInputElement ||
                   event.target instanceof HTMLTextAreaElement ||
                   event.target instanceof HTMLSelectElement;
    
    // Atalhos que funcionam mesmo em inputs
    const globalShortcuts = ['F1', 'F2', 'F3', 'F4', 'F5', 'F9', 'F10', 'F11', 'F12', 'Escape'];
    
    if (isInput && !globalShortcuts.includes(event.key)) {
      return;
    }

    // F2 - Confirmar venda (principal atalho solicitado)
    if (event.key === 'F2') {
      event.preventDefault();
      if (onConfirmSale) {
        onConfirmSale();
        toast.success('✅ Venda confirmada - F2', { duration: 2000 });
      }
      return;
    }

    // Enter - Confirmar venda
    if (event.key === 'Enter' && !event.ctrlKey) {
      event.preventDefault();
      if (onConfirmSale) {
        onConfirmSale();
        toast.success('✅ Venda confirmada - Enter', { duration: 2000 });
      }
      return;
    }

    // Escape - Cancelar
    if (event.key === 'Escape') {
      event.preventDefault();
      if (onCancelSale) {
        onCancelSale();
        toast.info('❌ Venda cancelada - Esc', { duration: 1500 });
      }
      return;
    }

    // F12 - Limpar carrinho
    if (event.key === 'F12') {
      event.preventDefault();
      if (onClearCart) {
        onClearCart();
        toast.info('🗑️ Carrinho limpo - F12', { duration: 1500 });
      }
      return;
    }

    // Atalhos numéricos para formas de pagamento
    if (!isInput && onPaymentMethod) {
      const paymentMap: {[key: string]: PaymentMethod} = {
        '1': 'dinheiro',
        '2': 'debito', 
        '3': 'credito',
        '4': 'pix',
        '5': 'cortesia'
      };
      
      if (paymentMap[event.key]) {
        event.preventDefault();
        onPaymentMethod(paymentMap[event.key]);
        toast.success(`💳 ${paymentMap[event.key].toUpperCase()} - Tecla ${event.key}`, { duration: 1500 });
        return;
      }
    }

    // Setas para navegar entre produtos
    if (!isInput && products.length > 0) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        selectedIndexRef.current = Math.min(selectedIndexRef.current + 1, products.length - 1);
        if (onNextProduct) {
          onNextProduct();
        }
        toast.info(`➡️ Produto ${selectedIndexRef.current + 1}/${products.length}`, { duration: 1000 });
        return;
      }
      
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        selectedIndexRef.current = Math.max(selectedIndexRef.current - 1, 0);
        if (onPreviousProduct) {
          onPreviousProduct();
        }
        toast.info(`⬅️ Produto ${selectedIndexRef.current + 1}/${products.length}`, { duration: 1000 });
        return;
      }
    }

    // Atalhos para carrinho
    if (!isInput) {
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        if (onAddToCart) {
          onAddToCart();
          toast.success('➕ Adicionado ao carrinho - +', { duration: 1000 });
        }
        return;
      }
      
      if (event.key === '-') {
        event.preventDefault();
        if (onRemoveFromCart) {
          onRemoveFromCart();
          toast.success('➖ Removido do carrinho - -', { duration: 1000 });
        }
        return;
      }
    }

    // F9 - Nova venda
    if (event.key === 'F9') {
      event.preventDefault();
      if (onClearCart) {
        onClearCart();
        toast.success('🛒 Nova venda iniciada - F9', { duration: 1500 });
      }
      return;
    }

    // F10 - Imprimir
    if (event.key === 'F10') {
      event.preventDefault();
      if (onPrint) {
        onPrint();
        toast.success('🖨️ Imprimindo - F10', { duration: 1500 });
      }
      return;
    }

    // F11 - Buscar
    if (event.key === 'F11') {
      event.preventDefault();
      if (onSearch) {
        onSearch();
        toast.success('🔍 Busca ativada - F11', { duration: 1500 });
      }
      return;
    }

    // Ctrl + Enter - Confirmação rápida
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      if (onConfirmSale) {
        onConfirmSale();
        toast.success('✅ Venda confirmada - Ctrl+Enter', { duration: 2000 });
      }
      return;
    }

  }, [onConfirmSale, onCancelSale, onClearCart, onPaymentMethod, onAddToCart, onRemoveFromCart, onNextProduct, onPreviousProduct, onSearch, onPrint, cart, products]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled, allowedViews, currentView]);

  return {
    selectedIndex: selectedIndexRef.current
  };
};


