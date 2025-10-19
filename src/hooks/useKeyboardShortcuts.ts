import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcutsProps {
  onNavigate: (view: string) => void;
  onSearch: () => void;
  onNewSale: () => void;
  onPrint: () => void;
  onHelp: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onAddToCart?: () => void;
  onRemoveFromCart?: () => void;
  onPaymentMethod?: (method: string) => void;
  enabled?: boolean; // Novo: controla se o hook está ativo
  allowedViews?: string[]; // Novo: views onde os atalhos devem funcionar
  currentView?: string; // Novo: view atual
}

export const useKeyboardShortcuts = ({
  onNavigate,
  onSearch,
  onNewSale,
  onPrint,
  onHelp,
  onConfirm,
  onCancel,
  onNext,
  onPrevious,
  onAddToCart,
  onRemoveFromCart,
  onPaymentMethod,
  enabled = true,
  allowedViews = [],
  currentView = ''
}: KeyboardShortcutsProps) => {
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

    // 3. Ignorar se estiver digitando em um input (exceto para atalhos específicos)
    const isInput = event.target instanceof HTMLInputElement ||
                   event.target instanceof HTMLTextAreaElement ||
                   event.target instanceof HTMLSelectElement;
    
    // Atalhos que funcionam mesmo em inputs
    const globalShortcuts = ['F1', 'F2', 'F3', 'F4', 'F5', 'F9', 'F10', 'F11', 'F12', 'Escape'];
    
    if (isInput && !globalShortcuts.includes(event.key)) {
      return;
    }

    // Verificar se estamos em uma venda ativa (modal de pagamento aberto)
    const isInActiveSale = document.querySelector('[data-payment-context]') !== null ||
                          document.querySelector('[data-counter-sale]') !== null;

    // F1-F12 - Atalhos principais
    switch (event.key) {
      case 'F1':
        event.preventDefault();
        onHelp();
        toast.info('🆘 Ajuda - Atalhos disponíveis', { duration: 2000 });
        break;
      case 'F2':
        event.preventDefault();
        if (onConfirm) {
          onConfirm();
          toast.success('✅ Confirmado!', { duration: 1500 });
        } else {
          onNavigate('sales');
          toast.success('📋 Mesas - F2', { duration: 1500 });
        }
        break;
      case 'F3':
        event.preventDefault();
        onNavigate('sales-view');
        toast.success('📄 Vendas - F3', { duration: 1500 });
        break;
      case 'F4':
        event.preventDefault();
        onNavigate('products');
        toast.success('📦 Produtos - F4', { duration: 1500 });
        break;
      case 'F5':
        event.preventDefault();
        onNavigate('reports');
        toast.success('📊 Relatórios - F5', { duration: 1500 });
        break;
      case 'F9':
        event.preventDefault();
        onNewSale();
        toast.success('🛒 Nova Venda - F9', { duration: 1500 });
        break;
      case 'F10':
        event.preventDefault();
        onPrint();
        toast.success('🖨️ Imprimir - F10', { duration: 1500 });
        break;
      case 'F11':
        event.preventDefault();
        onSearch();
        toast.success('🔍 Buscar - F11', { duration: 1500 });
        break;
      case 'F12':
        event.preventDefault();
        // Atalho para limpar carrinho
        if (onCancel) {
          onCancel();
          toast.info('🗑️ Carrinho limpo - F12', { duration: 1500 });
        }
        break;
    }

    // Ctrl + teclas - Apenas ações essenciais (sem navegação)
    if (event.ctrlKey) {
      switch (event.key) {
        case 'n':
          event.preventDefault();
          onNewSale();
          toast.success('🛒 Nova Venda - Ctrl+N', { duration: 1500 });
          break;
        case 'p':
          event.preventDefault();
          onPrint();
          toast.success('🖨️ Imprimir - Ctrl+P', { duration: 1500 });
          break;
        case 'f':
          event.preventDefault();
          onSearch();
          toast.success('🔍 Buscar - Ctrl+F', { duration: 1500 });
          break;
        case 'Enter':
          event.preventDefault();
          if (onConfirm) {
            onConfirm();
            toast.success('✅ Confirmado - Ctrl+Enter', { duration: 1500 });
          }
          break;
        // Remover navegação com números - apenas mesas com 2 dígitos
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          // Não fazer nada - deixar para o sistema de mesas
          // Não chamar preventDefault para permitir que useTableNavigation processe
          break;
      }
    }

    // Setas - Navegação
    if (event.key === 'ArrowRight' && onNext) {
      event.preventDefault();
      onNext();
      toast.info('➡️ Próximo', { duration: 1000 });
    }
    
    if (event.key === 'ArrowLeft' && onPrevious) {
      event.preventDefault();
      onPrevious();
      toast.info('⬅️ Anterior', { duration: 1000 });
    }

    // Enter - Confirmação
    if (event.key === 'Enter' && !event.ctrlKey && onConfirm) {
      event.preventDefault();
      onConfirm();
      toast.success('✅ Confirmado - Enter', { duration: 1500 });
    }

    // Escape - Cancelar/Fechar
    if (event.key === 'Escape') {
      event.preventDefault();
      if (onCancel) {
        onCancel();
        toast.info('❌ Cancelado - Esc', { duration: 1500 });
      } else {
        // Fechar qualquer modal aberto
        const modals = document.querySelectorAll('[role="dialog"]');
        if (modals.length > 0) {
          const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
          if (closeButton) {
            closeButton.click();
          }
        }
        toast.info('❌ Modal fechado - Esc', { duration: 1000 });
      }
    }

    // Atalhos numéricos para formas de pagamento (apenas durante venda ativa)
    if (!isInput && onPaymentMethod && isInActiveSale) {
      const paymentMap: {[key: string]: string} = {
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
      }
    }

    // Atalhos para carrinho (apenas durante venda ativa)
    if (!isInput && isInActiveSale) {
      if (event.key === '+' && onAddToCart) {
        event.preventDefault();
        onAddToCart();
        toast.success('➕ Adicionado ao carrinho - +', { duration: 1000 });
      }
      
      if (event.key === '-' && onRemoveFromCart) {
        event.preventDefault();
        onRemoveFromCart();
        toast.success('➖ Removido do carrinho - -', { duration: 1000 });
      }
    }

  }, [onNavigate, onSearch, onNewSale, onPrint, onHelp, onConfirm, onCancel, onNext, onPrevious, onAddToCart, onRemoveFromCart, onPaymentMethod]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled, allowedViews, currentView]);
};

// Hook para mostrar atalhos disponíveis
export const useShowShortcuts = () => {
  const showShortcuts = () => {
    toast.info(
      `⌨️ ATALHOS DE VENDAS:

🛒 VENDAS (PRINCIPAL):
• F2 = Confirmar venda | Enter = Confirmar/Próximo
• 1-5 = Pagamento (1=Dinheiro, 2=Débito, 3=Crédito, 4=PIX, 5=Cortesia)
• + = Adicionar produto | - = Remover produto
• Setas = Navegar entre produtos | F12 = Limpar carrinho

📋 ABRIR MESAS RAPIDAMENTE:
• Ctrl+01 = Abrir Mesa 1 | Ctrl+02 = Abrir Mesa 2 | Ctrl+03 = Abrir Mesa 3
• Ctrl+04 = Abrir Mesa 4 | Ctrl+05 = Abrir Mesa 5 | Ctrl+06 = Abrir Mesa 6
• Ctrl+07 = Abrir Mesa 7 | Ctrl+08 = Abrir Mesa 8 | Ctrl+09 = Abrir Mesa 9
• Ctrl+10 = Abrir Mesa 10 | Ctrl+11 = Abrir Mesa 11 | Ctrl+12 = Abrir Mesa 12
• Ctrl+13 = Abrir Mesa 13 | Ctrl+14 = Abrir Mesa 14 | Ctrl+15 = Abrir Mesa 15
• Ctrl+16 = Abrir Mesa 16 | Ctrl+17 = Abrir Mesa 17 | Ctrl+18 = Abrir Mesa 18
• Ctrl+19 = Abrir Mesa 19 | Ctrl+20 = Abrir Mesa 20

🔧 AÇÕES GERAIS:
• F1 = Ajuda | F9 = Nova venda | F10 = Imprimir | F11 = Buscar
• Esc = Cancelar | Ctrl+Enter = Confirmação rápida

💡 DICA: Digite 2 dígitos após Ctrl para abrir mesas (Ctrl+01, Ctrl+02, etc.)`,
      { duration: 12000 }
    );
  };

  return showShortcuts;
};
